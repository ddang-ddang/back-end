import { EntityRepository, Repository } from 'typeorm';
import {
  CreateBodyDto,
  CreateLocalDto,
  CreatePlayerDto,
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
    const { nickname } = nicknameDto;
    const result = await this.findOne({ where: { nickname } });
    console.log(result);
    return result;
  }

  async updateNickname(updateNickname: UpdateInfoDto): Promise<any> {
    const { nickname, profileImg, email } = updateNickname;
    const result = await this.update(
      { email: email },
      { nickname, profileImg }
    );
    // const result2 = await this.update({ email: email }, { profileImg });

    return result;
  }

  // async findAll(region: Region, id?: number): Promise<Object[]> {
  //   const quests = await this.find({
  //     where: { region },
  //     relations: ['completes', 'completes.player'],
  //   });
  // }

  async createPlayer(createBodyDto: CreateBodyDto): Promise<Player> {
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
  }
}
