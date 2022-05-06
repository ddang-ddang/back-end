import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './entities/feed.entity';
import { Place } from './entities/place.entity';
import { FeedRepository } from './feeds.repository';

@Injectable()
export class FeedsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository
  ) {}

  /* 모든 피드 가져오기 */
  async findAllFeeds(): Promise<Feed[]> {
    const feeds = await Feed.find({
      where: {
        deletedAt: null,
      },
      relations: ['place'],
    });
    return feeds;
  }

  /* 특정 피드 가저오기 */
  async findOneFeed(feedId: number): Promise<Feed> {
    const content = await this.feedRepository.findOne({
      where: {
        id: feedId,
      },
      relations: ['place'],
    });
    if (!content) {
      throw new NotFoundException(`content id ${feedId} not found`);
    }
    return content;
  }

  /* 피드 수정 */
  async updateFeed(feedId: number, files: object[], feedContent: string) {
    const feed = await this.findOneFeed(feedId);
    const pathList = [];
    files.map((file) => {
      pathList.push(file['path']);
    });
    if (feed) {
      return this.feedRepository.updateFeed(feedId, pathList, feedContent);
    }
    return `feed not found id ${feedId}`;
  }

  /* 피드 삭제 */
  async removeQuest(feedId: number): Promise<void | object> {
    const feed = await this.feedRepository.findOne(feedId);
    if (!feed) {
      // throw new NotFoundException(`feed not found`);
      return {
        ok: false,
        message: `not found`,
      };
    }
    return this.feedRepository.deleteFeed(feedId);
  }
}
