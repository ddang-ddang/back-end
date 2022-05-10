import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateFeedDto } from './dto/update-feed.dto';

@Controller('api/feeds')
@ApiTags('피드 API')
export class FeedsController {
  private logger = new Logger('FeedController');
  constructor(private readonly feedsService: FeedsService) {}

  /* 모든 피드에 대한 정보 */
  @Get()
  @ApiOperation({ summary: '주변 피드 조회 API' })
  async findAllFeeds() {
    this.logger.verbose(`trying to get all feeds user id by `);
    try {
      const feeds = await this.feedsService.findAllFeeds();
      return {
        ok: true,
        rows: feeds,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 특정 피드에 대한 정보 */
  @Get(':feedId')
  @ApiOperation({ summary: '특정 피드 조회 API' })
  async findOneFeed(@Param('feedId') feedId: number): Promise<object> {
    this.logger.verbose(`trying to get a feed ${feedId}`);
    try {
      const feed = await this.feedsService.findOneFeed(feedId);
      return {
        ok: true,
        row: feed,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 피드 수정 */
  @Patch(':feedId')
  @ApiOperation({ summary: '특정 피드 수정 API' })
  async updateFeed(
    @Param('feedId') feedId: number,
    @Body() updateFeedDto: UpdateFeedDto
  ) {
    this.logger.verbose(`trying to update feed id ${feedId}`);
    const { content, img } = { ...updateFeedDto };
    try {
      await this.feedsService.updateFeed(feedId, img, content);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 피드 삭제 */
  @Delete(':feedId')
  @ApiOperation({ summary: '특정 피드 삭제 API' })
  remove(@Param('feedId') feedId: number) {
    this.logger.verbose(`trying to delete feed id ${feedId}`);
    try {
      return this.feedsService.removeQuest(feedId);
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }
}
