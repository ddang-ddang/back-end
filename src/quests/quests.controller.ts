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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { customFileIntercept } from 'src/lib/fileInterceptor';
import { fileURLToPath } from 'url';
import { CreateCommentQuestDto } from './dto/create-commentquest.dto';
import { CreateFeedQuestDto } from './dto/create-feedquest.dto';
import { QuestsService } from './quests.service';

@Controller('api/quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /**
   * 퀘스트 수행
   * 유저 확인 필요
   */
  @Post()
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
    @Body() createFeedQuestDto: CreateFeedQuestDto
  ) {
    if (questType === 'feed') {
      return this.questsService.feedQuest(files, createFeedQuestDto);
    } else if (questType === 'comment') {
    } else if (questType === 'like') {
    }
    return;
  }
}
