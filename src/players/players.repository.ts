import { EntityRepository, Repository } from 'typeorm';
import {
  CreateBodyDto,
  CreateLocalDto,
  CreatePlayerDto,
  UpdateNickname,
} from './dto/create-player.dto';
import { Player } from './entities/player.entity';

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  async findByEmail(email: string): Promise<Player> {
    return this.findOne({ where: { email } });
  }

  async findByNickname(nickname: string): Promise<Player> {
    return this.findOne({ where: nickname });
  }

  async updateNickname(updateNickname: UpdateNickname): Promise<any> {
    const { email, nickname } = updateNickname;
    const result = await this.update({ email: email }, { nickname });

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
