import { Test } from '@nestjs/testing';
import { QuestsService } from './quests.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuestsRepository } from './quests.repository';
import { Repository } from 'typeorm';
import { Complete } from './entities/complete.entity';
import { Player } from '../players/entities/player.entity';
import { Quest } from './entities/quest.entity';
import { Region } from './entities/region.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Feed } from '../feeds/entities/feed.entity';

const mockQuestsRepository = {
  createAndSave: jest.fn(),
  findAll: jest.fn(),
  findOneBy: jest.fn(),
  findOneWithCompletes: jest.fn(),
};
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('QuestsService', () => {
  let service: QuestsService;
  let questsRepository: MockRepository<Quest>;
  let playersRepository: MockRepository<Player>;
  let completeRepository: MockRepository<Complete>;
  let regionRepository: MockRepository<Region>;
  let commentRepository: MockRepository<Comment>;
  let feedRepository: MockRepository<Feed>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        // 퀘스트 서비스만 진짜, 나머지는 가짜(mock)
        QuestsService,
        // 레포지토리 필요 (독립적 테스팅)
        {
          provide: QuestsRepository,
          useValue: mockQuestsRepository,
        },
        {
          provide: getRepositoryToken(Player),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Complete),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Region),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Feed),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    service = module.get<QuestsService>(QuestsService);
    questsRepository = module.get(QuestsRepository);
    playersRepository = module.get(getRepositoryToken(Player));
    completeRepository = module.get(getRepositoryToken(Complete));
    commentRepository = module.get(getRepositoryToken(Comment));
    feedRepository = module.get(getRepositoryToken(Feed));
    regionRepository = module.get(getRepositoryToken(Region));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('questComplete', () => {
    const findQuestArgs = {
      lat: '37.123456',
      lng: '127.123456',
      type: 'mob',
      title: '몬스터 대결',
      description: '몬스터 물리치기',
      difficulty: 3,
      reward: 100,
    };
    const questId = 1;
    const playerId = 1;

    it('should fail if quest does not exist', async () => {
      questsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.questComplete(questId, playerId);

      expect(result).toEqual({
        ok: false,
        message: '요청하신 퀘스트를 찾을 수 없습니다.',
      });
    });

    it('should fail if player does not exist', async () => {
      questsRepository.findOne.mockResolvedValue(findQuestArgs);
      playersRepository.findOne.mockResolvedValue(undefined);
      const result = await service.questComplete(1, 1);

      expect(result).toEqual({
        ok: false,
        message: '플레이어님의 정보를 찾을 수 없습니다.',
      });
    });

    it('should fail if quest is already completed', async () => {
      questsRepository.findOne.mockResolvedValue({ quest: {} });
      completeRepository.findOne.mockResolvedValue({ quest: {}, player: {} });
      const result = await service.questComplete(1, 1);

      expect(result).toEqual({
        ok: false,
        message: '퀘스트를 이미 완료하였습니다.',
      });
    });

    it('should complete the quest', async () => {
      questsRepository.findOne.mockResolvedValue({ quest: {} });
      completeRepository.findOne.mockResolvedValue({ quest: {}, player: {} });
      const result = await service.questComplete(1, 1);

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      questsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.questComplete(questId, playerId);

      expect(result).toEqual({
        ok: false,
        message: '퀘스트를 완료할 수 없습니다.',
      });
    });
  });

  it.todo('getAll');
  it.todo('getOne');
});
