import { EntityRepository, Repository } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { CreateQuestDto } from './dto/create-quest.dto';
import { Dong } from './entities/dong.entity';

@EntityRepository(Quest)
export class QuestsRepository extends Repository<Quest> {
  /* 퀘스트 생성 */
  createAndSave = async ({ lat, lng, type, dong }: CreateQuestDto) => {
    return await this.save({
      lat,
      lng,
      type,
      dong,
    });
  };

  /* 전체 퀘스트 조회 */
  findAll = async (dong: Dong): Promise<Quest[]> => {
    return await this.find({ where: { dong } });
  };

  /* 전체 퀘스트 조회 */
  findOneBy = async (id: number): Promise<Quest> => {
    return await this.findOne({ id });
  };
}
