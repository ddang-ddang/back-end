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

    // 모든 날짜의 현재 지역 데이터 조회 [ Region { id: 3, totalCount: 5035 }, ...]
    const regions = await this.regions.find({
      select: ['id', 'totalCount'],
      where: { regionSi, regionGu, regionDong },
    });
    if (regions.length === 0) this.exceptions.notFound();
    const { totalCount } = regions[0];

    // [{ player_playerId: 100, player_nickname: '박재철', player_mbti: 'mbti', player_profileImg: '' }, ...]
    const completedPlayers = await Promise.all([
      ...regions.map((region) => {
        return getRepository(Quest)
          .createQueryBuilder('quest')
          .select([
            'player.id',
            'player.nickname',
            'player.profileImg',
            'player.mbti',
          ])
          .where('regionId = :id', { id: region.id })
          .innerJoin('quest.completes', 'complete')
          .leftJoin('complete.player', 'player')
          .getRawMany();
      }),
    ]);

    // 퀘스트 별로 완료한 플레이어 id 배열로 추가
    const completedPlayersIds = [];
    const completedPlayersMbtis = [];
    completedPlayers.flat().forEach((player) => {
      const { player_playerId, player_mbti } = player;
      completedPlayersIds.push(player_playerId);
      completedPlayersMbtis.push(player_mbti);
    });

    const individual = await this.ranksByIndividual(
      completedPlayersIds,
      totalCount
    );
    const group = await this.ranksByGroup(completedPlayersMbtis);

    const ranks = { individual, group };

    return { ok: true, ranks };
  }

  /* 개인 랭킹 정하기 */
  /**
   * @param {array} players - 퀘스트 완료한 플레이어
   * @param {number} totalCount - 해당 지역 전체 주소
   * @returns {array} - TOP10 랭킹 리스트
   */
  async ranksByIndividual(
    players: number[],
    totalCount: number
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
    const ranksTop16 = [];
    await Promise.all([
      ...arrayFromObject.map(async (player) => {
        const res = await this.players.findOne({ where: { id: player[0] } });
        const rankingInfo = {
          nickname: res.nickname,
          profileImg: res.profileImg,
          mbti: res.mbti,
          ratio: Math.round((player[1] / totalCount) * 15000),
          points: player[1] * 500,
        };
        ranksTop16.push(rankingInfo);
      }),
    ]);

    // 랭킹 정렬
    ranksTop16.sort((a, b) => b.points - a.points);
    return ranksTop16.slice(0, 16);
  }

  /* 그룹 랭킹 정하기 */
  /**
   * @param {array} mbtis - 퀘스트 완료한 플레이어의 mbti
   * @returns {array} - TOP10 랭킹 리스트
   */
  async ranksByGroup(mbtis: string[]): Promise<object[]> {
    // 플레이어당 퀘스트 완료횟수 - ex. { 'intj': 2, 'entj': 1, 'isfp': 4 }
    const countFor = {};
    mbtis.forEach((mbti) => {
      countFor[mbti] = (countFor[mbti] || 0) + 1;
    });

    // 객체를 배열로 변경 (promise.all 및 정렬을 위해서)
    const arrayFromObject = [];
    for (const mbti in countFor) {
      arrayFromObject.push([mbti, countFor[mbti]]); // ex. [ ['intj', 2], ['entj': 1], ['isfp': 4] ]
    }
    const totalCount = arrayFromObject.reduce((acc, cur) => {
      return acc + cur[1];
    }, 0);

    // 랭킹 정보(플레이어, 포인트 등) 생성
    const ranks = [];
    arrayFromObject.forEach((el) => {
      const rankingInfo = {
        mbti: el[0],
        ratio: Math.round((el[1] / totalCount) * 100),
      };
      ranks.push(rankingInfo);
    });

    // 랭킹 정렬
    return ranks.sort((a, b) => b.ratio - a.ratio);
  }
}
