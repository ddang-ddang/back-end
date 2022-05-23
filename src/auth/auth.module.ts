import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './google/google.strategy';
import { KakaoStrategy } from './kakao/kakao-strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtRefreshTokenStrategy } from './jwt/jwt-refresh-strategy';
import { jwtConfig } from '../../configs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    PlayersModule,
    JwtModule.register({
      secret: jwtConfig.accessTokenSecret,
      signOptions: { expiresIn: `${jwtConfig.accessTokenExp}s` },
    }),
    JwtModule.register({
      secret: jwtConfig.refreshTokenSecret,
      signOptions: { expiresIn: `${jwtConfig.refreshTokenExp}s` },
    }),
    TypeOrmModule.forFeature([PlayerRepository]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshTokenStrategy,
    GoogleStrategy,
    KakaoStrategy,
  ],
  exports: [AuthService, JwtStrategy, JwtRefreshTokenStrategy, PassportModule],
})
export class AuthModule {}
