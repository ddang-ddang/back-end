import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedRepository } from './feeds.repository';
import { Feed } from './entities/feed.entity';
import { LikeRepository } from '../likes/likes.repository';
import { CommentRepository } from '../comments/comments.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeedRepository,
      LikeRepository,
      CommentRepository,
    ]),
    TypeOrmModule.forFeature([Feed]),
  ],
  controllers: [FeedsController],
  providers: [FeedsService],
})
export class FeedsModule {}
