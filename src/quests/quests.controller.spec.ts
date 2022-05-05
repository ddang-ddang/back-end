import { Test, TestingModule } from '@nestjs/testing';
import { QuestsController } from './quests.controller';

describe('QuestsController', () => {
  let controller: QuestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestsController],
    }).compile();

    controller = module.get<QuestsController>(QuestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
