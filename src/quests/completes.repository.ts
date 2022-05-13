import { EntityRepository, Repository } from 'typeorm';
import { Complete } from './entities/complete.entity';
import { ConflictException } from '@nestjs/common';
import { Player } from '../players/entities/player.entity';
import { Quest } from './entities/quest.entity';

@EntityRepository(Complete)
export class CompletesRepository extends Repository<Complete> {
  /* 타임어택 또는 몬스터 대결 퀘스트 완료 */
  async complete(player: Player, quest: Quest) {
    const isCompleted = await this.findOne({ where: { player, quest } });
    if (isCompleted) {
      throw new ConflictException({
        ok: false,
        message: '퀘스트를 이미 완료하였습니다.',
      });
    }
    return await this.save({ player, quest });
  }
}
