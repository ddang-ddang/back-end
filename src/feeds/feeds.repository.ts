import { EntityRepository, Repository } from 'typeorm';
import { Feed } from './entities/feed.entity';
import { UpdateFeedDto } from './dto/update-feed.dto';

@EntityRepository(Feed)
export class FeedRepository extends Repository<Feed> {
  async updateFeed(
    feedId: number,
    filePath: string,
    updateFeedDto: UpdateFeedDto
  ) {
    const { content } = updateFeedDto;
    return this.save({
      feedId,
      content,
      image: filePath,
    });
  }

  async deleteFeed(feedId: number) {
    return this.save({
      feedId,
      deletedAt: new Date(),
    });
  }
}
