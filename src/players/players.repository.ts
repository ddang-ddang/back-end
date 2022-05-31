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

      console.log(createBodyDto);
      const result = this.create({
        email,
        password,
        nickname,
        mbti,
        profileImg,
        provider,
        providerId,
        currentHashedRefreshToken,
      });

      // console.log(result);
      await this.save(result);
      return result;
    } catch (err) {
      return err.message;
    }
  }

  //토큰 관련 Repository
  async saveRefreshToken(id: number, refreshToken: string): Promise<any> {
    try {
      const token = refreshToken.split(' ')[1];
      const currentHashedRefreshToken = await bcrypt.hash(token, 10);

      if (id < 10000) {
        const result = await this.update(id, {
          currentHashedRefreshToken,
        });
        console.log(`saved refresh local token ${result}`);
        return result;
      } else {
        const providerId = id;
        const result = await this.update(providerId, {
          currentHashedRefreshToken,
        });

        console.log(`saved refresh social token ${result}`);
        return result;
      }
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

      console.log(result);

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

      const createPlayer = await this.create({
        email,
        nickname,
        mbti,
        profileImg,
        provider,
        providerId,
      });

      const result = await this.save(createPlayer);

      return result;
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

  async checkIdByProviderId(providerId: number): Promise<any> {
    try {
      const result = await this.findOne({
        select: ['id'],
        where: { providerId },
      });

      console.log(result);
      if (!result) {
        return false;
      }
      return result;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }
  /* mail */
  async updatePassword(email: string, password: string) {
    await this.update({ email }, { password });
  }
}
