import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from '../quests/entities/region.entity';
import { getRepository, Repository } from 'typeorm';
import { Complete } from '../quests/entities/complete.entity';
import { Player } from '../players/entities/player.entity';
import { Quest } from '../quests/entities/quest.entity';

@Injectable()
export class RanksService {
  constructor(
    @InjectRepository(Region)
    private readonly regions: Repository<Region>,
    @InjectRepository(Complete)
    private readonly completes: Repository<Complete>,
    @InjectRepository(Player)
    private readonly players: Repository<Player>
  ) {}

  private readonly logger = new Logger(RanksService.name);

  async getAll(currentRegion) {
    this.logger.verbose(`${currentRegion.regionDong} 랭킹 조회`);

    try {
      const { regionSi, regionGu, regionDong } = currentRegion; // 현재 지역 정보
      // 모든 날짜의 현재 지역 데이터 조회
      const regions = await this.regions.find({
        where: { regionSi, regionGu, regionDong },
      });
      if (regions.length === 0)
        return { ok: false, message: '현재 위치를 찾을 수 없습니다.' };

      const { totalCount } = regions[0];
      // 퀘스트 조회 (완료 테이블, 완료한 플레이어 조인)
      const quests = await Promise.all([
        ...regions.map(async (region) => {
          // TODO: relations 내에서 필요한 정보만 받을 수 있게 수정 (플레이어 닉네임, 프로필 이미지)
          return await getRepository(Quest)
            .createQueryBuilder('quest')
            .where('regionId = :id', { id: region.id })
            .innerJoinAndSelect('quest.completes', 'complete')
            .leftJoinAndSelect('complete.player', 'player')
            .getMany();
        }),
      ]);

      const totalCompletedBy = [];
      const mobsCompletedBy = [];
      const timeCompletedBy = [];
      const docsCompletedBy = [];

      // 퀘스트 별로 완료한 플레이어 id 배열로 추가
      const allQuests = quests.flat();
      allQuests.forEach((quest) => {
        const { type } = quest;
        if (type === 'mob') {
          quest.completes.forEach((complete) => {
            mobsCompletedBy.push(complete.player.id);
            totalCompletedBy.push(complete.player.id);
          });
        } else if (type === 'time') {
          quest.completes.forEach((complete) => {
            timeCompletedBy.push(complete.player.id);
            totalCompletedBy.push(complete.player.id);
          });
        } else if (type === 'feed') {
          quest.completes.forEach((complete) => {
            docsCompletedBy.push(complete.player.id);
            totalCompletedBy.push(complete.player.id);
          });
        }
      });

      const total = await this.rankFor(totalCompletedBy, totalCount, 3);
      const mob = await this.rankFor(mobsCompletedBy, totalCount, 3);
      const time = await this.rankFor(timeCompletedBy, totalCount, 1);
      const docs = await this.rankFor(docsCompletedBy, totalCount, 2);

      const ranks = { total, mob, time, docs };

      return { ok: true, ranks };
    } catch (error) {
      return { ok: false, message: '랭킹을 조회할 수 없습니다.' };
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
  }
}
