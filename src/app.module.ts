import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FeedsModule } from './feeds/feeds.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsController } from './achievements/achievements.controller';

@Module({
  imports: [UsersModule, FeedsModule, CommentsModule, LikesModule],
  controllers: [AppController, AchievementsController],
  providers: [AppService, AchievementsService],
})
export class AppModule {}
