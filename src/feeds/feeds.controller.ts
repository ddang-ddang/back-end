import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { customFileIntercept } from 'src/lib/fileInterceptor';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('api/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  /* 모든 피드에 대한 정보 */
  @Get()
  findAllFeeds() {
    return this.feedsService.findAllFeeds();
  }

  /* 특정 피드에 대한 정보 */
  @Get(':feedId')
  findOneFeed(@Param('feedId') feedId: number) {
    return this.feedsService.findOneFeed(feedId);
  }

  /* 피드 수정 */
  @Patch(':feedId')
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
  async updateFeed(
    @Param('feedId') feedId: number,
    @UploadedFiles() files,
    // @Body() updateFeedDto: UpdateFeedDto
    @Body() content: string
  ) {
    // return this.feedsService.updateFeed(feedId, files, updateFeedDto);
    console.log(content);
    const feedContent = content['content'];
    console.log(feedContent);
    return this.feedsService.updateFeed(feedId, files, feedContent);
  }

  /* 피드 삭제 */
  @Delete(':feedId')
  remove(@Param('feedId') feedId: number) {
    return this.feedsService.removeQuest(feedId);
  }
}
