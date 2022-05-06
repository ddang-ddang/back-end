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

  async updateFeed(
    feedId: number,
    files: object[],
    // updateFeedDto: UpdateFeedDto
    feedContent: string
  ) {
    const feed = await this.findOneFeed(feedId);
    // const filePath = files['path'];
    const pathList = [];
    files.map((file) => {
      pathList.push(file['path']);
    });
    if (feed) {
      // return this.feedRepository.updateFeed(feedId, pathList, updateFeedDto);
      return this.feedRepository.updateFeed(feedId, pathList, feedContent);
    }
    return `feed not found id ${feedId}`;
  }

  async removeQuest(feedId: number) {
    return this.feedRepository.deleteFeed(feedId);
  }
}
