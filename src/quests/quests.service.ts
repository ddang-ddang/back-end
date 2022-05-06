import { Injectable } from '@nestjs/common';
import { CreateFeedQuestDto } from './dto/create-feedquest.dto';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(FeedRepository)
    private feedRepository: FeedRepository
  ) {}

  feedQuest(files: object[], createFeedQuestDto: CreateFeedQuestDto) {
    const pathList = [];
    files.map((file) => {
      pathList.push(file['path']);
    });
    return this.feedRepository.feedQuest(pathList, createFeedQuestDto);
  }
}
