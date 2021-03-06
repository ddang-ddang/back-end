import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  Req,
  Request,
  Query,
  ConsoleLogger,
  Post,
} from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('api/feeds')
@ApiTags('피드 API')
export class FeedsController {
  private logger = new Logger('FeedController');
  constructor(private readonly feedsService: FeedsService) {}

  /* 모든 피드에 대한 정보 */
  @Get()
  @ApiOperation({ summary: '주변 피드 조회 API' })
  // async findAllFeeds(@Body() playerId: number) {
  async findAllFeeds(
    @Request() req: any,
    // @Body() regionData: any,
    @Query('type') feedType: string,
    @Query('regionSi') regionSi: string,
    @Query('regionGu') regionGu: string,
    @Query('regionDong') regionDong: string,
    @Query('lat') lat: number,
    @Query('lng') lng: number
  ) {
    try {
      /* token 검사 */
      let playerId = null;
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        const encodedPayload = token.split('.')[1];
        const payload = Buffer.from(encodedPayload, 'base64');
        playerId = JSON.parse(payload.toString()).id;
        this.logger.verbose(`trying to get all feeds user id by ${playerId}`);
      } else {
        this.logger.verbose(`trying to get all feed without login`);
      }
      const newFeeds = [];
      let sortedFeeds;
      // const feeds = await this.feedsService.findAllFeeds(playerId, regionData);
      const feeds = await this.feedsService.findAllFeeds(
        playerId,
        regionSi,
        regionGu,
        regionDong
      );
      for (let i = 0; i < feeds.length; i++) {
        const dist = await this.feedsService.measureDist(
          lat,
          lng,
          feeds[i].quest.lat,
          feeds[i].quest.lng
        );

        newFeeds.push({ ...feeds[i], dist });
      }
      if (feedType === 'popularity') {
        sortedFeeds = newFeeds.sort((a, b) => b.likeCnt - a.likeCnt);
      } else if (feedType === 'distance') {
        sortedFeeds = newFeeds.sort((a, b) => a.dist - b.dist);
      } else {
        sortedFeeds = newFeeds.sort((a, b) => b.id - a.id);
      }
      return {
        ok: true,
        rows: sortedFeeds,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 내가 작성한 피드에 대한 정보 */
  @Get('/myfeed')
  @ApiOperation({ summary: '내가 작성한 피드 조회 API' })
  @UseGuards(JwtAuthGuard)
  async getMyFeeds(@Req() req: Request) {
    const { playerId } = req['user'].player;
    this.logger.verbose(`trying to get own feeds player ${playerId}`);
    try {
      const feeds = await this.feedsService.getMyFeeds(playerId);
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
  @UseGuards(JwtAuthGuard)
  async updateFeed(
    @Req() req: Request,
    @Param('feedId') feedId: number,
    @Body() updateFeedDto: UpdateFeedDto
  ) {
    const { playerId } = req['user'].player;
    this.logger.verbose(
      `trying to update feed id ${feedId} by user ${playerId}`
    );
    const { content, img } = { ...updateFeedDto };
    try {
      await this.feedsService.updateFeed(playerId, feedId, img, content);
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
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: Request, @Param('feedId') feedId: number) {
    const { playerId } = req['user'].player;
    this.logger.verbose(
      `trying to delete feed id ${feedId} by user ${playerId}`
    );
    try {
      await this.feedsService.removeQuest(playerId, feedId);
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
}
