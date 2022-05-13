import { EntityRepository, Repository } from 'typeorm';
import { Complete } from 'src/quests/entities/complete.entity';
import {
  CreateBodyDto,
  EmailDto,
  NicknameDto,
  UpdateInfoDto,
} from './dto/create-player.dto';
import { Player } from './entities/player.entity';

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

  // 경도 위도 가져와서 mypage에 보내줄거
  async loadLatLng(id: number): Promise<any> {
    try {
      // const locations = await this.find({
      //   where: { id },
      //   relations: ['completes', 'completes.quest'],
      //   select: ['completes'],
      // });
      // someRepository.find({
      //   order: { id: 'DESC' },
      //   relations: ['createdBy'],
      //   select: [
      //     'id',
      //     'firstName',
      //     'lastName',
      //     'active',
      //     'createdAt',
      //     'lastLogin',
      //     'phoneNumber',
      //     'createdBy.email',
      //   ],
      // });

      const locations = await this.find({
        order: { id: 'DESC' },
        relations: ['completes', 'completes.quest'],
        select: [
          'id',
          'nickname',
          'profileImg',
          'mbti',
          'level',
          'exp',
          'completes',
          // 'completes.quest.id',
        ],
      });

      return locations;
    } catch (err) {
      return err.message;
    }
  }
}
