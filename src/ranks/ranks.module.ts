import { Module } from '@nestjs/common';
import { RanksController } from './ranks.controller';
import { RanksService } from './ranks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from '../quests/entities/region.entity';
import { QuestRepository } from '../quests/repositories/quest.repository';
import { Complete } from '../quests/entities/complete.entity';
import { Player } from '../players/entities/player.entity';
import { RanksException } from './ranks.exception';

@Module({
  imports: [
    TypeOrmModule.forFeature([Region, Complete, Player, QuestRepository]),
  ],
  controllers: [RanksController],
  providers: [RanksService, RanksException],
})
export class RanksModule {}
