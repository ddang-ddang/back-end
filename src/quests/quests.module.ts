import { Module } from '@nestjs/common';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedRepository } from '../feeds/feeds.repository';

@Module({
  // imports: [HttpModule, TypeOrmModule.forFeature([FeedRepository])], // FeedRepository dependency resolve 해결 안되는 원인 찾는중
  imports: [HttpModule],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
