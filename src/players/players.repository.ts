import { EntityRepository, Repository } from 'typeorm';
import {
  CreateBodyDto,
  CreateLocalDto,
  EmailDto,
  NicknameDto,
  UpdateInfoDto,
} from './dto/create-player.dto';
import { Player } from './entities/player.entity';
import * as bcrypt from 'bcrypt';

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
        // providerId,
      } = createBodyDto;

      const result = await this.create({
        email,
        password,
        nickname,
        mbti,
        profileImg,
        provider,
      });

      return await this.save(result);
    } catch (err) {
      return err.message;
    }
  }

  //토큰 관련 Repository
  async saveRefreshToken(id: number, refreshToken: string): Promise<any> {
    try {
      const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      const result = await this.update(id, { currentHashedRefreshToken });
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

  // 경도 위도 가져와서 mypage에 보내줄거
  async locations(id2: number): Promise<any> {
    const id = id2;
    try {
      const result = await this.createQueryBuilder('player')
        // .select([
        //   'player',
        //   'player.id',
        //   'player.email',
        //   'player.nickname',
        //   'player.mbti',
        //   'player.profileImg',
        //   'player.level',
        //   'player.exp',
        // ])
        .where('player.id = :id', { id })
        // .innerJoinAndSelect('player.completes', 'complete')
        .leftJoinAndSelect('player.completes', 'complete')
        // .leftJoinAndSelect('player.quests', 'quest')
        // .select(['complete.id', 'complete.questId'])
        // .leftJoin('complete.quest', 'quest')
        // .select(['quest.lat', 'quest.lng'])
        .getMany();
      console.log(result);
      return result;
    } catch (err) {
      return err.message;
    }
  }
}
