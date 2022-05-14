import { Test } from '@nestjs/testing';
import { QuestsService } from './quests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommentRepository } from '../comments/comments.repository';
import { QuestsRepository } from './quests.repository';
import { RegionsRepository } from './regions.repository';
import { Repository } from 'typeorm';
import { Complete } from './entities/complete.entity';
import { FeedRepository } from '../feeds/feeds.repository';

const mockFeedRepository = {
  feedQuest: jest.fn(),
  updateFeed: jest.fn(),
  deleteFeed: jest.fn(),
};
const mockCompleteRepository = {
  findOne: jest.fn(),
};
const mockCommentRepository = {};
const mockQuestsRepository = {
  createAndSave: jest.fn(),
  findAll: jest.fn(),
  findOneBy: jest.fn(),
  findOneWithCompletes: jest.fn(),
};
const mockRegionsRepository = {
  createAndSave: jest.fn(),
  findByAddrs: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('QuestsService', () => {
  let service: QuestsService;
  let questsRepository;
  let feedRepository;
  let completeRepository: MockRepository<Complete>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        // 퀘스트 서비스만 진짜, 나머지는 가짜(mock)
        QuestsService,
        // 레포지토리 필요 (독립적 테스팅)
        {
          provide: FeedRepository,
          useValue: mockFeedRepository,
        },
        {
          provide: getRepositoryToken(Complete),
          useValue: mockCompleteRepository,
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
      ],
    }).compile();
    service = module.get<QuestsService>(QuestsService);
    questsRepository = module.get(QuestsRepository);
    feedRepository = module.get(FeedRepository);
    completeRepository = module.get(getRepositoryToken(Complete));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('questComplete', () => {
    it('should fail if quest not exists', async () => {
      questsRepository.findOneBy.mockResolvedValue(undefined);
      const result = await service.questComplete(-1, 1);

      expect(result).toMatchObject({
        ok: false,
        message: '요청하신 퀘스트를 찾을 수 없습니다.',
      });
    });

    it('should fail if quest is already completed', async () => {
      questsRepository.findOneBy.mockResolvedValue({ quest: {} });
      completeRepository.findOne.mockResolvedValue({ quest: {}, player: {} });
      const result = await service.questComplete(1, 1);

      expect(result).toMatchObject({
        ok: false,
        message: '퀘스트를 이미 완료하였습니다.',
      });
    });
  });

  it.todo('getAll');
  it.todo('getOne');
});
