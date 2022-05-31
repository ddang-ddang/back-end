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
  Logger,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { QuestsService } from './quests.service';
import { CreateFeedDto } from '../feeds/dto/create-feed.dto';

@Controller('/api/quests')
@ApiTags('퀘스트 API')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  private readonly logger = new Logger(QuestsController.name);

  @Get()
  @ApiOperation({
    summary: '전체 퀘스트 조회 API',
    description: '현재 위치를 기반으로 퀘스트를 조회합니다.',
  })
  @ApiNotFoundResponse({ description: '퀘스트를 찾을 수 없음' })
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

  @Get(':questId')
  @ApiOperation({
    summary: '특정 퀘스트 조회 API',
    description: '퀘스트 id 값을 통해 특정 퀘스트를 조회합니다.',
  })
  @ApiNotFoundResponse({ description: '퀘스트를 찾을 수 없음' })
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

  @Post(':questId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '퀘스트 수행 로직 API',
    description: '퀘스트 id 값을 통해 퀘스트 완료 요청을 합니다.',
  })
  @ApiNotFoundResponse({ description: '퀘스트를 찾을 수 없음' })
  async questComplete(
    @Req() req: Request,
    @Param('questId') id: number,
    @Body() createFeedDto: CreateFeedDto
  ) {
    const { playerId } = req['user'].player;
    return this.questsService.questComplete(id, playerId, createFeedDto);
  }
}
