import { EntityRepository, Repository } from 'typeorm';
import { Feed } from './entities/feed.entity';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { CreateQuestDto } from 'src/quests/dto/create-quest.dto';
import { Quest } from 'src/quests/entities/quest.entity';
import { Player } from 'src/players/entities/player.entity';

@EntityRepository(Feed)
export class FeedRepository extends Repository<Feed> {
  /* 피드 업로드 퀘스트 수행 */
  async feedQuest(
    questId: number,
    playerId: number,
    img: string[],
    feedText: string
  ): Promise<Feed> {
    const quest: Quest = await Quest.findOne({
      where: {
        id: questId,
      },
    });

    const player: Player = await Player.findOne({
      where: {
        id: playerId,
      },
    });

    const newContent = this.create({
      content: feedText,
      image1_url: img[0],
      image2_url: img[1],
      image3_url: img[2],
      player,
      quest,
    });

    await this.save(newContent);
    return newContent;
  }

  /* 피드 수정 */
  async updateFeed(
    playerId: number,
    feedId: number,
    img: string[],
    content: string
  ) {
    console.log(feedId, img, content);
    return this.update(
      { id: feedId },
      {
        content,
        image1_url: img[0],
        image2_url: img[1],
        image3_url: img[2],
      }
    );
  }

  /* 피드 삭제 */
  async deleteFeed(feedId: number) {
    await this.update({ id: feedId }, { deletedAt: new Date() });
    return;
  }
}
