import { Feed } from 'src/feeds/entities/feed.entity';
import { Player } from 'src/players/entities/player.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'commentId' })
  id: number;

  @Column()
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne((type) => Feed, (feed) => feed.comments)
  feed: Feed;

  @ManyToOne((type) => Player, (player) => player.comments)
  player: Player;
}
