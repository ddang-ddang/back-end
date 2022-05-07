import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FeedsModule } from './feeds/feeds.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { QuestsModule } from './quests/quests.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from '../ormconfig';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsController } from './achievements/achievements.controller';
import * as config from 'config';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { FeedRepository } from './feeds/feeds.repository';
import { PassportModule } from '@nestjs/passport';
import { PlayersController } from './players/players.controller';
import { PlayersService } from './players/players.service';
import { AuthService } from './auth/auth.service';
import { FeedsService } from './feeds/feeds.service';
import { PlayerRepository } from './players/players.repository';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    TypeOrmModule.forFeature([PlayerRepository, FeedRepository]),
    AuthModule,
    PlayersModule,
    TypeOrmModule.forRoot(typeORMConfig),
    FeedsModule,
    CommentsModule,
    LikesModule,
    QuestsModule,
  ],
  controllers: [AppController, PlayersController, AchievementsController],
  providers: [
    AppService,
    AchievementsService,
    PlayersService,
    AuthService,
    FeedsService,
  ],
})
export class AppModule {}
