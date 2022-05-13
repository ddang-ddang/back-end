import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import axios from 'axios';
import * as config from 'config';
import { CreateFeedDto } from 'src/feeds/dto/create-feed.dto';
import { QuestsRepository } from './quests.repository';
import { RegionsRepository } from './regions.repository';
import { CompletesRepository } from './completes.repository';
import { Player } from '../players/entities/player.entity';

const mapConfig = config.get('map');

const KAKAO_BASE_URL = mapConfig.kakaoBaseUrl;
const REST_API_KEY = mapConfig.kakaoApiKey;
const JUSO_BASE_URL = mapConfig.jusoBaseUrl;
const JUSO_CONFIRM_KEY = mapConfig.josoConfirmKey;

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository,
    private commentRepository: CommentRepository,
    private questsRepository: QuestsRepository,
    private regionsRepository: RegionsRepository,
    private completesRepository: CompletesRepository
  ) {}

  /* 피드작성 퀘스트 완료 요청 로직 */
  feedQuest(questId: number, playerId: number, createFeedDto: CreateFeedDto) {
    const { img, content } = createFeedDto;
    return this.feedRepository.feedQuest(questId, playerId, img, content);
  }

  /* 타임어택 또는 몬스터 대결 퀘스트 완료 요청 로직 */
  async questComplete(questId: number, playerId: number) {
    const player: Player = await Player.findOne({ where: { id: playerId } });
    const quest = await this.questsRepository.findOneBy(questId);
    if (!quest) {
      throw new NotFoundException({
        ok: false,
        message: '해당 게시글을 찾을 수 없습니다.',
      });
    }
    await this.completesRepository.complete(player, quest);
    return { ok: true };
  }

  /*
   * 퀘스트 조회 프로세스: player의 좌표 값으로 region 테이블 조회
   * DB에 데이터 있으면, 퀘스트 + 완료여부 조인해서 응답
   * DB에 데이터 없으면, 지역(동) + 퀘스트 데이터 DB에 생성하고 응답
   */

  /* 위도(lat), 경도(lng) 기준으로 우리 지역(동) 퀘스트 조회 */
  async getAll(lat: number, lng: number, playerId: number | null) {
    const kakaoAddress = await this.getAddressName(lat, lng);
    const address = `${kakaoAddress.regionSi} ${kakaoAddress.regionGu} ${kakaoAddress.regionDong}`;

    let region = await this.regionsRepository.findByAddrs(kakaoAddress);
    if (region) {
      const allQuests = await this.questsRepository.findAll(region, playerId);

      return {
        ok: true,
        currentRegion: `${region.regionSi} ${region.regionGu} ${region.regionDong}`,
        rows: allQuests,
      };
    }

    // 지역(동), 좌표 값으로 퀘스트 만들기
    const { totalCount, pageCount } = await this.getRegionData(address);
    console.time('API req-res time');
    const quests = await this.createQuests(totalCount, pageCount, address);
    console.timeEnd('API req-res time');

    // 지역(동) 데이터 DB에 추가 및 조회
    await this.regionsRepository.createAndSave(kakaoAddress);
    region = await this.regionsRepository.findByAddrs(kakaoAddress);

    // 퀘스트 데이터 DB에 추가 및 조회
    await Promise.all([
      ...quests.map(async (quest) => {
        return await this.questsRepository.createAndSave({ region, ...quest });
      }),
    ]);
    const allQuests = await this.questsRepository.findAll(region, playerId);

    return {
      ok: true,
      currentRegion: `${region.regionSi} ${region.regionGu} ${region.regionDong}`,
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
        `${KAKAO_BASE_URL}/geo/coord2address.json?x=${lng}&y=${lat}&input_coord=WGS84`,
        { headers: { Authorization: `KakaoAK ${REST_API_KEY}` } }
      );
      const { address } = res.data.documents[0];
      const region_1depth = address.region_1depth_name;
      const region_2depth = address.region_2depth_name;
      const region_3depth = address.region_3depth_name;

      return {
        regionSi: region_1depth,
        regionGu: region_2depth,
        regionDong: region_3depth,
      };
    } catch (error) {
      console.log(error.message);
    }
  }

  /* 특정 동의 개요 얻어오기 */
  /**
   * @param {string} address - "시 구 동"
   * @returns {object} - { 전체 주소 개수, 페이지수 }
   */
  async getRegionData(address) {
    try {
      const res = await axios.get(
        `${JUSO_BASE_URL}?currentPage=1&countPerPage=10&keyword=${encodeURI(
          address
        )}&confmKey=${JUSO_CONFIRM_KEY}&resultType=json`
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
   * @param {number} paegCount - 전체 페이지 수
   * @param {string} address - "시 구 동"
   * @returns {array} - [ 퀘스트 ]
   */
  async createQuests(totalCount, paegCount, address) {
    const limitsPerRequest = 20; // kakaoAPI 429 에러(Too Many Requests) 방지를 위해 요청당 호출수 제한
    let questsCoords = [];
    for (
      let startPage = 1;
      startPage < paegCount;
      startPage += limitsPerRequest
    ) {
      const lastPage =
        startPage + limitsPerRequest < paegCount
          ? startPage + limitsPerRequest
          : paegCount + 1;
      questsCoords = [
        ...questsCoords,
        ...(await this.getQuestsCoords(
          totalCount,
          startPage,
          lastPage,
          address
        )),
      ];
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = today.getDate();
    let type, title, description, reward, difficulty, timeUntil;
    let category;
    let hour;

    /* 좌표별로 퀘스트 만들어서 return */
    return questsCoords.map((coords) => {
      category = Math.floor(Math.random() * 9) + 1;
      switch (category) {
        case 1:
        case 2:
        case 3:
          type = 'time';
          title = '타임어택';
          if (category === 1) {
            hour = 9;
          } else {
            hour = category * 7;
          }
          description = `${hour}시까지 도착해서 땅땅 도장을 찍어주세요.`;
          difficulty = 1;
          reward = 5;
          timeUntil = new Date(year, month, date, hour);
          break;
        case 4:
        case 5:
        case 6:
          if (category === 4) {
            description =
              '특별한 기억이 있는 장소인가요? 여러분의 경험을 들려주세요. 낯선 곳이라면 첫번째 기억을 담으러 나서볼까요?';
          } else if (category === 5) {
            description =
              '동네 사람들에게 추천해 주고 싶은 장소인가요? 여러분의 리뷰를 남겨주세요.';
          } else {
            description =
              '오늘 하루는 어떠셨나요? 무심코 지나친 무채색의 장소를 여러분의 감정으로 채워주세요.';
          }
          type = 'feed';
          title = '땅땅 쓰기';
          difficulty = 2;
          reward = 8;
          timeUntil = null;
          break;
        case 7:
        case 8:
        case 9:
          type = 'mob';
          title = '몬스터 대결';
          description =
            '대결에서 승리하여 몬스터로부터 우리 동네를 지켜주세요.';
          difficulty = 3;
          reward = 10;
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

  /* 퀘스트를 만들기 위한 좌표값 얻기 */
  /**
   * @param {number} totalCount - 전체 주소 개수
   * @param {number} startPage - 시작 페이지
   * @param {number} lastPage - 마지막 페이지
   * @param {string} address - "시 구 동"
   * @returns {array} - [ { lat, lng } ]
   */
  async getQuestsCoords(totalCount, startPage, lastPage, address) {
    const addrIndex = [];
    for (let curPage = startPage; curPage < lastPage; curPage++) {
      const idx =
        curPage !== lastPage
          ? Math.floor(Math.random() * 100) + 1
          : Math.floor(Math.random() * (totalCount % 100)) + 1;
      addrIndex.push({ curPage: curPage, idx });
    }

    /* 각 페이지마다 랜덤 idx로 상세주소 얻기 */
    const roadAddrs = await Promise.all([
      ...addrIndex.map(({ curPage, idx }) =>
        this.getRoadAddress(curPage, address, idx)
      ),
    ]);
    /* 상세주소에 해당하는 좌표값 return */
    return await Promise.all([
      ...roadAddrs
        .filter((addr) => addr)
        .map((roadAddr) => this.getCoords(roadAddr)),
    ]);
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
        `${JUSO_BASE_URL}?currentPage=${curPage}&countPerPage=100&keyword=${encodeURI(
          address
        )}&confmKey=${JUSO_CONFIRM_KEY}&resultType=json`
      );
      return res.data.results.juso[idx].roadAddr;
    } catch (error) {
      console.log(`getRoadAddress: ${error.message}`);
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
        `${KAKAO_BASE_URL}/search/address.json?query=${encodeURI(roadAddr)}`,
        {
          headers: {
            Authorization: `KakaoAK ${REST_API_KEY}`,
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
  async getOne(id: number, playerId: number | null) {
    const quest = await this.questsRepository.findOneWithCompletes(
      id,
      playerId
    );
    if (!quest) {
      throw new NotFoundException({
        ok: false,
        message: '해당 게시글을 찾을 수 없습니다.',
      });
    }
    return { ok: true, row: quest };
  }
}
