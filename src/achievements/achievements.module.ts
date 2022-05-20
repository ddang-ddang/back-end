import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { AchievementsController } from './achievements.controller';
import { AchievementRepository } from './achievements.repository';
import { AchievementsService } from './achievements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AchievementRepository, PlayerRepository]),
  ],
  controllers: [AchievementsController],
  providers: [AchievementsService],
})
export class AchievementsModule {}
