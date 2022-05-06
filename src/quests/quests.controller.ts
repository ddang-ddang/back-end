import {
  Body,
  Controller,
  Post,
  Query,
  Req,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UploadedFile,
  UseInterceptors,
  Request,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { CreateQuestDto } from './dto/create-quest.dto';
import { QuestsService } from './quests.service';

@Controller('/api/quests')
@ApiTags('퀘스트 API')
export class QuestsController {
  constructor(private readonly questService: QuestsService) {}

  /* 퀘스트 전체 조회 API */
  @Get()
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
    return this.questService.getAll(lat, lng);
  }

  /* 특정 퀘스트 조회 API */
  @Get(':quest_id')
  getOne(@Param('quest_id') id: number): string {
    return this.questService.getOne(id);
  }

  /**
   * 퀘스트 수행
   * 유저 확인 필요
   */
  @Post()
  @ApiOperation({ summary: '퀘스트 수행 로직 API' })
  @UseInterceptors(
    FilesInterceptor('file', 3, {
      storage: diskStorage({
        destination: './files',
        filename: (req, files, cb) => {
          const fileNameSplit = files.originalname.split('.');
          const fileExt = fileNameSplit[fileNameSplit.length - 1];
          cb(null, `${Date.now()}.${fileExt}`);
        },
      }),
    })
  )
  async questComplete(
    @Query('type') questType: string,
    @UploadedFiles() files,
    @Body() content: string
  ) {
    if (questType === 'feed') {
      return this.questsService.feedQuest(files, content);
    } else if (questType === 'comment') {
      return this.questsService.commentQuest(content);
    } else if (questType === 'like') {
    }
    return;
  }
}
