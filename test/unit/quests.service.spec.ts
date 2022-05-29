import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { QuestsService } from 'src/quests/quests.service';
import { QuestRepository } from 'src/quests/repositories/quest.repository';
import { Complete } from 'src/quests/entities/complete.entity';
import { Player } from 'src/players/entities/player.entity';
import { Region } from 'src/quests/entities/region.entity';
import { FeedRepository } from 'src/feeds/feeds.repository';
import { Achievement } from '../../src/players/entities/achievement.entity';
import { Mission } from '../../src/players/entities/mission.entity';
import { QuestsException } from '../../src/quests/quests.exception';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});
const mockQuestsRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  findAllWithCompletes: jest.fn(),
  findOneWithCompletes: jest.fn(),
};
const mockFeedRepository = {
  createAndSave: jest.fn(),
  findAll: jest.fn(),
  findOneBy: jest.fn(),
  findOneWithCompletes: jest.fn(),
};
const mockException = {
  notFoundQuest: jest.fn(),
  alreadyCompleted: jest.fn(),
};
const mockConnection = {
  createQueryRunner: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockQuestRepository = Partial<Record<keyof QuestRepository, jest.Mock>>;

describe('QuestsService', () => {
  let service: QuestsService;
  let playersRepository: MockRepository<Player>;
  let completeRepository: MockRepository<Complete>;
  let regionRepository: MockRepository<Region>;
  let achievementRepository: MockRepository<Achievement>;
  let missionRepository: MockRepository<Mission>;
  let questsRepository: MockQuestRepository;
  let feedRepository;
  let questsException;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        // 퀘스트 서비스만 진짜, 나머지는 가짜(mock)
        QuestsService,
        // 레포지토리 필요 (독립적 테스팅)
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
          provide: getRepositoryToken(Achievement),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Mission),
          useValue: mockRepository(),
        },
        {
          provide: QuestRepository,
          useValue: mockQuestsRepository,
        },
        {
          provide: FeedRepository,
          useValue: mockFeedRepository,
        },
        {
          provide: QuestsException,
          useValue: mockException,
        },
        {
          provide: Connection,
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<QuestsService>(QuestsService);
    playersRepository = module.get(getRepositoryToken(Player));
    completeRepository = module.get(getRepositoryToken(Complete));
    regionRepository = module.get(getRepositoryToken(Region));
    achievementRepository = module.get(getRepositoryToken(Achievement));
    missionRepository = module.get(getRepositoryToken(Mission));
    questsRepository = module.get(QuestRepository);
    feedRepository = module.get(FeedRepository);
    questsException = module.get(QuestsException);
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

    it('should fail if quest does not exist', async () => {
      questsRepository.findOne.mockResolvedValue(undefined);
      await expect(service.questComplete(-1, 1)).rejects.toEqual(
        new NotFoundException({ date: '', error: 'foo' })
      );
    });

    it('should fail if quest is already completed', async () => {
      questsRepository.findOne.mockResolvedValue({ quest: {} });
      completeRepository.findOne.mockResolvedValue(true);
      await expect(service.questComplete(1, 1)).rejects.toEqual(
        new ConflictException({ date: '', error: 'bar' })
      );
    });

    it('should complete the quest', async () => {
      questsRepository.findOne.mockResolvedValue({ quest: {} });
      completeRepository.findOne.mockResolvedValue({ quest: {}, player: {} });
      const result = await service.questComplete(1, 1);

      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      questsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.questComplete(1, 1);

      expect(result).toEqual({
        ok: false,
        message: '퀘스트를 완료할 수 없습니다.',
      });
    });
  });

  it.todo('getAll');
  it.todo('getOne');
});
