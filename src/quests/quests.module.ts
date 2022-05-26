import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from '../players/entities/achievement.entity';
import { Mission } from '../players/entities/mission.entity';
import { Notif } from '../notifs/entities/notif.entity';
import { FeedRepository } from '../feeds/feeds.repository';
import { Complete } from './entities/complete.entity';
import { QuestsService } from './quests.service';
import { Region } from './entities/region.entity';
import { QuestsController } from './quests.controller';
import { QuestRepository } from './repositories/quest.repository';
import { PlayerRepository } from '../players/players.repository';
import { QuestsException } from './quests.exception';
import { Player } from '../players/entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      Complete,
      Notif,
      Achievement,
      Mission,
      Player,
      QuestRepository,
      FeedRepository,
      PlayerRepository,
    ]),
  ],
  controllers: [QuestsController],
  providers: [QuestsService, QuestsException],
})
export class QuestsModule {}
