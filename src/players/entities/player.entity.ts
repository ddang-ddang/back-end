import { IsEmail, IsEmpty, IsNotEmpty } from 'class-validator';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Likes } from 'src/likes/entities/like.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Complete } from '../../quests/entities/complete.entity';

//연결해야함
@Entity()
export class Player extends BaseEntity {
  /* 플레이어 순번*/
  @PrimaryGeneratedColumn({ name: 'playerId' }) Id: number;

  /* 플레이어 이메일 */
  @IsEmail()
  @Column({
    type: 'varchar',
    length: 128,
    unique: true,
  })
  email: string;

  /* 플레이어 닉네임*/
  @IsNotEmpty()
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
  })
  nickname: string;

  /* 플레이어 비밀번호*/
  @IsNotEmpty()
  @Column({
    type: 'varchar',
  })
  password: string;

  /* 플레이어 MBTI */
  @IsNotEmpty()
  @Column({
    type: 'varchar',
    length: 20,
  })
  mbti: string;

  /*
   * 플레이어 프로필 사진
   * Front S3에 저장됨
   */
  @IsNotEmpty()
  @Column({
    // default: false,
  })
  profileImg: string;

  /* 플레이어 레빌 */
  @IsEmpty()
  @Column({
    default: 1,
  })
  level: number;

  /* 플레이어 경험치 */
  @IsEmpty()
  @Column({
    default: 0,
  })
  exp: number;

  /* 플레이어 프로바이더 (local, kakao, google) */
  @IsEmpty()
  @Column({
    default: 'local',
  })
  provider: string;

  @Column({
    name: 'providerId',
    type: 'int',
    default: null,
  })
  providerId?: number;

  /* 테이블 관계 */

  /*   */
  @OneToMany((type) => Feed, (feed) => feed.player)
  @JoinColumn({ name: 'id' })
  feeds: Feed[];

  @OneToMany((type) => Comment, (comment) => comment.player)
  @JoinColumn({ name: 'id' })
  comments: Comment[];

  @OneToMany((type) => Likes, (like) => like.player)
  likes: Likes[];

  @OneToMany((type) => Complete, (complete) => complete.quest)
  completes: Complete[];
}
