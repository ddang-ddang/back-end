import { Test } from '@nestjs/testing';
import { QuestsService } from './quests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Feed } from 'src/feeds/entities/feed.entity';
import { FeedRepository } from '../feeds/feeds.repository';
import { CommentRepository } from '../comments/comments.repository';
import { QuestsRepository } from './quests.repository';
import { RegionsRepository } from './regions.repository';
import { CompletesRepository } from './completes.repository';

const mockRepository = {
  createAndSave: jest.fn(),
  findAll: jest.fn(),
  findOneBy: jest.fn(),
  findOneWithCompletes: jest.fn(),
};

const mockFeedRepository = {
  feedQuest: jest.fn(),
  updateFeed: jest.fn(),
  deleteFeed: jest.fn(),
};

const mockCommentRepository = {};

const mockQuestsRepository = {};

const mockRegionsRepository = {};

const mockCompletesRepository = {};

describe('QuestsService', () => {
  let service: QuestsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        // 퀘스트 서비스만 진짜, 나머지는 가짜(mock)
        QuestsService,
        // 레포지토리 필요 (독립적 테스팅)
        {
          provide: getRepositoryToken(Feed),
          useValue: mockRepository,
        },
        {
          provide: FeedRepository,
          useValue: mockFeedRepository,
        },
        {
          provide: CommentRepository,
          useValue: mockCommentRepository,
        },
        {
          provide: QuestsRepository,
          useValue: mockQuestsRepository,
        },
        {
          provide: RegionsRepository,
          useValue: mockRegionsRepository,
        },
        {
          provide: CompletesRepository,
          useValue: mockCompletesRepository,
        },
      ],
    }).compile();
    service = module.get<QuestsService>(QuestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('questComplete');
  it.todo('getAll');
  it.todo('getOne');
});
