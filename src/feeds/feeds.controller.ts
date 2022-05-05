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
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { customFileIntercept } from 'src/lib/fileInterceptor';

@Controller('api/feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  // @Post()
  // createFeed(@Body() createFeedDto: CreateFeedDto) {
  //   return this.feedsService.createFeed(createFeedDto);
  // }

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
    customFileIntercept({
      fieldname: 'file',
      dest: './uploads',
      maxFileSize: 500000,
      fileCount: 3,
      allowFileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
    })
  )
  updateFeed(
    @UploadedFile() file: Express.Multer.File,
    @Param('feedId') feedId: number,
    @Body() updateFeedDto: UpdateFeedDto
  ) {
    console.log(feedId);
    console.log(updateFeedDto);
    return this.feedsService.updateFeed(feedId, file, updateFeedDto);
  }

  /* 피드 삭제 */
  @Delete(':feedId')
  remove(@Param('feedId') feedId: number) {
    return this.feedsService.removeQuest(feedId);
  }
}
