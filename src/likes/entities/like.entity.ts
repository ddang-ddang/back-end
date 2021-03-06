import { Feed } from 'src/feeds/entities/feed.entity';
import { Player } from 'src/players/entities/player.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Player, (player) => player.likes)
  player: Player;

  @Column()
  playerId: number;

  @ManyToOne((type) => Feed, (feed) => feed.likes)
  feed: Feed;

  @Column()
  feedId: number;
}
