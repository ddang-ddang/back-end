import {
  Body,
  Controller,
  Post,
  Query,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
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
    /* [예외처리] 쿼리 파라미터 누락: 위도(lat), 경도(lng) */
    if (!lat || !lng) {
      throw new HttpException(
        {
          ok: false,
          message: '위도(lat), 경도(lng)를 쿼리 파라미터로 보내주세요/',
        },
        HttpStatus.BAD_REQUEST
      );
    }
    return this.questsService.getAll(lat, lng);
  }

  /* 특정 퀘스트 조회 API */
  @Get(':quest_id')
  @ApiOperation({ summary: '특정 퀘스트 조회 API' })
  getOne(@Param('quest_id') id: number) {
    return this.questsService.getOne(id);
  }

  /**
   * 퀘스트 수행
   * 유저 확인 필요
   */
  @Post(':quest_id')
  @ApiOperation({ summary: '퀘스트 수행 로직 API' })
  // @UseGuards(JwtAuthGuard)
  async questComplete(
    // @Req() req: Request,
    @Param('quest_id') id: number,
    @Query('type') questType: string,
    @Body() createFeedDto: CreateFeedDto
  ) {
    if (questType === 'feed') {
      return this.questsService.feedQuest(createFeedDto);
    } else if (questType === 'time' || questType === 'mob') {
      return this.questsService.questComplete(id);
    }
    return;
  }
}
