import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Comment } from './entities/comment.entity';
import { CommentRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository
  ) {}

  /* 댓글 작성 */
  async createComment(
    playerId: number,
    feedId: number,
    createCommentDto: CreateCommentDto
  ) {
    const comment = createCommentDto.comment;
    const feed: Feed = await Feed.findOne(feedId);
    if (!feed) {
      throw new NotFoundException(`feed not found`);
    }
    return this.commentRepository.commentQuest(playerId, feed, comment);
  }

  /* 특정 게시글의 모든 댓글 조회 */
  findAllComments(feedId: number) {
    return this.commentRepository.find({
      where: {
        feed: feedId,
        deletedAt: null,
      },
    });
  }

  /* 특정 댓글 조회 */
  async findOneComment(commentId: number) {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        deletedAt: null,
      },
      relations: ['player'],
    });
    if (!comment) {
      // throw new NotFoundException(`comment not found id ${commentId}`);
      throw new NotFoundException({
        ok: false,
        message: `댓글 id ${commentId}를 찾을 수 없습니다.`,
      });
    }
    return comment;
  }

  /* 댓글 작성자와 현재 유저 매칭 */
  async matchPlayerComment(playerId: number, comment: Comment) {
    if (playerId === comment.player.Id) {
      return true;
    }
    return false;
  }

  /* 댓글 수정 */
  async updateComment(
    playerId: number,
    feedId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const comment = await this.findOneComment(commentId);
    const match = await this.matchPlayerComment(playerId, comment);
    if (comment) {
      if (match) {
        return await this.commentRepository.updateComment(
          feedId,
          commentId,
          updateCommentDto
        );
      } else {
        throw new BadRequestException({
          ok: false,
          message: `댓글 작성자만 수정할 수 있습니다.`,
        });
      }
    } else {
      throw new NotFoundException({
        ok: false,
        message: `댓글 id ${commentId} 를 찾을 수 없습니다.`,
      });
    }
  }

  /* 댓글 삭제 */
  async removeComment(playerId: number, commentId: number) {
    const comment = await this.findOneComment(commentId);
    const match = await this.matchPlayerComment(playerId, comment);
    if (comment) {
      if (match) {
        return this.commentRepository.deleteComment(commentId);
      } else {
        throw new BadRequestException({
          ok: false,
          message: `댓글 작성자만 삭제할 수 있습니다.`,
        });
      }
    } else {
      throw new NotFoundException({
        ok: false,
        message: `댓글 id ${commentId} 를 찾을 수 없습니다.`,
      });
    }
  }
}
