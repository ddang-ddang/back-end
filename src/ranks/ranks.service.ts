import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from '../quests/entities/region.entity';
import { getRepository, Repository } from 'typeorm';
import { Complete } from '../quests/entities/complete.entity';
import { Player } from '../players/entities/player.entity';
import { Quest } from '../quests/entities/quest.entity';
import { RanksException } from './ranks.exception';

@Injectable()
export class RanksService {
  constructor(
    @InjectRepository(Region)
    private readonly regions: Repository<Region>,
    @InjectRepository(Complete)
    private readonly completes: Repository<Complete>,
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
    private readonly exceptions: RanksException
  ) {}

  private readonly logger = new Logger(RanksService.name);

  async getAll(regionSi, regionGu, regionDong) {
    this.logger.verbose(`${regionDong} 랭킹 조회`);

    try {
      // 모든 날짜의 현재 지역 데이터 조회
      const regions = await this.regions.find({
        select: ['id', 'totalCount'],
        where: { regionSi, regionGu, regionDong },
      });
      if (regions.length === 0) this.exceptions.notFound();
      const { totalCount } = regions[0];

      const completedPlayers = await Promise.all([
        ...regions.map((region) => {
          return getRepository(Quest)
            .createQueryBuilder('quest')
            .select([
              'type',
              'player.id',
              'player.nickname',
              'player.profileImg',
            ])
            .where('regionId = :id', { id: region.id })
            .innerJoin('quest.completes', 'complete')
            .leftJoin('complete.player', 'player')
            .getRawMany();
        }),
      ]);

      const totalCompletedPlayers = [];
      const mobsCompletedPlayers = [];
      const timeCompletedPlayers = [];
      const docsCompletedPlayers = [];

      // 퀘스트 별로 완료한 플레이어 id 배열로 추가
      completedPlayers.flat().forEach((player) => {
        const { type, player_playerId } = player;
        if (type === 'mob') {
          mobsCompletedPlayers.push(player_playerId);
          totalCompletedPlayers.push(player_playerId);
        } else if (type === 'time') {
          timeCompletedPlayers.push(player_playerId);
          totalCompletedPlayers.push(player_playerId);
        } else if (type === 'feed') {
          docsCompletedPlayers.push(player_playerId);
          totalCompletedPlayers.push(player_playerId);
        }
      });

      const total = await this.rankFor(totalCompletedPlayers, totalCount, 3);
      const mob = await this.rankFor(mobsCompletedPlayers, totalCount, 3);
      const time = await this.rankFor(timeCompletedPlayers, totalCount, 1);
      const docs = await this.rankFor(docsCompletedPlayers, totalCount, 2);

      const ranks = { total, mob, time, docs };

      return { ok: true, ranks };
    } catch (error) {
      this.exceptions.serverError();
    }
  }

  /* 랭킹 데이터 만들기 */
  /**
   * @param {array} players - 퀘스트 유형별 완료한 플레이어
   * @param {number} totalCount - 해당 지역 전체 주소
   * @param {number} difficulty - 퀘스트 난이도 (포인트 차등)
   * @returns {array} - TOP10 랭킹 리스트
   */
  async rankFor(
    players: number[],
    totalCount: number,
    difficulty: number
  ): Promise<object[]> {
    try {
      // 플레이어당 퀘스트 완료횟수 (ex. { '96': 2, '99': 1, '100': 4 })
      const countFor = {};
      players.forEach((player) => {
        countFor[player] = (countFor[player] || 0) + 1;
      });

      // 객체를 배열로 변경 (promise.all 및 정렬을 위해서)
      const arrayFromObject = [];
      for (const player in countFor) {
        arrayFromObject.push([player, countFor[player]]);
      }

      // 랭킹 정보(플레이어, 포인트 등) 생성
      const ranksTop10 = [];
      await Promise.all([
        ...arrayFromObject.map(async (player) => {
          const res = await this.players.findOne({ where: { id: player[0] } });
          const rankingInfo = {
            nickname: res.nickname,
            profileImg: res.profileImg,
            ratio: `${Math.round((player[1] / totalCount) * 45000)}%`,
            counts: player[1],
            points: `${player[1] * 100 * difficulty}P`,
          };
          ranksTop10.push(rankingInfo);
        }),
      ]);

      // 랭킹 정렬
      ranksTop10.sort((a, b) => b.counts - a.counts);
      return ranksTop10.slice(0, 10);
    } catch (error) {
      this.exceptions.serverError();
    }
  }
}
