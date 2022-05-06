import { Module } from '@nestjs/common';
import { FeedsService } from './feeds.service';
import { FeedsController } from './feeds.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedRepository } from './feeds.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FeedRepository])],
  controllers: [FeedsController],
  providers: [FeedsService],
})
export class FeedsModule {}
