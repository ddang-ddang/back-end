import { Test, TestingModule } from '@nestjs/testing';
import { FeedsService } from 'src/feeds/feeds.service';

describe('FeedsService', () => {
  let service: FeedsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedsService],
    }).compile();

    service = module.get<FeedsService>(FeedsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
