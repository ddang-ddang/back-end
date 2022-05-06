import {
  Body,
  Controller,
  Post,
  Query,
  Req,
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

@Controller('api/quests')
@ApiTags('퀘스트 API')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

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
