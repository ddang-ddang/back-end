import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Logger,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('/api/feeds/:feedId/comments')
@ApiTags('댓글 API')
export class CommentsController {
  private logger = new Logger('CommentController');
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: '댓글 작성 API' })
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Req() req: Request,
    @Param('feedId') feedId: number,
    @Body() createCommentDto: CreateCommentDto
  ) {
    const { playerId } = req['user'].player;
    this.logger.verbose(`trying to create comment by userId ${playerId}`);
    try {
      const comment = await this.commentsService.createComment(
        playerId,
        feedId,
        createCommentDto
      );
      return {
        ok: true,
        comment,
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  }

  /* 특정 게시글 댓글 조회 */
  @Get()
  @ApiOperation({ summary: '특정 게시글의 댓글 조회 API' })
  async findAllComments(@Param('feedId') feedId: number) {
    this.logger.verbose(`trying to get all comments feedId: ${feedId}`);
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
  @ApiOperation({ summary: '게시글의 특정 댓글 조회 API' })
  async findOneComment(@Param() params: number) {
    try {
      const feedId = params['feedId'];
      this.logger.verbose(`trying to get a comment feedId: ${feedId}`);
      const commentId = params['commentId'];
      const comment = await this.commentsService.findOneComment(
        commentId,
        feedId
      );
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
  @ApiOperation({ summary: '댓글 수정 API' })
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Req() req: Request,
    @Param() params: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const { playerId } = req['user'].player;
    const feedId = params['feedId'];
    const commentId = params['commentId'];
    this.logger.verbose(
      `trying to update comment commentId: ${commentId} userId: ${playerId}`
    );
    try {
      await this.commentsService.updateComment(
        playerId,
        feedId,
        commentId,
        updateCommentDto
      );
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
  @ApiOperation({ summary: '댓글 삭제 API' })
  @UseGuards(JwtAuthGuard)
  async removeComment(
    @Req() req: Request,
    @Param('commentId') commentId: number
  ) {
    const { playerId } = req['user'].player;
    this.logger.verbose(
      `trying to delete commentId: ${commentId} userId: ${playerId}`
    );
    try {
      await this.commentsService.removeComment(playerId, commentId);
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
