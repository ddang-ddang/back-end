import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestsService } from './quests.service';

@Controller('quests')
export class QuestsController {
  constructor(private readonly questService: QuestsService) {}

  @Get()
  getAll(@Query('lat') lat: number, @Query('lng') lng: number) {
    // TODO: (exception) 쿼리 파라미터(위도, 경도) 누락한 경우
    console.log(`[컨트롤러] 위도: ${lat} / 경도: ${lng}`);
    return this.questService.getAll(lat, lng);
  }

  @Get(':quest_id')
  getOne(@Param('quest_id') id: number): string {
    console.log(`[컨트롤러] 퀘스트id: ${id}`);
    return this.questService.getOne(id);
  }
  
  /* 퀘스트 수행 */

}
