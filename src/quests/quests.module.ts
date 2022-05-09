import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { QuestsRepository } from 'src/quests/quests.repository';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { Quest } from './entities/quest.entity';
import { Dong } from './entities/dong.entity';
import { DongsRepository } from './dongs.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quest, Dong]),
    TypeOrmModule.forFeature([QuestsRepository]),
    TypeOrmModule.forFeature([DongsRepository]),
    TypeOrmModule.forFeature([FeedRepository]),
    TypeOrmModule.forFeature([CommentRepository]),
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
