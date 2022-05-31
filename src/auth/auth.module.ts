import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local/local.strategy';
import { PlayersModule } from 'src/players/players.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { PlayerRepository } from 'src/players/players.repository';
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
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXP}s` },
    }),
    JwtModule.register({
      secret: jwtConfig.refreshTokenSecret,
      signOptions: { expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXP}s` },
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
