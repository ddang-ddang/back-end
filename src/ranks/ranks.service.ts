import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from '../quests/entities/region.entity';
import { getRepository, Repository } from 'typeorm';
import { Quest } from '../quests/entities/quest.entity';
import { RanksException } from './ranks.exception';

@Injectable()
export class RanksService {
  constructor(
    @InjectRepository(Region)
    private readonly regions: Repository<Region>,
    private readonly exceptions: RanksException
  ) {}

  private readonly logger = new Logger(RanksService.name);

  async getAll(regionSi, regionGu, regionDong) {
    this.logger.verbose(`${regionDong} 랭킹 조회`);

    // 모든 날짜의 당해 지역 데이터 조회
    const regions = await this.regions.find({
      select: ['id', 'totalCount'],
      where: { regionSi, regionGu, regionDong },
    });
    if (regions.length === 0) this.exceptions.notFound();

    // 당해 지역에서 퀘스트 완료한 플레이어 조회
    const completedPlayers = await Promise.all([
      ...regions.map((region) => {
        return getRepository(Quest)
          .createQueryBuilder('quest')
          .select(['player.nickname', 'player.profileImg', 'player.mbti'])
          .where('regionId = :id', { id: region.id })
          .innerJoin('quest.completes', 'complete')
          .leftJoin('complete.player', 'player')
          .getRawMany();
      }),
    ]);

    const players = completedPlayers.flat();
    const total = players.length;

    // 닉네임, MBTI 별로 분류
    const playersProfiles = {};
    const countByNick = {}; // ex. { nick: 5, nick12: 3, '박재철': 6, helloworld: 2 }
    const countByMbti = {}; // ex. { infp: 5, intp: 3, entp: 6, enfp: 2 }
    players.forEach((player) => {
      const { player_nickname, player_profileImg, player_mbti } = player;
      countByNick[player_nickname] = (countByNick[player_nickname] || 0) + 1;
      countByMbti[player_mbti] = (countByMbti[player_mbti] || 0) + 1;
      playersProfiles[player_nickname] = {
        player_profileImg,
        player_mbti,
        counts: countByNick[player_nickname],
      };
    });

    const individual = this.ranksByIndividual(
      playersProfiles,
      countByNick,
      total
    );
    const group = this.ranksByGroup(countByMbti, total);
    const ranks = { individual, group };

    return { ok: true, ranks };
  }

  /* 개인 랭킹 정하기 */
  /**
   * @param {object} playersProfiles - 퀘스트 완료한 플레이어
   * @param {object} countByNick - 해당 지역 전체 완료 횟수
   * @param {number} total - 해당 지역 전체 완료 횟수
   * @returns {array} - TOP10 랭킹 리스트
   */
  ranksByIndividual(
    playersProfiles: any,
    countByNick: object,
    total: number
  ): object[] {
    // 객체를 배열로 변경 (정렬을 위해서)
    const arrayFromObject: any[][] = [];
    for (const nickname in countByNick) {
      arrayFromObject.push([nickname, countByNick[nickname]]);
    }

    // 랭킹 정보(플레이어, 포인트 등) 생성
    const ranksTop16 = [];

    arrayFromObject.forEach((nickname) => {
      const rankingInfo = {
        nickname: nickname[0],
        profileImg: playersProfiles[nickname[0]].player_profileImg,
        mbti: playersProfiles[nickname[0]].player_mbti,
        ratio: Math.round((playersProfiles[nickname[0]].counts / total) * 100),
        points: playersProfiles[nickname[0]].counts * 500,
      };
      ranksTop16.push(rankingInfo);
    });

    // 랭킹 정렬
    ranksTop16.sort((a, b) => b.points - a.points);
    return ranksTop16.slice(0, 16);
  }

  /* 그룹 랭킹 정하기 */
  /**
   * @param {object} countByMbti - mbti별 완료 횟수
   * @param {number} total - 해당 지역 전체 완료 횟수
   * @returns {array} - TOP10 랭킹 리스트
   */
  ranksByGroup(countByMbti: object, total: number): object[] {
    // 객체를 배열로 변경
    const arrayFromObject = [];
    for (const mbti in countByMbti) {
      arrayFromObject.push([mbti, countByMbti[mbti]]); // ex. [ ['intj', 2], ['entj': 1], ['isfp': 4] ]
    }

    // 랭킹 정보(MBTI, 점령률 등) 생성
    const ranks = [];
    arrayFromObject.forEach((el) => {
      const rankingInfo = {
        mbti: el[0],
        ratio: Math.round((el[1] / total) * 100),
      };
      ranks.push(rankingInfo);
    });

    // 랭킹 정렬
    return ranks.sort((a, b) => b.ratio - a.ratio);
  }
}
