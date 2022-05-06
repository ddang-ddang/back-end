import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

// Controller imports
import { AppController } from './app.controller';
import { AchievementsController } from './achievements/achievements.controller';
import { PlayersController } from './players/players.controller';

// Module imports
import { FeedsModule } from './feeds/feeds.module';
import { QuestsModule } from './quests/quests.module';
import { CommentsModule } from './comments/comments.module';
import { PlayersModule } from './players/players.module';
import { LikesModule } from './likes/likes.module';

// Service imports
import { AppService } from './app.service';
import { AchievementsService } from './achievements/achievements.service';
import { PlayersService } from './players/players.service';
import { AuthService } from './auth/auth.service';

// import config from 'config/ormconfig';
import { Players } from './players/entities/player.entity';
import { PassportModule } from '@nestjs/passport';

// 내장 NESTJS 모듈
import { ConfigModule } from '@nestjs/config';
import { typeORMConfig } from '../config/ormconfig';
import { FeedsController } from './feeds/feeds.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { FeedsService } from './feeds/feeds.service';
import { FeedRepository } from './feeds/feeds.repository';
import * as config from 'config';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    TypeOrmModule.forFeature([Players, FeedRepository]),
    AuthModule,
    PlayersModule,
    FeedsModule,
    CommentsModule,
    LikesModule,
    QuestsModule,
  ],
  controllers: [
    AppController,
    AchievementsController,
    PlayersController,
    FeedsController,
  ],
  providers: [
    AppService,
    AchievementsService,
    PlayersService,
    AuthService,
    FeedsService,
  ],
})
export class AppModule {}
