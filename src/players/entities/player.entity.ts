import { IsEmail } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//연결해야함
@Entity()
export class Players extends BaseEntity {
  @PrimaryGeneratedColumn()
  playerId: number;

  @IsEmail()
  @Column({
    name: 'email',
    type: 'varchar',
    length: 128,
  })
  email: string;

  @Column({
    name: 'nickname',
    type: 'varchar',
    length: 20,
  })
  nickname: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 20,
  })
  password: string;

  @Column({
    name: 'mbti',
    type: 'varchar',
    length: 20,
  })
  mbti: string;

  @Column({
    // default: false,
  })
  profileImg: string;

  @Column({
    default: 1,
  })
  level: number;

  @Column({
    default: 0,
  })
  exp: number;
}
