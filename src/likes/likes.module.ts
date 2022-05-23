import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { LikeRepository } from './likes.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LikeRepository])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
