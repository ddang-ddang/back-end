import { Injectable } from '@nestjs/common';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import axios from 'axios';
import * as config from 'config';

const mapConfig = config.get('map');
const KAKAO_BASE_URL = mapConfig.kakaoBaseUrl;
const REST_API_KEY = mapConfig.kakaoApiKey;
const JUSO_CONFIRM_KEY = mapConfig.josoConfirmKey;
const JUSO_BASE_URL = mapConfig.jusoBaseUrl;

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository,
    private commentRepository: CommentRepository
  ) {}

  feedQuest(files: object[], content: string) {
    const feedText = content['content'];
    const pathList = [];
    files.map((file) => {
      pathList.push(file['path']);
    });
    return this.feedRepository.feedQuest(pathList, feedText);
  }

  commentQuest(content: string) {
    const comment = content['content'];
    return this.commentRepository.commentQuest(comment);
  }

  /* TODO: 공통
   *       1. 좌표 기준으로 동 조회 (kakao API)
   *       2. 오늘 날짜, 주소(시, 구, 동) 기준으로 DB 조회 (MySQL)
   */
  /* TODO: DB에 동 데이터 있는 경우
   *       1. 퀘스트 조회, 완료여부 JOIN (MySQL)
   *       2. 조회한 퀘스트들을 클라이언트로 보내줌
   */
  /* TODO: DB에 동 데이터가 없는 경우
   *       1. 오늘 날짜, 주소(시, 구, 동) 포함한 동 데이터 DB에 추가 (MySQL)
   *       2. 주소(동) 기준으로 랜덤 좌표 생성 (주소센터 API)
   *       3. 랜덤 좌표마다 퀘스트 만들어서 DB에 추가 (MySQL)
   *       4. 생성한 퀘스트들을 클라이언트로 보내줌
   */
  // TODO: get 요청시 try...catch 예외처리

  /* 위도(lat), 경도(lng) 기준으로 우리 마을 퀘스트 조회 */
  async getAll(lat: number, lng: number) {
    console.time('getAllQuests');
    const kakaoAddress = await this.getAddressName(lat, lng);
    const { totalCount, pageCount } = await this.getDongData(kakaoAddress);
    const quests = await this.getQuests(totalCount, pageCount, kakaoAddress);
    console.timeEnd('getAllQuests');

    // test
    const test = await this.getPromises(totalCount, pageCount, kakaoAddress);
    console.log(test);

    return quests;
  }

  /* 주소 데이터 얻어오기 */
  /**
   * @param {number} lat - 위도
   * @param {number} lng - 경도
   * @returns {string} - 주소(시/구/동)
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

      return `${region_1depth} ${region_2depth} ${region_3depth}`;
    } catch (error) {
      console.log(error.message);
    }
  }

  /* 특정 동의 개요 얻어오기 */
  /**
   * @param {string} address - 주소(시/구/동)
   * @returns {object} - { 전체 주소 개수, 페이지수 }
   */
  async getDongData(address) {
    try {
      const res = await axios.get(
        `${JUSO_BASE_URL}?currentPage=1&countPerPage=10&keyword=${encodeURI(
          address
        )}&confmKey=${JUSO_CONFIRM_KEY}&resultType=json`
      );
      const { totalCount } = res.data.results.common;
      // const pageCount = Math.ceil(totalCount / 100);
      const pageCount = 3;
      return { totalCount, pageCount };
    } catch (error) {
      console.log(error.message);
    }
  }

  /* 퀘스트 만들기 */
  /**
   * @param {number} totalCount - 전체 주소 개수
   * @param {number} pageCount - 전체 페이지 수
   * @param {string} kakaoAddress - 주소(시/구/동)
   * @returns {array} - [ 퀘스트 ]
   */
  async getQuests(totalCount, pageCount, kakaoAddress) {
    const quests = [];
    for (let i = 1; i <= pageCount; i++) {
      const idx =
        i !== pageCount
          ? Math.floor(Math.random() * 100) + 1
          : Math.floor(Math.random() * (totalCount % 100)) + 1;
      /* 각 페이지마다 랜덤 idx로 상세주소 얻기 */
      const roadAddr = await this.getRoadAddress(i, kakaoAddress, idx);
      /* 상세주소에 해당하는 좌표값 얻기 */
      const { lat, lng } = await this.getCoords(roadAddr);
      const type = Math.floor(Math.random() * 3);
      quests.push({ lat, lng, type });
    }
    return quests;
  }

  // 테스트입니다.
  async getPromises(totalCount, pageCount, kakaoAddress) {
    const quests = [];
    for (let i = 1; i <= pageCount; i++) {
      quests.push(i);
    }
    const resQuests = await Promise.all([
      ...quests.map((i) => {
        this.getQuestsAll(totalCount, pageCount, kakaoAddress, i);
      }),
    ]);
    return resQuests;
  }

  // 테스트입니다.
  async getQuestsAll(totalCount, pageCount, kakaoAddress, i) {
    const idx =
      i !== pageCount
        ? Math.floor(Math.random() * 100) + 1
        : Math.floor(Math.random() * (totalCount % 100)) + 1;
    /* 각 페이지마다 랜덤 idx로 상세주소 얻기 */
    const roadAddr = await this.getRoadAddress(i, kakaoAddress, idx);
    /* 상세주소에 해당하는 좌표값 얻기 */
    const { lat, lng } = await this.getCoords(roadAddr);
    const type = Math.floor(Math.random() * 3);
    return { lat, lng, type };
    // }
  }

  /* 상세주소 얻어오기 */
  /**
   * @param {number} curPage - 현재 페이지 번호
   * @param {string} kakaoAddress - 주소(시/구/동)
   * @param {number} idx - 인덱스(1~100 랜덤)
   * @returns {string} - 상세주소 (ex. 서울특별시 강남구 언주로63길 20(역삼동))
   */
  async getRoadAddress(curPage, kakaoAddress, idx) {
    try {
      const res = await axios.get(
        `${JUSO_BASE_URL}?currentPage=${curPage}&countPerPage=100&keyword=${encodeURI(
          kakaoAddress
        )}&confmKey=${JUSO_CONFIRM_KEY}&resultType=json`
      );
      return res.data.results.juso[idx].roadAddr;
    } catch (error) {
      console.log(error.message);
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
      console.log(error.message);
    }
  }

  getOne(id: number): string {
    // const quest = this.quests.find((quest) => quest.id === Number(id));
    // if (!quest) {
    //   throw new NotFoundException(`quest not found`);
    // }
    // return quest;
    return `quest_id: ${id}해당하는 퀘스트 받아주세요//`;
  }
}
