import { Player } from 'src/players/entities/player.entity';
import {
  BaseEntity,
  Column,
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

  @Column()
  playerId: number;

  @ManyToOne((type) => Mission, (mission) => mission.achievements)
  mission: Mission;

  @Column()
  missionId: number;
}
