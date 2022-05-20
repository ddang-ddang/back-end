import { Controller, Get, UseGuards, Req, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { AchievementsService } from './achievements.service';

@Controller('api/achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyData(@Req() req: Request) {
    const { playerId } = req['user'].player;
    const myData = await this.achievementsService.getMyData(playerId);
    return {
      ok: true,
      ...myData,
    };
  }
}
