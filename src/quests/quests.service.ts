import { Injectable } from '@nestjs/common';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository,
    private commentRepository: CommentRepository,
    private httpService: HttpService
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

  /* 위도(lat), 경도(lng) 기준으로 우리 마을 퀘스트 조회 */
  getAll(lat: number, lng: number) {
    /* 카카오 API로 주소 받아오기 */
    const address: Observable<AxiosResponse<Address>> = this.httpService.get(
      `${process.env.KAKAO_BASE_URL}/v2/local/geo/coord2address.json?x=${lng}&y=${lat}&input_coord=WGS84`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.REST_API_KEY}`,
        },
      }
    );

    address.subscribe((address) => {
      console.log(address.data.documents[0].address); // 주소 반환
      /* 받아온 주소 기준으로 랜덤 좌표 생성하기 */
      // TODO: 랜덤 좌표 생성 기능 구현

      return address.data.documents[0].address.region_3depth_name;
    });
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
