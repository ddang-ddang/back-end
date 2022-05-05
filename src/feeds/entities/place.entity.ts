import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Feed } from './feed.entity';

@Entity()
export class Place extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'placeId' })
  id: number;

  @Column()
  placeName: string;

  // @Column('simple-array')
  // coords: number[];
  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lng: number;

  @Column()
  regionSi: string;

  @Column()
  regionGu: string;

  @Column()
  regionDong: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany((type) => Feed, (feed) => feed.place)
  @JoinColumn({ name: 'id' })
  feeds: Feed[];
}
