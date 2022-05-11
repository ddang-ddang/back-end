import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { QuestsRepository } from 'src/quests/quests.repository';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { Quest } from './entities/quest.entity';
import { Region } from './entities/region.entity';
import { RegionsRepository } from './regions.repository';
import { CompletesRepository } from './completes.repository';
import { Complete } from './entities/complete.entity';
import { PlayerRepository } from '../players/players.repository';

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
