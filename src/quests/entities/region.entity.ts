import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quest } from 'src/quests/entities/quest.entity';
import { Feed } from 'src/feeds/entities/feed.entity';

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

  @Column()
  totalCount: number;

  @Column()
  pageCount: number;

  @OneToMany((type) => Quest, (quest) => quest.region)
  quests: Quest[];

  @OneToMany((type) => Feed, (feed) => feed.region)
  feeds: Feed[];
}
