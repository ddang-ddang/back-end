import { EntityRepository, Repository } from 'typeorm';
import { CreateFeedQuestDto } from 'src/quests/dto/create-feedquest.dto';
import { Comment } from './entities/comment.entity';
import { UpdateCommentDto } from './dto/update-comment.dto';

@EntityRepository(Comment)
export class CommentRepository extends Repository<Comment> {
  /* 댓글 업로드 퀘스트 수행 */
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

  async deleteComment(commentId: number) {
    await this.update({ id: commentId }, { deletedAt: new Date() });
    return;
  }
}
