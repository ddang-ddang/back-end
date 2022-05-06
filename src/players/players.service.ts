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

  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

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
    return this.playersRepository.save(newPlayer);
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }

  //유져 찾기 함수
  async findPlayer(email: string): Promise<Players> {
    return this.playersRepository.findOne({ email: email });
  }
}
