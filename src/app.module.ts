//  모듈관련
import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FeedsModule } from './feeds/feeds.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { QuestsModule } from './quests/quests.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersModule } from './players/players.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotifsModule } from './notifs/notifs.module';
import { RanksModule } from './ranks/ranks.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';

//  서비스 관련 모듈
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { FeedsService } from './feeds/feeds.service';
import { PlayersService } from './players/players.service';

import { AppController } from './app.controller';
import { PlayersController } from './players/players.controller';

import { FeedRepository } from './feeds/feeds.repository';
import { PlayerRepository } from './players/players.repository';
import { LikeRepository } from './likes/likes.repository';
import { CommentRepository } from './comments/comments.repository';

import { typeORMConfig, jwtConfig } from '../configs';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { FeedException } from './feeds/feeds.exception';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: './config/.env', isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.accessTokenSecret,
      signOptions: { expiresIn: `${jwtConfig.accessTokenSecret}s` },
    }),
    JwtModule.register({
      secret: jwtConfig.refreshTokenSecret,
      signOptions: { expiresIn: `${jwtConfig.refreshTokenExp}s` },
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    TypeOrmModule.forFeature([
      PlayerRepository,
      FeedRepository,
      LikeRepository,
      CommentRepository,
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    PlayersModule,
    FeedsModule,
    CommentsModule,
    LikesModule,
    QuestsModule,
    NotifsModule,
    RanksModule,
    MailModule,
  ],
  controllers: [AppController, PlayersController],
  providers: [
    AppService,
    PlayersService,
    AuthService,
    FeedsService,
    Logger,
    FeedException,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
