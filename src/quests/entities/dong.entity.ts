import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quest } from './quest.entity';

@Entity()
export class Dong extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'dongId' })
  id: number;

  @Column()
  date: string;

  @Column()
  regionSi: string;

  @Column()
  regionGu: string;

  @Column()
  regionDong: string;

  @OneToMany((type) => Quest, (quest) => quest.dong)
  quests: Quest[];
}
