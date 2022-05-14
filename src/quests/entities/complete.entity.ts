import {
  BaseEntity,
  CreateDateColumn,
  Entity,
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

  @ManyToOne(() => Quest, (quest) => quest.completes)
  quest: Quest;

  @ManyToOne(() => Player, (player) => player.completes)
  player: Player;
}
