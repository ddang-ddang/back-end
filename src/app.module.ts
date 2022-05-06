import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FeedsModule } from './feeds/feeds.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { QuestsModule } from './quests/quests.module';
import * as config from 'config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from 'ormconfig';

@Module({
  imports: [
    // ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeORMConfig),
    UsersModule,
    FeedsModule,
    CommentsModule,
    LikesModule,
    QuestsModule,
  ],
  controllers: [AppController, AchievementsController],
  providers: [AppService, AchievementsService],
})
export class AppModule {}
