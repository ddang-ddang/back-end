import { EntityRepository, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Player } from 'src/players/entities/player.entity';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  /* 댓글 업로드 퀘스트 수행 */
  async createComment(playerId: number, feedId: number, comment: string) {
    const playerOne = await Player.findOne({
      where: {
        id: playerId,
      },
    });

    const newComment = await this.save({
      comment,
      feed: feedId,
      player: playerId,
      playerOne,
    });

    return {
      id: newComment.id,
      comment: newComment.comment,
      player: {
        id: newComment.playerOne.id,
        email: newComment.playerOne.email,
        nickname: newComment.playerOne.nickname,
        mbti: newComment.playerOne.mbti,
        profileImg: newComment.playerOne.profileImg,
        level: newComment.playerOne.level,
        exp: newComment.playerOne.exp,
      },
    };
  }

  /* 댓글 수정 */
  async updateComment(
    feedId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const { comment } = updateCommentDto;
    const updateComment = await this.update(
      { id: commentId },
      {
        comment,
      }
    );

    console.log(updateComment);
    return updateComment;
  }
  /* 댓글 삭제 */
  async deleteComment(commentId: number) {
    await this.update({ id: commentId }, { deletedAt: new Date() });
    return;
  }
}
