import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feed } from '../../feeds/entities/feed.entity';
import { Dong } from './dong.entity';

@Entity()
export class Quest extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'dongId' })
  id: number;

  @Column()
  lat: number;

  @Column()
  lng: number;

  @Column()
  type: number;

  @OneToMany((type) => Feed, (feed) => feed.quest)
  feeds: Feed[];

  @ManyToOne((type) => Dong, (dong) => dong.quests)
  dong: Dong;
}
