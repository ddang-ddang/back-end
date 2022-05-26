import { EntityRepository, Repository } from 'typeorm';
import { Feed } from './entities/feed.entity';
import { Quest } from 'src/quests/entities/quest.entity';
import { Player } from 'src/players/entities/player.entity';
import { Complete } from 'src/quests/entities/complete.entity';
import { Region } from 'src/quests/entities/region.entity';
@EntityRepository(Feed)
export class FeedRepository extends Repository<Feed> {
  /* 피드 업로드 퀘스트 수행 */
  async feedQuest(
    questId: number,
    playerId: number,
    feedText: string,
    img?: string[]
  ): Promise<Feed> {
    const quest = await Quest.findOne({
      where: { id: questId },
      relations: ['region'],
    });

    const region = await Region.findOne({
      where: {
        id: quest.region.id,
      },
    });

    let newContent;
    if (img) {
      newContent = this.create({
        content: feedText,
        image1_url: img[0],
        image2_url: img[1],
        image3_url: img[2],
        playerId,
        quest,
        region,
      });
    } else {
      newContent = this.create({
        content: feedText,
        playerId,
        quest,
        region,
      });
    }
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
    console.log(playerId, feedId, img, content);
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
  async deleteFeed(
    playerId: number,
    feedId: number,
    feed: Feed
  ): Promise<void> {
    const player = await Player.findOne({ where: { id: playerId } });
    const quest = await Quest.findOne({
      where: {
        id: feed.quest.id,
      },
    });
    await this.update({ id: feedId }, { deletedAt: new Date() });
    // complete 테이블 데이터 삭제
    await Complete.delete({ player, quest }); // player quest
    return;
  }
}
