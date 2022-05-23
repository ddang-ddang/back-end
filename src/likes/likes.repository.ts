import { NotFoundException } from '@nestjs/common';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Player } from 'src/players/entities/player.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Likes } from './entities/like.entity';

@EntityRepository(Likes)
export class LikeRepository extends Repository<Likes> {
  /* 좋아요 */
  async chkLike(feedId: number, playerId: number) {
    const [feed, player] = await Promise.all([
      Feed.findOne(feedId),
      Player.findOne(playerId),
    ]);

    if (!feed) {
      throw new NotFoundException({
        ok: false,
        message: `게시글 id ${feedId} 를 찾을 수 없습니다.`,
      });
    }

    const liked = await this.likedOrNot(feed, player);

    if (!liked) {
      const newLike = this.create({
        feed,
        player,
      });
      this.save(newLike);
      return {
        likeClk: true,
      };
    } else {
      this.delete({ feed, player });
      return {
        likeClk: false,
      };
    }
  }

  /* 좋아요 눌렀는지 판단 */
  async likedOrNot(feed: Feed, player: Player) {
    const liked = await this.findOne({
      where: {
        feed,
        player,
      },
    });
    return liked;
  }
}
