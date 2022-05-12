import {
  Body,
  Controller,
  Post,
  Query,
  Get,
  Param,
  UseGuards,
  Req,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateFeedDto } from 'src/feeds/dto/create-feed.dto';
import { QuestsService } from './quests.service';

@Controller('/api/quests')
@ApiTags('퀘스트 API')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /* 퀘스트 전체 조회 API */
  @Get()
  @ApiOperation({ summary: '전체 퀘스트 조회 API' })
  getAll(@Query('lat') lat: number, @Query('lng') lng: number) {
    if (!lat || !lng) {
      throw new BadRequestException({
        ok: false,
        message: '위도(lat), 경도(lng)를 쿼리 파라미터로 보내주세요/',
      });
    }
    return this.questsService.getAll(lat, lng);
  }

  /* 특정 퀘스트 조회 API */
  @Get(':questId')
  @ApiOperation({ summary: '특정 퀘스트 조회 API' })
  getOne(@Param('questId') id: number) {
    return this.questsService.getOne(id);
  }

  /**
   * 퀘스트 수행
   * 유저 확인 필요
   */
  @Post(':questId')
  @ApiOperation({ summary: '퀘스트 수행 로직 API' })
  @UseGuards(AuthGuard('jwt'))
  async questComplete(
    @Req() req: Request,
    @Param('questId') id: number,
    @Query('type') questType: string,
    @Body() createFeedDto: CreateFeedDto
  ) {
    const { email } = req['user'].player;
    console.log(req['user']);
    if (questType === 'feed') {
      return this.questsService.feedQuest(id, email, createFeedDto);
    } else if (questType === 'time' || questType === 'mob') {
      return this.questsService.questComplete(id, email);
    }
    return;
  }
}
