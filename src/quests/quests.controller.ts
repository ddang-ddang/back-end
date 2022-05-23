import {
  Controller,
  Body,
  Query,
  Param,
  UseGuards,
  Get,
  Post,
  Req,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuestsService } from './quests.service';
import { CreateFeedDto } from '../feeds/dto/create-feed.dto';

@Controller('/api/quests')
@ApiTags('퀘스트 API')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /* 퀘스트 전체 조회 API */
  @Get()
  @ApiOperation({ summary: '전체 퀘스트 조회 API' })
  getAll(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Request() req: any
  ) {
    if (!lat || !lng) {
      throw new BadRequestException({
        ok: false,
        message: '위도(lat), 경도(lng)를 쿼리 파라미터로 보내주세요/',
      });
    }

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const encodedPayload = token.split('.')[1];
      const payload = Buffer.from(encodedPayload, 'base64');
      const playerId = JSON.parse(payload.toString()).id;
      return this.questsService.getAll(lat, lng, playerId);
    }

    return this.questsService.getAll(lat, lng);
  }

  /* 특정 퀘스트 조회 API */
  @Get(':questId')
  @ApiOperation({ summary: '특정 퀘스트 조회 API' })
  async getOne(@Param('questId') id: number, @Request() req: any) {
    try {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const encodedPayload = token.split('.')[1];
        const payload = Buffer.from(encodedPayload, 'base64');
        const playerId = JSON.parse(payload.toString()).id;
        return await this.questsService.getOne(id, playerId);
      }

      return await this.questsService.getOne(id);
    } catch (e) {
      console.log(e);
    }
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
    const { playerId } = req['user'].player;
    console.log(req['user']);
    if (questType === 'feed') {
      return this.questsService.feedQuest(
        id,
        playerId,
        createFeedDto,
        questType
      );
    } else {
      return this.questsService.questComplete(id, playerId, questType);
    }
  }
}
