import { EntityRepository, Repository } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { CreateQuestDto } from './dto/create-quest.dto';
import { Region } from './entities/region.entity';

@EntityRepository(Quest)
export class QuestsRepository extends Repository<Quest> {
  /* 퀘스트 생성 */
  async createAndSave({ lat, lng, type, region }: CreateQuestDto) {
    return await this.save({
      lat,
      lng,
      type,
      region,
    });
  }

  /* 전체 퀘스트 조회 */
  async findAll(region: Region): Promise<Quest[]> {
    // 퀘스트 완료여부, 완료횟수 조인해서 클라이언트로 발송
    return await this.find({
      where: { region },
      // join: {
      //   alias: 'm',
      //   leftJoinAndSelect: {
      //     complete: 'm.join',
      //   },
      // },
    });
  }

  /* 특정 퀘스트 조회 */
  async findOneBy(id: number): Promise<Quest> {
    return await this.findOne({ id });
  }
}
