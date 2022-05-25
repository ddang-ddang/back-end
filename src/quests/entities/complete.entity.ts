import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quest } from 'src/quests/entities/quest.entity';
import { Player } from 'src/players/entities/player.entity';

@Entity()
export class Complete extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'completeId' })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Quest, (quest) => quest.completes)
  quest: Quest;

  @Column()
  questId: number;

  @ManyToOne(() => Player, (player) => player.completes)
  player: Player;

  @Column()
  playerId: number;
}
