import { Controller } from '@nestjs/common';
import { QuestsService } from './quests.service';

@Controller('api/quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  /* 퀘스트 수행 */
}
