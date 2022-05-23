import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from 'src/quests/entities/region.entity';
import { Complete } from 'src/quests/entities/complete.entity';
import { QuestRepository } from 'src/quests/repositories/quest.repository';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { PlayerRepository } from 'src/players/players.repository';
import { QuestsController } from 'src/quests/quests.controller';
import { QuestsService } from 'src/quests/quests.service';
import { Notif } from 'src/notifs/entities/notif.entity';
import { Achievement } from '../players/entities/achievement.entity';
import { Mission } from '../players/entities/mission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      Complete,
      Notif,
      Achievement,
      Mission,
      QuestRepository,
      FeedRepository,
      PlayerRepository,
    ]),
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
