import { Test, TestingModule } from '@nestjs/testing';
import { QuestsService } from './quests.service';

describe('QuestsService', () => {
  let service: QuestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestsService],
    }).compile();

    service = module.get<QuestsService>(QuestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
