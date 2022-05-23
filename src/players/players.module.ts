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
      secret: jwtConfig.accessTokenSecret,
      signOptions: { expiresIn: `${jwtConfig.accessTokenExp}s` },
    }),
    JwtModule.register({
      secret: jwtConfig.refreshTokenSecret,
      signOptions: { expiresIn: `${jwtConfig.refreshTokenExp}s` },
    }),
  ],
  providers: [PlayersService, AuthService],
  controllers: [PlayersController],
  exports: [PlayersService],
})
export class PlayersModule {}
