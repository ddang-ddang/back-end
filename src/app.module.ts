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
import { AuthModule } from './auth/auth.module';

// Service imports
import { AppService } from './app.service';
import { AchievementsService } from './achievements/achievements.service';
import { PlayersService } from './players/players.service';
import { AuthService } from './auth/auth.service';

// 내장 NESTJS 모듈
import config from 'config/ormconfig';
import { ConfigModule } from '@nestjs/config';
import { Players } from './players/entities/player.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './config/.env.development',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([Players]),
    FeedsModule,
    CommentsModule,
    LikesModule,
    QuestsModule,
    JwtModule.register({
      secret: 'SecretKey',
      signOptions: { expiresIn: '60s' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AppController, AchievementsController, PlayersController],
  providers: [AppService, AchievementsService, PlayersService, AuthService],
})
export class AppModule {}
