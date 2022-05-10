import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeRepository } from './likes.repository';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(LikeRepository)
    private likeRepository: LikeRepository
  ) {}

  chkLike(feedId: number, playerId: any) {
    this.likeRepository.chkLike(feedId, playerId);
  }
}
