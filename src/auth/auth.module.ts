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
import { JwtRefreshTokenStrategy } from './jwt/jwt-refresh-strategy';

const jwtConfig = config.get('jwt');

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    PlayersModule,
    JwtModule.register({
      secret: jwtConfig.accessSecret,
      signOptions: { expiresIn: `${jwtConfig.accessTokenExp}s` },
    }),
    JwtModule.register({
      secret: jwtConfig.refreshSecret,
      signOptions: { expiresIn: `${jwtConfig.refreshTokenExp}s` },
    }),
    TypeOrmModule.forFeature([PlayerRepository]),
  ],
  providers: [
    AuthService,
    // SessionSerializer,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GoogleStrategy,
    KakaoStrategy,
  ],
  exports: [AuthService, JwtStrategy, JwtRefreshTokenStrategy, PassportModule],
})
export class AuthModule {}
