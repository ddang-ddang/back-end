import { Exclude } from 'class-transformer';
import { EntityRepository, Repository, createQueryBuilder } from 'typeorm';
import {
  CreateBodyDto,
  CreateLocalDto,
  EmailDto,
  NicknameDto,
  UpdateInfoDto,
} from './dto/create-player.dto';
import { Player } from './entities/player.entity';
import * as bcrypt from 'bcrypt';
import { Mission } from './entities/mission.entity';
import { Achievement } from './entities/achievement.entity';
import { Quest } from '../quests/entities/quest.entity';
import { Complete } from '../quests/entities/complete.entity';

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  async findByEmail(emailDto: EmailDto): Promise<Player> {
    const { email } = emailDto;
    return this.findOne({ where: { email } });
  }
  async findByNickname(nicknameDto: NicknameDto): Promise<Player> {
    try {
      const { nickname } = nicknameDto;
      const result = await this.findOne({ where: { nickname } });

      return result;
    } catch (err) {
      return err.message;
    }
  }

  async updateNickname(updateNickname: UpdateInfoDto): Promise<any> {
    try {
      const { nickname, profileImg, email } = updateNickname;
      const result = await this.update(
        { email: email },
        { nickname, profileImg }
      );

      return result;
    } catch (err) {
      return err.message;
    }
  }

  async createPlayer(createBodyDto: CreateBodyDto): Promise<Player> {
    try {
      const {
        email,
        password,
        nickname,
        mbti,
        profileImg,
        provider,
        providerId,
        currentHashedRefreshToken,
      } = createBodyDto;

      const result = await this.create({
        email,
        password,
        nickname,
        mbti,
        profileImg,
        provider,
        providerId,
        currentHashedRefreshToken,
      });

      return await this.save(result);
    } catch (err) {
      return err.message;
    }
  }

  //토큰 관련 Repository
  async saveRefreshToken(id: number, refreshToken: string): Promise<any> {
    try {
      const token = refreshToken.split(' ')[1];
      const currentHashedRefreshToken = await bcrypt.hash(token, 10);
      const result = await this.update(id, {
        currentHashedRefreshToken,
      });
      return result;
    } catch (err) {
      return err.message;
    }
  }

  async checkRefreshToken(id: number): Promise<any> {
    try {
      const result = await this.findOne({
        select: ['currentHashedRefreshToken'],
        where: { id },
      });
      return result;
    } catch (err) {
      return err.message;
    }
  }
  async deleteToken(id: number): Promise<any> {
    try {
      const result = await this.update(id, { currentHashedRefreshToken: null });
      return result;
    } catch (err) {
      return err.message;
    }
  }

  async findOrCreatePlayer(createLocalDto: CreateLocalDto): Promise<object> {
    try {
      const {
        email,
        password,
        nickname,
        mbti,
        profileImg,
        provider,
        providerId,
      } = createLocalDto;

      console.log('저장하나');
      const createPlayer = await this.create({
        email,
        nickname,
        mbti,
        profileImg,
        provider,
        providerId,
      });
      console.log('saved');

      console.log(createPlayer);
      const result = await this.save(createPlayer);
      console.log(result);

      // return await this.save(createPlayer);
    } catch (err) {
      return err.message;
    }
  }

  async checkSignUp(providerId: string, provider: string): Promise<boolean> {
    try {
      const result = await this.findOne({ where: { providerId } });
      if (!result) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }
  async checkById(id: number): Promise<boolean> {
    try {
      const result = await this.findOne({ where: { id } });
      if (!result) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }

  // 경도 위도 가져와서 mypage에 보내줄거
  async mypageInfo(id: number): Promise<any> {
    try {
      const id = 2;

      //플레이어즈의 닉네임, mbti를 가져온다
      const mbti = this.findOne({
        select: ['mbti', 'nickname'],
        where: { id },
      });

      // 쿼스트를 중심으로 컴플릿을 조인한다.
      // 퀘스트의 있는 모든 내용을 가져온다.

      const questResult = await Quest.createQueryBuilder('quest')
        .leftJoinAndSelect('quest.completes', 'completes')
        .leftJoinAndSelect('completes.player', 'player')
        .select(['quest.id', 'quest.lat', 'quest.lng', 'quest.type'])
        // .innerJoinAndSelect('player.completes', 'completes')
        .where('player.id = :id', { id: id })
        .getMany();

      const playerResult = await this.createQueryBuilder('player')
        .select(['player.id', 'player.nickname', 'player.mbti'])
        .where('player.id = :id', { id: id })
        .getMany();

      // 아이디로 조회된 퀘스트 불러오기
      const missionResult = await Mission.createQueryBuilder('mission')
        .leftJoinAndSelect('mission.achievements', 'achievements')
        .leftJoinAndSelect('achievements.player', 'player')
        .select([
          'mission.id',
          'mission.title',
          'mission.badge',
          'mission.type',
          'mission.setGoals',
        ])
        .where('player.id = :id', { id: id })
        .getMany();

      const countEachType = await Complete.createQueryBuilder('complete')
        .select(['quest.type', 'count(quest.type) as cnt'])
        .leftJoin('complete.quest', 'quest')
        .where('complete.playerId = :playerId', { playerId: id })
        .groupBy('quest.type')
        .getRawMany();

      // const createAchievement = async (playerId: number, missionId: number) => {
      //   Achievement.createQueryBuilder('achievement')
      //     .insert()
      //     .into('achievement')
      //     .values({ playerId, missionId })
      //     .execute();

      //   console.log(createAchievement);
      // };
      const achievedMission = [];
      const notAchievedMission = []; 
      
      
      // feed, mob, time으로 구별해서 mission에 저장되어있는 setGoals을 비교해서 결과값이 true이면 Achievement를 생성한다.
      countEachType.map(async (cntItems) => {
        missionResult.map(async (mission) => {
          if (cntItems.quest_type === 'feed' && mission.type === 'feed') {
            console.log(cntItems.quest_type, mission.type);
            console.log(parseInt(cntItems.cnt), mission.setGoals);
            // mission.setGoals >= parseInt(cntItems.cnt)
            //   ? await (id, mission.id)
            //   : null;
          } else if (cntItems.type === 'mob' && mission.type === 'mob') {
          } else if (cntItems.type === 'time' && mission.type === 'time') {
          }
        });
      });

      // 그중 현재 오나료된 퀘스트 (questId)가 있는 것을 가져오가.
      // 쾌스트가 없는 것도 가져온다.

      // 타입별로 가져온 퀘스트를 개수를 센다.
      // 그 타입중에 setGoals 만큼 있는 것을 achievements에 넣는다.

      // console.log(createAchievement);
      console.log(mbti);
      console.log(countEachType);

      // console.log(playerResult);
      console.log(missionResult);
      console.log(questResult);
      // console.log(questCntResult);
      return { ok: true };
    } catch (err) {
      return err.message;
    }
  }
}
