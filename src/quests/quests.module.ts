import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from 'src/quests/entities/region.entity';
import { Complete } from 'src/quests/entities/complete.entity';
import { QuestsRepository } from 'src/quests/quests.repository';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { CommentRepository } from 'src/comments/comments.repository';
import { PlayerRepository } from 'src/players/players.repository';
import { QuestsController } from 'src/quests/quests.controller';
import { QuestsService } from 'src/quests/quests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Region,
      Complete,
      QuestsRepository,
      FeedRepository,
      CommentRepository,
      PlayerRepository,
    ]),
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
})
export class QuestsModule {}
