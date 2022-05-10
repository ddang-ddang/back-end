import { Feed } from 'src/feeds/entities/feed.entity';
import { Player } from 'src/players/entities/player.entity';
import { EntityRepository, Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@EntityRepository(Like)
export class LikeRepository extends Repository<Like> {
  /* 좋아요 */
  async chkLike(feedId: number, playerId: any) {
    const feed = await Feed.findOne(feedId);
    const player = await Player.findOne(playerId);
    const liked = await this.likedOrNot(feed, player);
    if (!liked) {
      const newLike = this.create({
        feed,
        player,
      });
      this.save(newLike);
    } else {
      this.delete({ feed, player });
    }
  }

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
