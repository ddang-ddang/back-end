import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feed } from '../../feeds/entities/feed.entity';
import { Quest } from './quest.entity';

@Entity()
export class Region extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'regionId' })
  id: number;

  @Column()
  date: string;

  @Column()
  regionSi: string;

  @Column()
  regionGu: string;

  @Column()
  regionDong: string;

  @OneToMany((type) => Quest, (quest) => quest.region)
  quests: Quest[];

  @OneToMany((type) => Feed, (feed) => feed.region)
  feeds: Feed[];
}
