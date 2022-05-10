import { BaseEntity, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Quest } from './quest.entity';
import { Player } from '../../players/entities/player.entity';

@Entity()
export class Complete extends BaseEntity {
  @ManyToOne(() => Player, (player) => player.completes)
  @JoinColumn()
  player: Player;

  @ManyToOne(() => Quest, (quest) => quest.completes)
  @JoinColumn()
  quest: Quest;
}
