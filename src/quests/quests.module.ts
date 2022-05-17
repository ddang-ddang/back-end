import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from 'src/quests/entities/region.entity';
import { Complete } from 'src/quests/entities/complete.entity';
import { QuestRepository } from 'src/quests/repositories/quest.repository';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { PlayerRepository } from 'src/players/players.repository';
import { QuestsController } from 'src/quests/quests.controller';
import { QuestsService } from 'src/quests/quests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      Complete,
      QuestRepository,
      FeedRepository,
      PlayerRepository,
    ]),
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
