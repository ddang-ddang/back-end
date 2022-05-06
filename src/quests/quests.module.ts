import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeedRepository])],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
