import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';

@Injectable()
export class QuestsService {
  constructor(private httpService: HttpService) {}

  /* 위도(lat), 경도(lng) 기준으로 우리 마을 퀘스트 조회 */
  getAll(lat: number, lng: number) {
    /!* 카카오 API로 주소 받아오기 *!/;
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
    console.log(address);

    /* 받아온 주소(동) 기준으로 랜덤 좌표 생성하기 */
    address.subscribe((res) => {
      console.log(res);
      const dong = res.region_3depth_name;
      console.log(dong);

      const addressByDong = this.httpService
        .get(
          `https://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=1&countPerPage=100&keyword=${encodeURI(
            dong
          )}&confmKey=${process.env.JUSO_CONFIRM_KEY}&resultType=json`
        )
        .pipe(map((res) => res.data));

      addressByDong.subscribe((res) => {
        const totalCount = res.results.common.totalCount;
        // const lastPage = Math.ceil(totalCount / 100);
        const lastPage = 3;
        for (let i = 1; i <= lastPage; i++) {
          const idx =
            i !== lastPage
              ? Math.floor(Math.random() * 100) + 1
              : Math.floor(Math.random() * (totalCount % 100)) + 1;
          console.log(`${i}번째 인덱스는 ${idx}`);
          const result = this.httpService
            .get(
              `https://www.juso.go.kr/addrlink/addrLinkApi.do?currentPage=${i}&countPerPage=100&keyword=${encodeURI(
                dong
              )}&confmKey=${process.env.JUSO_CONFIRM_KEY}&resultType=json`
            )
            .pipe(map((res) => res.data.results.juso[idx].roadAddr));

          result.subscribe((res) => {
            const coords = this.httpService
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

            coords.subscribe((res) => {
              console.log(`좌표: ${res.documents[0].y}, ${res.documents[0].x}`);
            });
          });
        }
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
