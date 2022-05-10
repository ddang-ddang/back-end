import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feed } from '../../feeds/entities/feed.entity';
import { Dong } from './dong.entity';
import { Complete } from './complete.entity';

@Entity()
export class Quest extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'questId' })
  id: number;

  @Column('decimal', { precision: 8, scale: 6 })
  lat: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lng: number;

  @Column()
  type: number;

  @OneToMany(() => Feed, (feed) => feed.quest)
  feeds: Feed[];

  @OneToMany(() => Complete, (complete) => complete.quest)
  completes: Complete[];

  @ManyToOne(() => Dong, (dong) => dong.quests)
  @JoinColumn()
  dong: Dong;
}
