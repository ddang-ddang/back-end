import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository
  ) {}

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
    });
    if (!comment) {
      throw new NotFoundException(`comment not found id ${commentId}`);
    }
    return comment;
  }

  async updateComment(
    feedId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const comment = await this.findOneComment(commentId);
    if (comment) {
      return this.commentRepository.updateComment(
        feedId,
        commentId,
        updateCommentDto
      );
    }
  }

  removeComment(commentId: number) {
    const comment = this.findOneComment(commentId);
    if (!comment) {
      return {
        ok: false,
        message: `not found`,
      };
    }
    return this.commentRepository.deleteComment(commentId);
  }
}
