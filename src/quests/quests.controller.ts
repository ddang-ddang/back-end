import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QuestsService } from './quests.service';

@Controller('/api/quests')
export class QuestsController {
  constructor(private readonly questService: QuestsService) {}

  /* 퀘스트 전체 조회 API */
  @Get()
  getAll(@Query('lat') lat: number, @Query('lng') lng: number) {
    /* [예외처리] 쿼리 파라미터 누락: 위도(lat), 경도(lng) */
    if (!lat || !lng) {
      // return '위도(lat), 경도(lng)를 쿼리 파라미터로 보내주세요/';
      throw new HttpException(
        '위도(lat), 경도(lng)를 쿼리 파라미터로 보내주세요/',
        HttpStatus.BAD_REQUEST
      );
    }
    return this.questService.getAll(lat, lng);
  }

  /* 특정 퀘스트 조회 API */
  @Get(':quest_id')
  getOne(@Param('quest_id') id: number): string {
    return this.questService.getOne(id);
  }

  /* 퀘스트 수행 */
}
