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
import { CommentException } from './comments.exception';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository,
    private commentException: CommentException
  ) {}

  /* 댓글 작성 */
  async createComment(
    playerId: number,
    feedId: number,
    createCommentDto: CreateCommentDto
  ) {
    const commentText = createCommentDto.comment;
    const feed: Feed = await Feed.findOne(feedId);
    if (feed) {
      return this.commentRepository.createComment(playerId, feed, commentText);
    }
    this.commentException.NotFoundFeed();
  }

  /* 특정 게시글의 모든 댓글 조회 */
  async findAllComments(feedId: number) {
    /* queryBuilder */
    return await this.commentRepository
      .createQueryBuilder('comment')
      .select([
        'comment',
        'player.id',
        'player.nickname',
        'player.mbti',
        'player.profileImg',
        'player.level',
        'player.exp',
      ])
      .leftJoin('comment.player', 'player')
      .leftJoinAndSelect('comment.feed', 'feed')
      .where('feed.id = :feedId', { feedId })
      .getMany();
  }

  /* 특정 댓글 조회 */
  async findOneComment(commentId: number, feedId?: number) {
    const feed = await Feed.findOne({ id: feedId });
    if (!feed) {
      this.commentException.NotFoundFeed();
    }

    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        deletedAt: null,
      },
      relations: ['player'],
    });
    if (!comment) {
      // throw new NotFoundException({
      //   ok: false,
      //   message: `댓글 id ${commentId}를 찾을 수 없습니다.`,
      // });
      this.commentException.NotFoundComment();
    }
    return comment;
  }

  /* 댓글 작성자와 현재 유저 매칭 */
  async matchPlayerComment(playerId: number, comment: Comment) {
    if (playerId === comment.player.id) {
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
    const comment = await this.findOneComment(feedId, commentId);
    const match = await this.matchPlayerComment(playerId, comment);
    if (comment) {
      if (match) {
        return await this.commentRepository.updateComment(
          feedId,
          commentId,
          updateCommentDto
        );
      } else {
        // throw new BadRequestException({
        //   ok: false,
        //   message: `댓글 작성자만 수정할 수 있습니다.`,
        // });
        this.commentException.CannotEditComment();
      }
    } else {
      this.commentException.NotFoundComment();
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
        // throw new BadRequestException({
        //   ok: false,
        //   message: `댓글 작성자만 삭제할 수 있습니다.`,
        // });
        this.commentException.CannotDeleteComment();
      }
    } else {
      this.commentException.NotFoundComment();
    }
  }
}
