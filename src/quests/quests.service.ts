import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { Connection, getManager, getRepository, Repository } from 'typeorm';
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
    @InjectRepository(FeedRepository)
    private readonly feedRepository: FeedRepository,
    private readonly quests: QuestRepository,
    private readonly exceptions: QuestsException,
    private readonly connection: Connection
  ) {}

  private readonly logger = new Logger(QuestsService.name);

  async createAchievement(playerId: number, questType: string) {
    /* 완료한 퀘스트 종류별 count */
    const countFeedType = await Complete.createQueryBuilder('complete')
      .select(['quest.type', 'count(quest.type) as cnt'])
      .leftJoin('complete.quest', 'quest')
      .where('complete.playerId = :playerId and quest.type = :questType', {
        playerId,
        questType,
      })
      .groupBy('quest.type')
      .getRawOne();

    const player = await Player.findOne({ id: playerId });

    let added = false;

    /* mission list */
    const missionList = await Mission.find({
      where: { type: questType },
    });

    /* 현재 사용자가 성공한 achievement list */
    const achievementList = await Achievement.find({
      where: { player },
    });

    const userAchievement = [];
    missionList.map((eachMission) => {
      if (Number(countFeedType.cnt) >= eachMission.setGoals) {
        // achievements에 없는 mission의 경우 insert
        userAchievement.push(eachMission);
      }
    });

    userAchievement.map(async (achievement) => {
      const mission = await Mission.findOne({ id: achievement.id });

      const search = await Achievement.find({
        where: {
          mission,
          player,
        },
      });

      if (search.length === 0) {
        const newAchieve = await Achievement.insert({ mission, player });
        console.log(newAchieve);
        if (newAchieve.raw['affectedRows'] > 0) {
          added = true;
        }
      }
    });

    return { countFeedType, missionList, userAchievement, added };
  }

  /* 피드작성 퀘스트 완료 요청 */
  async feedQuest(
    questId: number,
    playerId: number,
    createFeedDto: CreateFeedDto,
    questType: string
  ) {
    const { img, content } = createFeedDto;
    const newFeed = await this.feedRepository.feedQuest(
      questId,
      playerId,
      img,
      content
    );
    const countFeedType = await this.createAchievement(playerId, questType);
    return newFeed;
  }

  /* 타임어택 또는 몬스터 대결 퀘스트 완료 요청 */
  async questComplete(questId: number, playerId: number, questType: string) {
    const [quest, isCompleted] = await Promise.all([
      this.quests.findOne({ id: questId }),
      this.completes.findOne({ questId, playerId }),
    ]);
    if (!quest) this.exceptions.notFoundQuest();
    if (isCompleted) this.exceptions.alreadyCompleted();

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const complete = this.completes.create({ questId, playerId });
      await queryRunner.manager.save(complete);

      // 플레이어가 완료한 퀘스트 type별 횟수 조회 후 업적 부여
      const completes = await getManager()
        .createQueryBuilder(Complete, 'complete')
        .leftJoinAndSelect('complete.quest', 'quest')
        .where('playerId = :id', { id: playerId })
        .getMany();

      // 현재 완료한 퀘스트 타입의 횟수 확인
      const countFor = {};
      completes.forEach((complete) => {
        countFor[complete.quest.type] =
          (countFor[complete.quest.type] || 0) + 1;
      });
      const goals = countFor[questType];

      // 해당하는 미션 찾아서 업적 추가
      const mission = await this.missions.findOne({
        where: {
          setGoals: goals,
          type: `${questType}`,
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
    console.time('카카오API - getAddressName');
    const kakaoAddress = await this.getAddressName(lat, lng);
    console.timeEnd('카카오API - getAddressName');
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
    console.time('주소API - getRegionData');
    const regionData = await this.getRegionData(kakaoAddress);
    if (!regionData) this.exceptions.notFoundPublicAddress();
    const { totalCount, pageCount } = regionData;
    console.timeEnd('주소API - getRegionData');
    console.time('createQuests');
    const quests = await this.createQuests(totalCount, pageCount, kakaoAddress);
    console.timeEnd('createQuests');

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // region, quest 생성 트랜잭션 처리
    try {
      // 지역(동) 데이터 DB에 추가 및 조회
      region = this.regions.create({
        date,
        ...kakaoAddress,
        totalCount,
        pageCount,
      });
      await this.regions.save(region);

      // 퀘스트 데이터 DB에 추가 및 조회
      await Promise.all([
        ...quests.map((quest) => {
          return this.quests.save({
            ...quest,
            region,
          });
        }),
      ]);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.exceptions.cantGetQuests();
    } finally {
      await queryRunner.release();
    }

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
      console.log(error.message);
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
      console.log(error.message);
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
    console.time('주소API - 한번에 불러오기');
    const rawRoadAddrs = await Promise.all([
      ...addrIndex.map(({ curPage, idx }) =>
        this.getRoadAddress(curPage, address, idx)
      ),
    ]);
    const roadAddrs = rawRoadAddrs.filter((addr) => addr);
    console.timeEnd('주소API - 한번에 불러오기');

    let questsCoords = [];
    const limits = 20; // kakaoAPI 429 에러(Too Many Requests) 방지를 위해 요청당 호출수 제한

    /* 상세주소에 해당하는 좌표값 얻기 */
    for (let begin = 0; begin < pageCount; begin += limits) {
      console.time('카카오API - getCoords');
      const end = begin + limits < pageCount ? begin + limits : pageCount;
      const roadAddrsSubset = roadAddrs.slice(begin, end);
      questsCoords = [
        ...questsCoords,
        ...(await Promise.all([
          ...roadAddrsSubset.map((roadAddr) => this.getCoords(roadAddr)),
        ])),
      ];
      console.timeEnd('카카오API - getCoords');
    }

    const today = new Date();
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
          difficulty = 1;
          reward = 250;
          timeUntil = new Date(year, month, date, hour);
          break;
        case 3:
          type = 'time';
          title = '밤 9시가 되면 문이 땅!';
          hour = category * 7;
          description = '문이 땅 닫히기 전까지 땅땅 도장을 찍어주세요!';
          difficulty = 1;
          reward = 300;
          timeUntil = new Date(year, month, date, hour);
          break;
        case 4:
          description = '이 땅에 남겨질 여러분의 흔적을 환영합니다!';
          type = 'feed';
          title = '땅에 대한 이야기 만땅';
          difficulty = 2;
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
          difficulty = 2;
          reward = 600;
          timeUntil = null;
          break;
        case 7:
          type = 'mob';
          title = '땅개비를 이겨라';
          description = '땅개비와의 짜릿한 한판승 어때요?';
          difficulty = 3;
          reward = 900;
          timeUntil = null;
          break;
        case 8:
          type = 'mob';
          title = '땅어가 나타났다';
          description = '땅어를 물리치고 우리 동네를 지켜주세요!';
          difficulty = 3;
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
      console.log(`getCoords: ${error.message}`);
    }
  }

  /* 특정 퀘스트 조회 */
  async getOne(id: number, playerId?: number) {
    const quest = await this.quests.findOneWithCompletes(id, playerId);
    if (!quest) this.exceptions.notFoundQuest();

    return { ok: true, row: quest };
  }

  /* 어제의 지역(동) 데이터 기반으로 오늘의 새로운 퀘스트 만들기 */
  @Cron('0 0 1 * * *', {
    name: 'createQuests',
    timeZone: 'Asia/Seoul',
  })
  async preCreateQuests() {
    this.logger.verbose('퀘스트 사전 생성');

    const today = new Date();
    const todayDate = today.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayDate = yesterday.toDateString();
    let regions = await this.regions.find({ date: yesterdayDate });

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
      let newRegion = this.regions.create({
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
