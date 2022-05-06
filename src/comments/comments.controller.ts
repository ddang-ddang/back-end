import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('/api/feeds/:feedId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // @Post()
  // create(@Body() createCommentDto: CreateCommentDto) {
  //   return this.commentsService.create(createCommentDto);
  // }

  /* 특정 게시글 댓글 조회 */
  @Get()
  async findAllComments(@Param('feedId') feedId: number) {
    try {
      const comments = await this.commentsService.findAllComments(feedId);
      return {
        ok: true,
        rows: comments,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 특정 댓글 조회 */
  @Get(':commentId')
  async findOneComment(@Param() params: number) {
    try {
      const feedId = params['feedId'];
      const commentId = params['commentId'];
      const comment = await this.commentsService.findOneComment(commentId);
      return {
        ok: true,
        row: comment,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 댓글 수정 */
  @Patch(':commentId')
  updateComment(
    @Param() params: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    try {
      const feedId = params['feedId'];
      const commentId = params['commentId'];
      this.commentsService.updateComment(feedId, commentId, updateCommentDto);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 댓글 삭제 */
  @Delete(':commentId')
  removeComment(@Param('commentId') commentId: number) {
    try {
      this.commentsService.removeComment(commentId);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }
}
