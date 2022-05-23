import { EntityRepository, Repository } from 'typeorm';
import { Quest } from 'src/quests/entities/quest.entity';
import { Region } from 'src/quests/entities/region.entity';

@EntityRepository(Quest)
export class QuestRepository extends Repository<Quest> {
  /* 전체 퀘스트 조회 */
  async findAllWithCompletes(region: Region, id?: number): Promise<Object[]> {
    const quests = await this.find({
      where: { region },
      relations: ['completes', 'completes.player'],
    });
    /* 퀘스트의 전체 완료 횟수(completes), 플레이어의 완료여부(completed), 완료날짜(completionDate) 추가 */
    return quests.map((quest) => {
      const complete = quest.completes.find(({ player }) => player.id === id);
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
  async findOneWithCompletes(id: number, playerId?: number): Promise<Object> {
    const quest = await this.findOne({
      where: { id },
      relations: ['completes', 'completes.player'],
    });
    const complete = quest.completes.find(
      ({ player }) => player.id === playerId
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
