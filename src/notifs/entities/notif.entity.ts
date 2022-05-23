import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Region } from 'src/quests/entities/region.entity';

@Entity()
export class Notif extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'notifId' })
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Region, (region) => region.notifs)
  @JoinColumn()
  region: Region;
}
