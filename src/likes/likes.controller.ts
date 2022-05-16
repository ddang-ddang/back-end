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
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
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
      this.logger.verbose(
        `trying to click button feedId: ${feedId}, by user ${playerId}`
      );
      const likeClk = await this.likesService.chkLike(feedId, playerId);
      if (likeClk) {
        return {
          ok: true,
          message: `좋아요 클릭!`,
        };
      } else {
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
