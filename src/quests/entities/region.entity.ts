import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Quest } from 'src/quests/entities/quest.entity';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Notif } from 'src/notifs/entities/notif.entity';

@Entity()
@Unique(['date', 'regionGu', 'regionDong'])
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

  @CreateDateColumn({})
  createdAt: Date;

  @OneToMany((_) => Quest, (quest) => quest.region)
  quests: Quest[];

  @OneToMany((_) => Feed, (feed) => feed.region)
  feeds: Feed[];

  @OneToMany((_) => Notif, (notif) => notif.region)
  notifs: Notif[];
}
