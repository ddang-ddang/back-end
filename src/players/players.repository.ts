import { EntityRepository, Repository } from 'typeorm';
import {
  CreateBodyDto,
  CreatePlayerDto,
  UpdateNickname,
} from './dto/create-player.dto';
import { Player } from './entities/player.entity';

@EntityRepository(Player)
export class PlayerRepository extends Repository<Player> {
  async findByEmail(email: string): Promise<Player> {
    return this.findOne({ where: email });
  }

  async findByNickname(nickname: string) {
    return await this.find({ where: nickname });
  }

  async updateNickname(updateNickname: UpdateNickname): Promise<any> {
    const { email, nickname } = updateNickname;
    const result = await this.update({ email: email }, { nickname });
    // result.then((data) => console.log(data))

    console.log(result);
    // return result
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
