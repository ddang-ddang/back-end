import { Controller, Body, Put, Param } from '@nestjs/common';
import { LikesService } from './likes.service';

@Controller('/api/feeds/:feedId/like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Put()
  chkLike(@Param('feedId') feedId: number, @Body() playerId: any) {
    const { player } = playerId;
    return this.likesService.chkLike(feedId, player);
  }
}
