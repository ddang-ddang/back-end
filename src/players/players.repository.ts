import { EntityRepository, Repository } from 'typeorm';
import {
  CreateBodyDto,
  CreateLocalDto,
  CreatePlayerDto,
  UpdateInfoDto,
} from './dto/create-player.dto';
import { Player } from './entities/player.entity';

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  async findByEmail(email: string): Promise<Player> {
    return this.findOne({ where: email });
  }

  async findByNickname(nickname: string): Promise<Player> {
    const result = await this.findOne({ where: nickname });
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
