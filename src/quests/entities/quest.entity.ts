import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Region } from 'src/quests/entities/region.entity';
import { Complete } from 'src/quests/entities/complete.entity';

@Entity()
export class Quest extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'questId' })
  id: number;

  @Column('decimal', { precision: 8, scale: 6 })
  lat: number;

  @Column('decimal', { precision: 9, scale: 6 })
  lng: number;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  difficulty: number;

  @Column()
  reward: number;

  @Column({ nullable: true })
  timeUntil: Date;

  @OneToMany(() => Feed, (feed) => feed.quest)
  feeds: Feed[];

  @OneToMany(() => Complete, (complete) => complete.quest)
  completes: Complete[];

  @ManyToOne(() => Region, (region) => region.quests)
  @JoinColumn()
  region: Region;
}
