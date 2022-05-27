import { EntityRepository, Repository } from 'typeorm';
import { Feed } from './entities/feed.entity';
import { Quest } from 'src/quests/entities/quest.entity';
import { Player } from 'src/players/entities/player.entity';
import { Complete } from 'src/quests/entities/complete.entity';
import { Region } from 'src/quests/entities/region.entity';
import { InjectRepository } from '@nestjs/typeorm';
@EntityRepository(Feed)
export class FeedRepository extends Repository<Feed> {
  /* 피드 업로드 퀘스트 수행 */
  async feedQuest(
    questId: number,
    playerId: number,
    feedText: string,
    img?: string[]
  ): Promise<Feed> {
    // 프론트에서 정보 필요없으면 지움
    const [quest, player] = await Promise.all([
      Quest.findOne({
        where: { id: questId },
        relations: ['region'],
      }),
      Player.findOne({ id: playerId }),
    ]);

    let newContent;
    if (img) {
      newContent = this.create({
        content: feedText,
        image1_url: img[0],
        image2_url: img[1],
        image3_url: img[2],
        player,
        quest,
        regionId: quest.region.id,
      });
    } else {
      newContent = this.create({
        content: feedText,
        player,
        quest,
        regionId: quest.region.id,
      });
    }
    await this.save(newContent);

    return newContent;
  }

  /* 내가 쓴 피드 가져오기 */
  async getMyFeeds(playerId: number): Promise<Feed[]> {
    const feeds = await this.createQueryBuilder('feed')
      .select([
        'feed',
        'player.id',
        'player.email',
        'player.nickname',
        'player.mbti',
        'player.profileImg',
        'player.level',
        'player.expPoints',
      ])
      .leftJoin('feed.player', 'player')
      .where('player.id = :playerId', { playerId })
      .orderBy('feed.createdAt', 'DESC')
      .getMany();
    return feeds;
  }

  /* 피드 수정 */
  async updateFeed(feedId: number, img: string[], content: string) {
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
    const quest = await Quest.findOne({
      where: {
        id: feed.quest.id,
      },
    });
    await this.update({ id: feedId }, { deletedAt: new Date() });
    // complete 테이블 데이터 삭제
    await Complete.delete({ playerId, quest }); // player quest
    return;
  }
}
