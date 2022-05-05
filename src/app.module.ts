import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FeedsModule } from './feeds/feeds.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsController } from './achievements/achievements.controller';
import { QuestsModule } from './quests/quests.module';
import { PlayersController } from './players/players.controller';
import { PlayersService } from './players/players.service';

@Module({
  imports: [UsersModule, FeedsModule, CommentsModule, LikesModule, QuestsModule],
  controllers: [AppController, AchievementsController, PlayersController],
  providers: [AppService, AchievementsService, PlayersService],
})

export class AppModule {}
