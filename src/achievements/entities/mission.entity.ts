import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Achievement } from './achievement.entity';

@Entity()
export class Mission extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'missionId' })
  id: number;

  @Column()
  title: string;

  @Column()
  setGoals: number;

  @Column()
  badge: string;

  @Column()
  type: string;

  @OneToMany((type) => Achievement, (achievement) => achievement.mission)
  achievements: Achievement[];
}
