import { Injectable } from '@nestjs/common';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository,
    private commentRepository: CommentRepository
  ) {}

  feedQuest(files: object[], content: string) {
    const feedText = content['content'];
    const pathList = [];
    files.map((file) => {
      pathList.push(file['path']);
    });
    return this.feedRepository.feedQuest(pathList, feedText);
  }

  commentQuest(content: string) {
    const comment = content['content'];
    return this.commentRepository.commentQuest(comment);
  }
}
