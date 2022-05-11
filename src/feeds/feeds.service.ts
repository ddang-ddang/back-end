import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './entities/feed.entity';
import { FeedRepository } from './feeds.repository';
import { Likes } from '../likes/entities/like.entity';
import { LikeRepository } from 'src/likes/likes.repository';

@Injectable()
export class FeedsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository
  ) {}

  /* 모든 피드 가져오기 */
  async findAllFeeds() {
    const feeds = await Feed.find({
      where: {
        deletedAt: null,
      },
      relations: ['player', 'likes'],
    });

    return feeds.map((feed) => {
      const likeCnt = feed.likes.length;
      console.log(likeCnt);
      return { ...feed, likeCnt };
    });
  }

  /* 특정 피드 가저오기 */
  async findOneFeed(feedId: number): Promise<Feed> {
    const content = await this.feedRepository.findOne({
      where: {
        id: feedId,
      },
    });
    if (!content) {
      throw new NotFoundException(`content id ${feedId} not found`);
    }
    return content;
  }

  /* 피드 수정 */
  async updateFeed(feedId: number, img: string[], feedContent: string) {
    const feed = await this.findOneFeed(feedId);
    if (feed) {
      return this.feedRepository.updateFeed(feedId, img, feedContent);
    }
    return `feed not found id ${feedId}`;
  }

  /* 피드 삭제 */
  async removeQuest(feedId: number): Promise<void | object> {
    const feed = await this.feedRepository.findOne(feedId);
    if (!feed) {
      return {
        ok: false,
        message: `not found`,
      };
    }
    return this.feedRepository.deleteFeed(feedId);
  }
}
