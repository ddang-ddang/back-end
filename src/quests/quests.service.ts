import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Connection, Repository, getManager, getRepository } from 'typeorm';
import { Player } from '../players/entities/player.entity';
import { FeedRepository } from '../feeds/feeds.repository';
import { Complete } from './entities/complete.entity';
import { Region } from './entities/region.entity';
import { Achievement } from '../players/entities/achievement.entity';
import { Mission } from '../players/entities/mission.entity';
import { CreateFeedDto } from '../feeds/dto/create-feed.dto';
import { QuestRepository } from './repositories/quest.repository';
import { QuestsException } from './quests.exception';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(Complete)
    private readonly completes: Repository<Complete>,
    @InjectRepository(Region)
    private readonly regions: Repository<Region>,
    @InjectRepository(Achievement)
    private readonly achievements: Repository<Achievement>,
    @InjectRepository(Mission)
    private readonly missions: Repository<Mission>,
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
    @InjectRepository(FeedRepository)
    private readonly feedRepository: FeedRepository,
    private readonly quests: QuestRepository,
    private readonly exceptions: QuestsException,
    private readonly connection: Connection
  ) {}

  private readonly logger = new Logger(QuestsService.name);

  /* 타임어택 또는 몬스터 대결 퀘스트 완료 요청 */
  async questComplete(
    questId: number,
    playerId: number,
    createFeedDto?: CreateFeedDto
  ) {
    const [quest, isCompleted] = await Promise.all([
      this.quests.findOne({ id: questId }),
      this.completes.findOne({ questId, playerId }),
    ]);
    if (!quest) this.exceptions.notFoundQuest();
    if (isCompleted) this.exceptions.alreadyCompleted();

    const questType = quest.type;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();

    const feedsRepository =
      queryRunner.manager.getCustomRepository(FeedRepository);
    await queryRunner.startTransaction();

    if (questType === 'feed' && !createFeedDto.content)
      this.exceptions.missingContent();

    try {
      if (questType === 'feed') {
        const { content, img } = createFeedDto;
        await feedsRepository.feedQuest(questId, playerId, content, img);
      }
      const complete = this.completes.create({ questId, playerId });
      await queryRunner.manager.save(complete);
      /* 플레이어 레벨 달성 로직 */
      // 1. 플레이어 정보 찾기 (포인트 확인)
      const player = await this.players.findOne({
        select: ['points'],
        where: { id: playerId },
      });
      // 2. 플레이어 포인트에 획득한 포인트 추가
      const points = player.points + quest.reward;
      // 3. 전체 포인트로 레벨 계산
      let level = 1;
      let expPoints = points;
      while (expPoints >= level * 100) {
        expPoints -= level * 100;
        level += 1;
      }
      expPoints = Math.round(expPoints / level);
      // 4. 플레이어 포인트, 레벨, 경험치 업데이트
      await queryRunner.manager.update(Player, playerId, {
        level,
        expPoints,
        points,
      });
      /* 플레이어 업적 부여 로직 */
      // 1. 현재 수행한 타입의 완료 횟수 조회
      const countCompletes = await getManager()
        .createQueryBuilder(Complete, 'complete')
        .select(['quest.type', 'count(quest.type) as cnt'])
        .leftJoin('complete.quest', 'quest')
        .where('complete.playerId = :playerId and quest.type = :questType', {
          playerId,
          questType,
        })
        .groupBy('quest.type')
        .getRawOne();
      // 2. 해당하는 미션 찾아서 업적 추가
      const mission = await this.missions.findOne({
        where: {
          setGoals: countCompletes ? +countCompletes.cnt + 1 : 1,
          type: questType,
        },
      });
      if (mission) {
        const achievement = this.achievements.create({ mission, playerId });
        await queryRunner.manager.save(achievement);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.exceptions.cantCompleteQuest();
    } finally {
      await queryRunner.release();
    }
    return { ok: true };
  }

  /*
   * 퀘스트 조회 프로세스: player의 좌표 값으로 region 테이블 조회
   * DB에 데이터 있으면, 퀘스트 + 완료여부 조인해서 응답
   * DB에 데이터 없으면, 지역(동) + 퀘스트 데이터 DB에 생성하고 응답
   */

  /* 위도(lat), 경도(lng) 기준으로 우리 지역(동) 퀘스트 조회 */
  async getAll(lat: number, lng: number, playerId?: number) {
    let allQuests;

    console.time('getAll');
    console.time('Kakao API - getAddressName');
    const kakaoAddress = await this.getAddressName(lat, lng);
    console.timeEnd('Kakao API - getAddressName');
    if (!kakaoAddress) this.exceptions.notFoundKakaoAddress();

    const date = new Date().toDateString();
    /* 오늘 우리 지역(동) 퀘스트가 있으면 조회, 없으면 생성해서 조회 */
    let region = await getRepository(Region)
      .createQueryBuilder('region')
      .where(
        'region.date = :date AND region.regionSi = :si AND region.regionGu = :gu AND region.regionDong = :dong',
        {
          date,
          si: kakaoAddress.regionSi,
          gu: kakaoAddress.regionGu,
          dong: kakaoAddress.regionDong,
        }
      )
      .getOne();

    if (region) {
      allQuests = await this.quests.findAllWithCompletes(region, playerId);
      console.timeEnd('getAll');
      return {
        ok: true,
        currentRegion: region,
        rows: allQuests,
      };
    }

    // 지역(동), 좌표 값으로 퀘스트 만들기
    console.time('Juso API - getRegionData');
    const regionData = await this.getRegionData(kakaoAddress);
    if (!regionData) this.exceptions.notFoundPublicAddress();
    const { totalCount, pageCount } = regionData;
    console.timeEnd('Juso API - getRegionData');
    console.time('createQuests');
    const quests = await this.createQuests(totalCount, pageCount, kakaoAddress);
    console.timeEnd('createQuests');

    // region, quest 생성 트랜잭션 처리 (promise.all 트랜잭션 처리 추가 학습 필요)
    try {
      // 지역(동) 데이터 DB에 추가
      region = this.regions.create({
        date,
        ...kakaoAddress,
        totalCount,
        pageCount,
      });
      await this.regions.save(region);
    } catch (error) {
      this.exceptions.cantCreateRegion();
    }

    // 퀘스트 데이터 DB에 추가
    await Promise.all([
      ...quests.map((quest) => {
        return this.quests.save({
          ...quest,
          region,
        });
      }),
    ]);

    const { regionSi, regionGu, regionDong } = region;
    allQuests = await this.quests.findAllWithCompletes(region, playerId);
    console.timeEnd('getAll');
    return {
      ok: true,
      currentRegion: { regionSi, regionGu, regionDong },
      rows: allQuests,
    };
  }

  /* 주소 데이터 얻어오기 */
  /**
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @returns {object} - { 시, 구, 동 }
   */
  async getAddressName(lat, lng) {
    try {
      const res = await axios.get(
        `${process.env.MAP_KAKAO_BASE_URL}/geo/coord2address.json?x=${lng}&y=${lat}&input_coord=WGS84`,
        {
          headers: {
            // Accept: '/',
            Accept: '*/*',
            // 'content-type': 'application/json;charset=UTF-8',
            // 'Access-Control-Allow-Origin': '*',
            Authorization: `KakaoAK ${process.env.MAP_KAKAO_API_KEY}`,
          },
        }
      );

      const { address } = res.data.documents[0];
      const regionSi: string = address.region_1depth_name;
      const regionGu: string = address.region_2depth_name;
      const regionDong: string = address.region_3depth_name;

      return { regionSi, regionGu, regionDong };
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  /* 특정 동의 개요 얻어오기 */
  /**
   * @param {object} kakaoAddress - { regionSi: string, regionGu: string, regionDong: string }
   * @returns {object} - { 전체 주소 개수, 페이지수 }
   */
  async getRegionData(kakaoAddress) {
    const address = `${kakaoAddress.regionSi} ${kakaoAddress.regionGu} ${kakaoAddress.regionDong}`;
    try {
      const res = await axios.get(
        `${
          process.env.MAP_JUSO_BASE_URL
        }?currentPage=1&countPerPage=10&keyword=${encodeURI(
          address
        )}&confmKey=${process.env.MAP_JUSO_CONFIRM_KEY}&resultType=json`
      );
      const { totalCount } = res.data.results.common;
      const pageCount = Math.ceil(totalCount / 100);
      return { totalCount, pageCount };
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  /* 퀘스트 만들기 */
  /**
   * @param {number} totalCount - 전체 주소 개수
   * @param {number} pageCount - 전체 페이지 수
   * @param {object} kakaoAddress - { regionSi: string, regionGu: string, regionDong: string }
   * @returns {array} - [ 퀘스트 ]
   */
  async createQuests(totalCount, pageCount, kakaoAddress) {
    const address = `${kakaoAddress.regionSi} ${kakaoAddress.regionGu} ${kakaoAddress.regionDong}`;
    const addrIndex = [];
    for (let curPage = 1; curPage < pageCount; curPage++) {
      const idx =
        curPage !== pageCount
          ? Math.floor(Math.random() * 100) + 1
          : Math.floor(Math.random() * (totalCount % 100)) + 1;
      addrIndex.push({ curPage: curPage, idx });
    }

    /* 각 페이지마다 랜덤 idx로 상세주소 얻기 */
    console.time('Juso API - Get all at once');
    const rawRoadAddrs = await Promise.all([
      ...addrIndex.map(({ curPage, idx }) =>
        this.getRoadAddress(curPage, address, idx)
      ),
    ]);
    const roadAddrs = rawRoadAddrs.filter((addr) => addr);
    console.timeEnd('Juso API - Get all at once');

    let questsCoords = [];
    const limits = 20; // kakaoAPI 429 에러(Too Many Requests) 방지를 위해 요청당 호출수 제한

    /* 상세주소에 해당하는 좌표값 얻기 */
    for (let begin = 0; begin < pageCount; begin += limits) {
      console.time('Kakao API - getCoords');
      const end = begin + limits < pageCount ? begin + limits : pageCount;
      const roadAddrsSubset = roadAddrs.slice(begin, end);
      questsCoords = [
        ...questsCoords,
        ...(await Promise.all([
          ...roadAddrsSubset.map((roadAddr) => this.getCoords(roadAddr)),
        ])),
      ];
      console.timeEnd('Kakao API - getCoords');
    }

    const curr = new Date();
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
    const today = new Date(utc + 9 * 60 * 60 * 1000);
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    let type, title, description, reward, difficulty, timeUntil;
    let category;
    let hour;

    /* 좌표별로 퀘스트 만들기 */
    return questsCoords.map((coords) => {
      category = Math.floor(Math.random() * 9) + 1;
      switch (category) {
        case 1:
          type = 'time';
          title = '땅땅! 시간이 없어요!';
          hour = 9;
          description = '★주목★ 9시까지 도착시 땅도장 땅땅!';
          difficulty = 1;
          reward = 200;
          timeUntil = new Date(year, month, date, hour);
          break;
        case 2:
          type = 'time';
          title = '2시까지 땅땅!';
          hour = category * 7;
          description = '2시까지 도착해서 땅땅 도장을 받으세요!';
          difficulty = 2;
          reward = 250;
          timeUntil = new Date(year, month, date, hour);
          break;
        case 3:
          type = 'time';
          title = '밤 9시가 되면 문이 땅!';
          hour = category * 7;
          description = '문이 땅 닫히기 전까지 땅땅 도장을 찍어주세요!';
          difficulty = 3;
          reward = 300;
          timeUntil = new Date(year, month, date, hour);
          break;
        case 4:
          description = '이 땅에 남겨질 여러분의 흔적을 환영합니다!';
          type = 'feed';
          title = '땅에 대한 이야기 만땅';
          difficulty = 1;
          reward = 400;
          timeUntil = null;
          break;
        case 5:
          description = '여기가 어떤 땅인지 자유롭게 리뷰를 남겨주세요!';
          type = 'feed';
          title = '이 땅을 추천합니땅';
          difficulty = 2;
          reward = 500;
          timeUntil = null;
          break;
        case 6:
          description = '주변의 무채색 장소를 여러분의 생각으로 채워주세요!';
          type = 'feed';
          title = '땅땅한 오늘의 기분';
          difficulty = 3;
          reward = 600;
          timeUntil = null;
          break;
        case 7:
          type = 'mob';
          title = '땅개비를 이겨라';
          description = '땅개비와의 짜릿한 한판승 어때요?';
          difficulty = 1;
          reward = 900;
          timeUntil = null;
          break;
        case 8:
          type = 'mob';
          title = '땅어가 나타났다';
          description = '땅어를 물리치고 우리 동네를 지켜주세요!';
          difficulty = 2;
          reward = 1200;
          timeUntil = null;
          break;
        case 9:
          type = 'mob';
          title = '땅수리를 잡아라';
          description = '우리 동네를 어지럽히는 땅수리를 잡으러 가볼까요?';
          difficulty = 3;
          reward = 1500;
          timeUntil = null;
          break;
      }

      return {
        ...coords,
        type,
        title,
        description,
        reward,
        difficulty,
        timeUntil,
      };
    });
  }

  /* 상세주소 얻어오기 */
  /**
   * @param {number} curPage - 현재 페이지 번호
   * @param {string} address - "시 구 동"
   * @param {number} idx - 인덱스(1~100 랜덤)
   * @returns {string} - 상세주소 (ex. 서울특별시 강남구 언주로63길 20(역삼동))
   */
  async getRoadAddress(curPage, address, idx) {
    try {
      const res = await axios.get(
        `${
          process.env.MAP_JUSO_BASE_URL
        }?currentPage=${curPage}&countPerPage=100&keyword=${encodeURI(
          address
        )}&confmKey=${process.env.MAP_JUSO_CONFIRM_KEY}&resultType=json`
      );
      return res.data.results.juso[idx].roadAddr;
    } catch (error) {
      return;
    }
  }

  /* 좌표값 얻어오기 */
  /**
   * @param {string} roadAddr - 상세주소 (ex. 서울특별시 강남구 언주로63길 20(역삼동))
   * @returns {object} - { 위도, 경도 }
   */
  async getCoords(roadAddr) {
    try {
      const res = await axios.get(
        `${
          process.env.MAP_KAKAO_BASE_URL
        }/search/address.json?query=${encodeURI(roadAddr)}`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.MAP_KAKAO_API_KEY}`,
          },
        }
      );
      const lat = res.data.documents[0].y;
      const lng = res.data.documents[0].x;
      return { lat, lng };
    } catch (error) {
      this.logger.error(`getCoords: ${error.message}`);
    }
  }

  /* 특정 퀘스트 조회 */
  async getOne(id: number, playerId?: number) {
    const quest = await this.quests.findOneWithCompletes(id, playerId);
    if (!quest) this.exceptions.notFoundQuest();

    return { ok: true, row: quest };
  }

  /* 어제의 지역(동) 데이터 기반으로 오늘의 새로운 퀘스트 만들기 */
  @Cron('0 0 1 * * *', { timeZone: 'Asia/Seoul' })
  async preCreateQuests() {
    this.logger.verbose('AM 1:00, Create Todays Quests');
    const curr = new Date();
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
    const today = new Date(utc + 9 * 60 * 60 * 1000);
    const todayDate = today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDate = yesterday.toDateString();

    const regions = await this.regions.find({ date: yesterdayDate });

    for (const region of regions) {
      const { regionSi, regionGu, regionDong } = region;
      const isExisted = await this.regions.find({
        date: todayDate,
        regionSi,
        regionGu,
        regionDong,
      });
      if (isExisted.length !== 0) continue;
      const kakaoAddress = {
        regionSi: region.regionSi,
        regionGu: region.regionGu,
        regionDong: region.regionDong,
      };
      const { totalCount, pageCount } = region;
      const quests = await this.createQuests(
        totalCount,
        pageCount,
        kakaoAddress
      );
      const newRegion = this.regions.create({
        date: todayDate,
        ...kakaoAddress,
        totalCount,
        pageCount,
      });
      await this.regions.save(newRegion);

      await Promise.all([
        ...quests.map((quest) => {
          return this.quests.save({
            ...quest,
            region: newRegion,
          });
        }),
      ]);
    }
  }
}
