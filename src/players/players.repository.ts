import { EntityRepository, Repository } from 'typeorm';
import { CreateBodyDto, CreatePlayerDto } from './dto/create-player.dto';
import { Player } from './entities/player.entity';

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  async findByEmail(email: string): Promise<Player> {
    return this.findOne(email);
    // return this.findOne({ where: { email: 'diasm2@gmail.com' } });
  }

  async getByEmail(email: string) {
    return this.findOne({ where: { email } });
  }

  createPlayer = async ({
    email,
    nickname,
    password,
    mbti,
    profileImg,
  }: CreateBodyDto) => {
    return await this.save({
      email: email,
      nickname: nickname,
      password: password,
      mbti: mbti,
      profileImg: profileImg,
    });
  };

  //유져 찾기 함수
  async findPlayer(email: string): Promise<Player> {
    return this.findOne({ email: email });
  }
}
