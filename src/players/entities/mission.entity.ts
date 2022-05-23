import { IsEmail, IsNotEmpty } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Complete } from 'src/quests/entities/complete.entity';
import { Achievement } from './achievement.entity';

//연결해야함
@Entity()
export class Mission extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'missionId' }) id: number;

  @Column({
    type: 'varchar',
    length: 128,
  })
  title: string;

  @IsNotEmpty()
  @Column({
    type: 'varchar',
  })
  description: string;

  @IsNotEmpty()
  @Column({
    type: 'int',
  })
  setGoals: number;

  @IsNotEmpty()
  @Column({
    type: 'varchar',
  })
  badge: string;

  @IsNotEmpty()
  @Column({
    type: 'varchar',
  })
  type: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany((type) => Achievement, (achievement) => achievement.mission)
  @JoinColumn({ name: 'id' })
  achievements: Achievement[];
}
