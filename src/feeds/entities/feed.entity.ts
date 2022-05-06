import { Like } from 'src/likes/entities/like.entity';
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
import { Place } from './place.entity';

@Entity()
export class Feed extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'feedId' })
  id: number;

  @Column({ default: null })
  image1: string;

  @Column({ default: null })
  image2: string;

  @Column({ default: null })
  image3: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany((type) => Comment, (comment) => comment.feed)
  @JoinColumn({ name: 'id' })
  comments: Comment[];

  @ManyToOne((type) => Place, (place) => place.feeds)
  place: Place;
}
