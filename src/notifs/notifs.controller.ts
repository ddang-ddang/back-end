import { Body, Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotifsService } from './notifs.service';

@Controller('/api/notifs')
@ApiTags('퀘스트 완료 알림 API')
export class NotifsController {
  constructor(private readonly notifsService: NotifsService) {}

  @Get()
  getAll(@Body() body: any) {
    const { currentRegion } = body;
    return this.notifsService.getAll(currentRegion);
  }
}
