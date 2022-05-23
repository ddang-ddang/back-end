import { Player } from 'src/players/entities/player.entity';
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mission } from './mission.entity';
@Entity()
export class Achievement extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne((type) => Player, (player) => player.achievements)
  player: Player;

  @ManyToOne((type) => Mission, (mission) => mission.achievements)
  mission: Mission;
}
