import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Like } from 'src/likes/entities/like.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

//연결해야함
@Entity()
export class Player extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'playerId' })
  Id: number;

  @IsEmail()
  @Column({
    type: 'varchar',
    length: 128,
  })
  email: string;

  @IsNotEmpty()
  @Column({
    type: 'varchar',
    length: 20,
  })
  nickname: string;

  @IsNotEmpty()
  @Column({
    type: 'varchar',
  })
  password: string;

  @IsNotEmpty()
  @Column({
    type: 'varchar',
    length: 20,
  })
  mbti: string;

  @IsNotEmpty()
  @Column({
    // default: false,
  })
  profileImg: string;

  @IsEmpty()
  @Column({
    default: 1,
  })
  level: number;

  @IsEmpty()
  @Column({
    default: 0,
  })
  exp: number;

  @OneToMany((type) => Feed, (feed) => feed.player)
  @JoinColumn({ name: 'id' })
  feeds: Feed[];

  @OneToMany((type) => Comment, (comment) => comment.player)
  @JoinColumn({ name: 'id' })
  comments: Comment[];

  // @OneToMany((type) => Like, (like) => like.player)
  // likes: Like[];
}
