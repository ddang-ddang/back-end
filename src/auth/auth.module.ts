import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local/local.strategy';
import { PlayersModule } from 'src/players/players.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import * as config from 'config';
import { ConfigModule } from '@nestjs/config';
import { PlayerRepository } from 'src/players/players.repository';
import { GoogleStrategy } from './google/google.strategy';
import { KakaoStrategy } from './kakao/kakao-strategy';
import { SessionSerializer } from './session/session.seralizer';
import { PassportModule } from '@nestjs/passport';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    PlayersModule,
    JwtModule.register({
      secret: jwtConfig.secret,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forFeature([PlayerRepository]),
  ],
  providers: [
    AuthService,
    SessionSerializer,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    KakaoStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
