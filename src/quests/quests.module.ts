import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedRepository]),
    TypeOrmModule.forFeature([CommentRepository]),
    HttpModule
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
