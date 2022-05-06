import { IsEmail } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//연결해야함
@Entity()
export class Players extends BaseEntity {
  @PrimaryGeneratedColumn()
  playerId: number;

  // @IsEmail()
  @Column({
    type: 'varchar',
    length: 128,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  nickname: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  password: string;

  @Column({
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
