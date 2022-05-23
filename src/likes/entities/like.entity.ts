import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Feed } from '../../feeds/entities/feed.entity';
import { Player } from '../../players/entities/player.entity';
@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Player, (player) => player.likes)
  player: Player;

  @ManyToOne((type) => Feed, (feed) => feed.likes)
  feed: Feed;
}
