import { Likes } from 'src/likes/entities/like.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Player } from 'src/players/entities/player.entity';
import { Quest } from '../../quests/entities/quest.entity';
import { Region } from 'src/quests/entities/region.entity';

@Entity()
export class Feed extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'feedId' })
  id: number;

  @Column({ default: null })
  image1_url: string;

  @Column({ default: null })
  image2_url: string;

  @Column({ default: null })
  image3_url: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany((type) => Comment, (comment) => comment.feed, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'id' })
  comments: Comment[];

  @ManyToOne((type) => Player, (player) => player.feeds)
  player: Player;

  @ManyToOne((type) => Quest, (quest) => quest.feeds)
  quest: Quest;

  @OneToMany((type) => Likes, (like) => like.feed)
  likes: Likes[];

  @ManyToOne((type) => Region, (region) => region.feeds)
  region: Region;
}
