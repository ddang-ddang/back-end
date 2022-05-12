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
