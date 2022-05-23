import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeRepository } from './likes.repository';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository
  ) {}

  async chkLike(feedId: number, playerId: number) {
    const liked = await this.likeRepository.chkLike(feedId, playerId);
    const { likeClk } = liked;
    return likeClk;
  }
}
