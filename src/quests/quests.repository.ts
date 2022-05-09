import { EntityRepository, Repository } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { CreateQuestDto } from './dto/create-quest.dto';
import { Dong } from './entities/dong.entity';

@EntityRepository(Quest)
export class QuestsRepository extends Repository<Quest> {
  /* 동 찾기 함수 */
  findQuests = async (dong: Dong): Promise<Quest[]> => {
    return await this.find({ where: { dong } });
  };

  createQuest = async ({ lat, lng, type, dong }: CreateQuestDto) => {
    return await this.save({
      lat,
      lng,
      type,
      dong,
    });
  };
}
