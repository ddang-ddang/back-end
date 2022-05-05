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

  // createFeed(createFeedDto: CreateFeedDto) {
  //   return 'This action adds a new feed';
  // }

  async findAllFeeds() {
    // return Feed.find();
    const feeds = await Feed.find({ relations: ['place'] });
    return feeds;
  }

  async findOneFeed(feedId: number) {
    // return Feed.findOne({
    //   where: {
    //     id: feedId,
    //   },
    //   relations: ['place'],
    // });
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

  async updateFeed(feedId: number, file: object, updateFeedDto: UpdateFeedDto) {
    const content = await this.findOneFeed(feedId);
    const filePath = file['path'];
    if (content) {
      return this.feedRepository.updateFeed(feedId, filePath, updateFeedDto);
    }
  }

  async removeQuest(feedId: number) {
    return this.feedRepository.deleteFeed(feedId);
  }
}
