import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quest } from './quest.entity';
import { Player } from '../../players/entities/player.entity';

@Entity()
export class Complete extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'completeId' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Player, (player) => player.completes)
  @JoinColumn()
  player: Player;

  @ManyToOne(() => Quest, (quest) => quest.completes)
  @JoinColumn()
  quest: Quest;
}
