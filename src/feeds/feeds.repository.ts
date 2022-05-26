import { EntityRepository, Repository } from 'typeorm';
import { Feed } from './entities/feed.entity';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { CreateQuestDto } from 'src/quests/dto/create-quest.dto';
import { Quest } from 'src/quests/entities/quest.entity';
import { Player } from 'src/players/entities/player.entity';
import { Complete } from 'src/quests/entities/complete.entity';
import {
  BadRequestException,
  ConflictException,
  ConsoleLogger,
  Injectable,
} from '@nestjs/common';
import { Region } from 'src/quests/entities/region.entity';
import { FeedException } from './feeds.exception';
@EntityRepository(Feed)
export class FeedRepository extends Repository<Feed> {
  /* 피드 업로드 퀘스트 수행 */
  async feedQuest(
    questId: number,
    playerId: number,
    img: string[],
    feedText: string
  ): Promise<Feed> {
    const [quest, player] = await Promise.all([
      Quest.findOne({
        where: {
          id: questId,
        },
        relations: ['region'],
      }),
      Player.findOne({
        where: {
          id: playerId,
        },
      }),
    ]);

    if (quest.type !== 'feed') {
      throw new BadRequestException({
        ok: false,
        message: 'feed타입의 퀘스트가 아닙니다.',
      });
    }

    const region = await Region.findOne({
      where: {
        id: quest.region.id,
      },
    });

    const completeOne = await Complete.find({
      where: {
        quest,
        player,
      },
    });

    if (completeOne.length !== 0) {
      throw new ConflictException({
        ok: false,
        message: '퀘스트를 이미 완료하였습니다.',
      });
    } else {
      const newComplete = Complete.create({
        quest,
        player,
      });

      await Complete.save(newComplete);
    }

    /* complete 테이블에 insert */
    const newContent = this.create({
      content: feedText,
      image1_url: img[0],
      image2_url: img[1],
      image3_url: img[2],
      player,
      quest,
      region,
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
