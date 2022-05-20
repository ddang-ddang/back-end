import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AchievementRepository } from './achievements.repository';
import { Player } from 'src/players/entities/player.entity';
import { Quest } from 'src/quests/entities/quest.entity';
import { Complete } from 'src/quests/entities/complete.entity';
import { PlayerRepository } from 'src/players/players.repository';
import { Mission } from './entities/mission.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(AchievementRepository)
    private achievementRepository: AchievementRepository,
    private playerRepository: PlayerRepository
  ) {}
  async getMyData(playerId: number) {
    /* 내가 완료한 퀘스트와 좌표들 */
    const myData = await this.playerRepository
      .createQueryBuilder('player')
      .select([
        'player.id',
        'player.email',
        'player.nickname',
        'player.mbti',
        'player.profileImg',
        'player.level',
        'player.exp',
      ])
      .leftJoinAndSelect('player.completes', 'completes')
      .leftJoinAndSelect('completes.quest', 'quest')
      .where('player.playerId = :playerId', { playerId: playerId })
      .getMany();

    const countEachType = await Complete.createQueryBuilder('complete')
      .select(['quest.type', 'count(quest.type) as cnt'])
      .leftJoin('complete.quest', 'quest')
      .where('complete.playerId = :playerId', { playerId: playerId })
      .groupBy('quest.type')
      .getRawMany();

    const missionList = await Mission.find({
      order: {
        setGoals: 'DESC',
      },
    });

    const achievedMission = [];
    const notAchievedMission = [];

    countEachType.map((each) => {
      missionList.map((mission) => {
        if (each.quest_type === mission.type && each.cnt >= mission.setGoals) {
          achievedMission.push(mission);
        }
      });
    });

    missionList.map((mission) => {
      if (!achievedMission.includes(mission)) {
        notAchievedMission.push(mission);
      }
    });

    return {
      myData,
      achievedMission,
      notAchievedMission,
    };
  }
}
