import { JwtModule } from '@nestjs/jwt'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FeedsModule } from './feeds/feeds.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { QuestsModule } from './quests/quests.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from '../config/ormconfig';
import { AchievementsService } from './achievements/achievements.service';
import { AchievementsController } from './achievements/achievements.controller';
import * as config from 'config';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { Players } from './players/entities/player.entity';
import { FeedRepository } from './feeds/feeds.repository';
import { PassportModule } from '@nestjs/passport';
import { PlayersController } from './players/players.controller';
import { PlayersService } from './players/players.service';
import { AuthService } from './auth/auth.service';
import { FeedsService } from './feeds/feeds.service';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forRoot(typeORMConfig),
    TypeOrmModule.forFeature([Players, FeedRepository]),
    AuthModule,
    PlayersModule,
    TypeOrmModule.forRoot(typeORMConfig),
    UsersModule,
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
