import { Player } from 'src/players/entities/player.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Mission } from './mission.entity';

@Entity()
export class Achievement extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'achievementId' })
  id: number;

  @ManyToOne((type) => Mission, (mission) => mission.achievements)
  mission: Mission;

  @ManyToOne((type) => Player, (player) => player.achievements)
  player: Player;
}
