import { EntityRepository, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateQuestDto } from 'src/quests/dto/create-quest.dto';
import { Feed } from 'src/feeds/entities/feed.entity';
import { Player } from 'src/players/entities/player.entity';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  /* 댓글 업로드 퀘스트 수행 */
  async commentQuest(playerId: number, feed: Feed, comment: string) {
    const player = await Player.findOne({
      where: {
        Id: playerId,
      },
    });

    const newComment = this.create({
      comment,
      feed,
      player,
    });
    await this.save(newComment);

    return newComment;
  }

  /* 댓글 수정 */
  async updateComment(
    feedId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const { comment } = updateCommentDto;
    return this.update(
      { id: commentId },
      {
        comment,
      }
    );
  }
  /* 댓글 삭제 */
  async deleteComment(commentId: number) {
    await this.update({ id: commentId }, { deletedAt: new Date() });
    return;
  }
}
