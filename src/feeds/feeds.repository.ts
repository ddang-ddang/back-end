import { EntityRepository, Repository } from 'typeorm';
import { Feed } from './entities/feed.entity';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { CreateFeedQuestDto } from 'src/quests/dto/create-feedquest.dto';

@EntityRepository(Feed)
export class FeedRepository extends Repository<Feed> {
  async feedQuest(
    // user: User,
    pathList: string[],
    createFeedQuestDto: CreateFeedQuestDto
  ): Promise<Feed> {
    const { content } = createFeedQuestDto;
    const newContent = this.create({
      content,
      image1: pathList[0],
      image2: pathList[1],
      image3: pathList[2],
    });

    await this.save(newContent);
    return newContent;
  }

  async updateFeed(
    feedId: number,
    pathList: string[],
    // updateFeedDto: UpdateFeedDto
    feedContent: string
  ) {
    // const { content } = updateFeedDto;
    return this.update(
      { id: feedId },
      {
        content: feedContent,
        image1: pathList[0],
        image2: pathList[1],
        image3: pathList[2],
      }
    );
  }

  async deleteFeed(feedId: number) {
    await this.update({ id: feedId }, { deletedAt: new Date() });
    return;
  }
}
