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
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller('/api/feeds/:feedId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Put()
  @ApiOperation({ summary: '좋아요 API' })
  @UseGuards(JwtAuthGuard)
  chkLike(@Req() req: Request, @Param('feedId') feedId: number) {
    const { playerId } = req['user'].player;
    return this.likesService.chkLike(feedId, playerId);
  }
}
