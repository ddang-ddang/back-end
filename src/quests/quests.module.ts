import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { Quest } from './entities/quest.entity';
import { Region } from './entities/region.entity';
import { RegionsRepository } from './regions.repository';
import { CompletesRepository } from './completes.repository';
import { Complete } from './entities/complete.entity';
import { PlayerRepository } from '../players/players.repository';
import { QuestsRepository } from './quests.repository';
import { FeedRepository } from '../feeds/feeds.repository';
import { CommentRepository } from '../comments/comments.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quest, Region, Complete]),
    TypeOrmModule.forFeature([QuestsRepository]),
    TypeOrmModule.forFeature([RegionsRepository]),
    TypeOrmModule.forFeature([CompletesRepository]),
    TypeOrmModule.forFeature([FeedRepository]),
    TypeOrmModule.forFeature([CommentRepository]),
    TypeOrmModule.forFeature([PlayerRepository]),
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
