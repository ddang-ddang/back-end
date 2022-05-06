import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Players } from './entities/player.entity';
import { CreateBodyDto } from './dto/create-player.dto';

export type User = any;
@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Players) private playersRepository: Repository<Players>
  ) {}
  async getByEmail(email: string): Promise<Players> {
    return this.playersRepository.findOne({ where: { email } });
  }

  // 유져 생성 함수
  async createPlayer(
    email: string,
    nickname: string,
    password: string,
    mbti: string,
    profileImg: string
  ): Promise<CreateBodyDto> {
    const newPlayer = await this.playersRepository.create({
      email,
      nickname,
      password,
      mbti,
      profileImg,
    });
    console.log(newPlayer);
    return this.playersRepository.save(newPlayer);
  }

  //유져 찾기 함수
  async findPlayer(email: string): Promise<Players> {
    return this.playersRepository.findOne({ email: email });
  }
}
