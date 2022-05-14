import {
  Controller,
  Body,
  Put,
  Param,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller('/api/feeds/:feedId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Put()
  @ApiOperation({ summary: '좋아요 API' })
  @UseGuards(JwtAuthGuard)
  async chkLike(@Req() req: Request, @Param('feedId') feedId: number) {
    try {
      const { playerId } = req['user'].player;
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
