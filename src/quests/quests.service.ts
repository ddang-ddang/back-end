import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';

@Injectable()
export class QuestsService {
  constructor(private httpService: HttpService) {}

  /* 위도(lat), 경도(lng) 기준으로 우리 마을 퀘스트 조회 */
  getAll(lat: number, lng: number) {
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

    /* 좌표 기준으로 주소 조회 (kakao API) */
    const address = this.httpService
      .get(
        `${process.env.KAKAO_BASE_URL}/v2/local/geo/coord2address.json?x=${lng}&y=${lat}&input_coord=WGS84`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.REST_API_KEY}`,
          },
        }
      )
      .pipe(map((res) => res.data.documents[0].address));

    /* 오늘 날짜, 주소(시, 구, 동) 기준으로 DB 조회 (MySQL) */
    // TODO: ~5/7(토) 구현 예정

    // DB에 동 데이터 있는 경우
    /* 퀘스트 조회, 완료여부 JOIN (MySQL) */
    // TODO: ~5/9(월) 구현 예정
    /* 조회한 퀘스트들을 클라이언트로 보내줌 */
    // TODO: ~5/9(월) 구현 예정

    // DB에 동 데이터가 없는 경우
    /* 주소(동)에 해당하는 정보 조회 (주소센터 API) */
    address.subscribe((res) => {
      /* 오늘 날짜, 주소(시, 구, 동) 포함한 동 데이터 DB에 추가 (MySQL) */
      // TODO: ~5/7(토) 구현 예정
      const dong = res.region_3depth_name;
      const allAddresses = this.httpService
        .get(
          `https://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=10&keyword=${encodeURI(
            dong
          )}&confmKey=${process.env.JUSO_CONFIRM_KEY}&resultType=json`
        )
        .pipe(map((res) => res.data));

      /* 전체 주소를 돌면서 랜덤한 주소 추출 */
      allAddresses.subscribe((res) => {
        const totalCount = res.results.common.totalCount;
        // TODO: 테스트용 - lastPage 3으로 제한
        const lastPage = 3;
        // const lastPage = Math.ceil(totalCount / 100);
        const questsArray = [];
        for (let i = 1; i <= lastPage; i++) {
          const idx =
            i !== lastPage
              ? Math.floor(Math.random() * 100) + 1
              : Math.floor(Math.random() * (totalCount % 100)) + 1;
          console.log(`${i}번째 인덱스는 ${idx}`);

          const randomAddress = this.httpService
            .get(
              `https://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=${i}&countPerPage=100&keyword=${encodeURI(
                dong
              )}&confmKey=${process.env.JUSO_CONFIRM_KEY}&resultType=json`
            )
            .pipe(map((res) => res.data.results.juso[idx].roadAddr));

          /* 랜덤한 주소(동) 기준으로 좌표 생성하기 */
          randomAddress.subscribe((res) => {
            const questCoords = this.httpService
              .get(
                `${
                  process.env.KAKAO_BASE_URL
                }/v2/local/search/address.json?query=${encodeURI(res)}`,
                {
                  headers: {
                    Authorization: `KakaoAK ${process.env.REST_API_KEY}`,
                  },
                }
              )
              .pipe(map((res) => res.data));

            /* k. 랜덤 좌표마다 퀘스트 만들어서 DB에 추가 (MySQL) */
            /* k-1. 랜덤 좌표마다 퀘스트를 배열로 저장 */
            // TODO: ~5/7(토) 구현 예정
            questCoords.subscribe((res) => {
              console.log(`좌표: ${res.documents[0].y}, ${res.documents[0].x}`);
              const type = Math.floor(Math.random() * 3);
              questsArray.push({
                lat: res.documents[0].y,
                lng: res.documents[0].x,
                type,
              });
              console.log(questsArray);
            });
          });
        }
        console.log(questsArray); // 빈 배열 반환
        /* k-2. for문 다 돌고나서 DB에 추가 */
        // TODO: ~5/7(토) 구현 예정 (observable subscribe가 핵심)

        /* 생성한 퀘스트들을 클라이언트로 보내줌 */
        // TODO: ~5/9(월) 구현 예정
      });
    });

    return address;
  }

  getOne(id: number): string {
    // const quest = this.quests.find((quest) => quest.id === Number(id));
    // if (!quest) {
    //   throw new NotFoundException(`quest not found`);
    // }
    // return quest;
    return `quest_id: ${id} 해당하는 퀘스트 받아주세요//`;
  }
}
