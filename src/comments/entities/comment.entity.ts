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
import { Feed } from '../../feeds/entities/feed.entity';
import { Player } from '../../players/entities/player.entity';

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
