import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeedsModule } from './feeds/feeds.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { PlayersController } from './players/players.controller';
import { PlayersService } from './players/players.service';
import { PlayersModule } from './players/players.module';

// 내장 NESTJS 모듈

import * as config from 'config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from '../config/ormconfig';
import { AchievementsController } from './achievements/achievements.controller';
import { AchievementsService } from './achievements/achievements.service';
import { QuestsModule } from './quests/quests.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeORMConfig),
    PlayersModule,
    FeedsModule,
    CommentsModule,
    LikesModule,
    QuestsModule,
  ],
  controllers: [AppController, AchievementsController, PlayersController],
  providers: [AppService, AchievementsService, PlayersService],
})
export class AppModule {}
