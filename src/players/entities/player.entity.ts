import { IsEmail, isEmpty, IsEmpty, IsNotEmpty } from 'class-validator';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
