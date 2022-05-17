import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './entities/feed.entity';
import { FeedRepository } from './feeds.repository';
import { Likes } from '../likes/entities/like.entity';
import { LikeRepository } from 'src/likes/likes.repository';
import { CommentRepository } from 'src/comments/comments.repository';
import { Region } from 'src/quests/entities/region.entity';
import { Quest } from 'src/quests/entities/quest.entity';

@Injectable()
export class FeedsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository,
    private likeRepository: LikeRepository,
    private commentRepository: CommentRepository
  ) {}

  /* 모든 피드 가져오기 */
  async findAllFeeds(playerId: number, regionData: any) {
    const { regionSi, regionGu, regionDong } = regionData;

    // const feeds = await Feed.find({
    //   where: {
    //     deletedAt: null,
    //     region: {
    //       regionSi: '서울시',
    //       regionGu: '강남구',
    //       regionDong: '삼성동',
    //     },
    //   },
    //   relations: ['player', 'likes', 'comments', 'region'],
    // });

    /* queryBuilder */
    const feeds = await Feed.createQueryBuilder('feed')
      .select([
        'feed',
        'player.id',
        'player.email',
        'player.nickname',
        'player.mbti',
        'player.profileImg',
        'player.level',
        'player.exp',
      ])
      .where({ deletedAt: null })
      .leftJoinAndSelect('feed.quest', 'quest')
      .leftJoin('feed.player', 'player')
      .leftJoinAndSelect('feed.comments', 'comment')
      .leftJoinAndSelect('feed.likes', 'likes')
      .leftJoinAndSelect('feed.region', 'region')
      .where(
        'region.regionSi = :si and region.regionGu = :gu and region.regionDong = :dong',
        { si: '서울시', gu: '강남구', dong: '삼성동' }
      )
      .getMany();

    const likeLst = await this.likeRepository.find({
      relations: ['player', 'feed'],
    });

    let liked;
    return feeds.map((feed) => {
      const likeCnt = feed.likes.length;
      const commentCnt = feed.comments.length;
      liked = false;
      likeLst.map((like) => {
        if (like.player.id === playerId && feed.id === like.feed.id) {
          liked = true;
        }
      });
      return { ...feed, likeCnt, liked, commentCnt };
    });
  }

  /* 특정 피드 가저오기 */
  async findOneFeed(feedId: number): Promise<Feed> {
    const content = await this.feedRepository.findOne({
      where: {
        id: feedId,
      },
      relations: ['player'],
    });
    if (!content) {
      // throw new NotFoundException(`content id ${feedId} not found`);
      throw new NotFoundException({
        ok: false,
        message: `피드 id ${feedId}를 찾을 수 없습니다.`,
      });
    }
    return content;
  }

  /* 현재 사용자와 피드 작성자가 일치하는지 확인 */
  async matchPlayerFeed(playerId: number, feed: Feed) {
    if (feed && playerId === feed.player.id) {
      return true;
    }
    return false;
  }

  /* 피드 수정 */
  async updateFeed(
    playerId: number,
    feedId: number,
    img: string[],
    feedContent: string
  ) {
    const feed = await this.findOneFeed(feedId);
    const match = await this.matchPlayerFeed(playerId, feed);
    if (feed) {
      if (match) {
        return this.feedRepository.updateFeed(
          playerId,
          feedId,
          img,
          feedContent
        );
      } else {
        throw new BadRequestException({
          ok: false,
          message: `피드 작성자만 수정할 수 있습니다.`,
        });
      }
    }
    throw new BadRequestException({
      ok: false,
      message: `피드 id ${feedId} 를 찾을 수 없습니다.`,
    });
  }

  /* 피드 삭제 */
  async removeQuest(playerId: number, feedId: number): Promise<void | object> {
    // const feed = await this.feedRepository.findOne(feedId);
    const feed = await this.feedRepository.findOne({
      where: {
        id: feedId,
        deletedAt: null,
      },
      relations: ['player', 'quest'],
    });
    const match = await this.matchPlayerFeed(playerId, feed);
    if (feed) {
      if (match) {
        return this.feedRepository.deleteFeed(playerId, feedId, feed);
      } else {
        throw new BadRequestException({
          ok: false,
          message: `피드 작성자만 삭제할 수 있습니다.`,
        });
      }
    }
    throw new NotFoundException({
      ok: false,
      message: `피드 id ${feedId} 를 찾을 수 없습니다.`,
    });
  }
}
