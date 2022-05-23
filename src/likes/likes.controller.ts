import {
  Controller,
  Body,
  Put,
  Param,
  UseGuards,
  Req,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller('/api/feeds/:feedId/like')
export class LikesController {
  private logger = new Logger('LikesController');
  constructor(private readonly likesService: LikesService) {}

  @Put()
  @ApiOperation({ summary: '좋아요 API' })
  @UseGuards(JwtAuthGuard)
  async chkLike(@Req() req: Request, @Param('feedId') feedId: number) {
    try {
      const { playerId } = req['user'].player;
      const likeClk = await this.likesService.chkLike(feedId, playerId);
      if (likeClk) {
        this.logger.verbose(
          `trying to like feedId: ${feedId}, userId: ${playerId}`
        );
        return {
          ok: true,
          message: `좋아요 클릭!`,
        };
      } else {
        this.logger.verbose(
          `trying to cancel like feedId: ${feedId}, userId: ${playerId}`
        );
        return {
          ok: true,
          message: `좋아요 취소!`,
        };
      }
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }
}
