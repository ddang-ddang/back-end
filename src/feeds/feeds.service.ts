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

  async measureDist(
    start_lat: number,
    start_lng: number,
    end_lat: number,
    end_lng: number
  ): Promise<number> {
    if (start_lat == end_lat && start_lng == end_lng) return 0;

    const radLat1 = (Math.PI * start_lat) / 180;
    const radLat2 = (Math.PI * end_lat) / 180;
    const theta = start_lng - end_lng;
    const radTheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radLat1) * Math.sin(radLat2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
    if (dist > 1) dist = 1;

    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344 * 1000;
    if (dist < 100) dist = Math.round(dist / 10) * 10;
    else dist = Math.round(dist / 100) * 100;

    return dist;
  }

  /* 모든 피드 가져오기 */
  async findAllFeeds(playerId: number, regionData: any) {
    const { regionSi, regionGu, regionDong, lat, lng } = regionData;
    console.log(regionSi, regionGu, regionDong);
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
        // `date_format(feed.createdAt, '%Y-%m-%d') as ccc`,
        'player.id',
        'player.email',
        'player.nickname',
        'player.mbti',
        'player.profileImg',
        'player.level',
        'player.exp',
        'commentWriter.email',
        'commentWriter.nickname',
        'commentWriter.mbti',
        'commentWriter.profileImg',
        'commentWriter.level',
        'commentWriter.exp',
      ])
      .where({ deletedAt: null })
      .leftJoinAndSelect('feed.quest', 'quest')
      .leftJoin('feed.player', 'player')
      .leftJoinAndSelect('feed.comments', 'comment')
      .leftJoin('comment.player', 'commentWriter')
      .leftJoinAndSelect('feed.likes', 'likes')
      .leftJoinAndSelect('feed.region', 'region')
      .where(
        'region.regionSi = :si and region.regionGu = :gu and region.regionDong = :dong',
        { si: regionSi, gu: regionGu, dong: regionDong }
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
