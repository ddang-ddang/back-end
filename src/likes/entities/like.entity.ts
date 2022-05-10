import { Feed } from 'src/feeds/entities/feed.entity';
import { Player } from 'src/players/entities/player.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Player, (player) => player.likes)
  player: Player;

  @ManyToOne((type) => Feed, (feed) => feed.likes)
  feed: Feed;
}
