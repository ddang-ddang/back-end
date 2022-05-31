import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Player } from './entities/player.entity';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { PlayerRepository } from './players.repository';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '../../configs';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Player, PlayerRepository]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXP}s` },
    }),
    JwtModule.register({
      secret: jwtConfig.refreshTokenSecret,
      signOptions: { expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXP}s` },
    }),
  ],
  providers: [PlayersService, AuthService],
  controllers: [PlayersController],
  exports: [PlayersService],
})
export class PlayersModule {}
