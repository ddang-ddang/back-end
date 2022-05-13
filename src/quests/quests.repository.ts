import { EntityRepository, Repository } from 'typeorm';
import { Quest } from './entities/quest.entity';
import { CreateQuestDto } from './dto/create-quest.dto';
import { Region } from './entities/region.entity';

@EntityRepository(Quest)
export class QuestsRepository extends Repository<Quest> {
  /* 퀘스트 생성 */
  async createAndSave({ region, ...quests }: CreateQuestDto) {
    return await this.save({ region, ...quests });
  }

  /* 전체 퀘스트 조회 */
  async findAll(region: Region, id: number | null): Promise<Object[]> {
    const quests = await this.find({
      where: { region },
      relations: ['completes', 'completes.player'],
    });
    /* 퀘스트의 전체 완료 횟수(completes), 플레이어의 완료여부(completed), 완료날짜(completionDate) 추가 */
    return quests.map((quest) => {
      const complete = quest.completes.find(({ player }) => player.Id === id);
      const completed = !!complete;
      const completionDate = completed ? complete.createdAt : null;

      return {
        ...quest,
        completes: quest.completes.length,
        completed,
        completionDate,
      };
    });
  }

  /* 특정 퀘스트 조회 */
  async findOneBy(id: number): Promise<Quest> {
    return await this.findOne({ id });
  }

  /* 특정 퀘스트 조회 (조건 포함) */
  async findOneWithCompletes(
    id: number,
    playerId: number | null
  ): Promise<Object> {
    const quest = await this.findOne({
      where: { id },
      relations: ['completes', 'completes.player'],
    });
    const complete = quest.completes.find(
      ({ player }) => player.Id === playerId
    );
    const completed = !!complete;
    const completionDate = completed ? complete.createdAt : null;
    return {
      ...quest,
      completes: quest.completes.length,
      completed,
      completionDate,
    };
  }
}
