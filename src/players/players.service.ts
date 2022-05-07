import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from './entities/player.entity';
import { CreateIdDto, CreatePlayerDto } from './dto/create-player.dto';
import { PlayerRepository } from './players.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(PlayerRepository)
    private playersRepository: PlayerRepository
  ) {}

  // 이멜일로 찾기
  async findByEmail(email: string): Promise<CreateIdDto> {
    console.log('findByEmail');
    const players = await this.playersRepository.findByEmail(email);
    console.log(players);
    return players;
  }

  // 플레이어 생성
  async signup({
    email,
    nickname,
    password,
    mbti,
    profileImg,
  }: CreatePlayerDto): Promise<Player> {
    console.log('signup');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log({ email, nickname, hashedPassword, mbti, profileImg });

    const createPlayer = await this.playersRepository.createPlayer({
      email: email,
      nickname: nickname,
      password: hashedPassword,
      mbti: mbti,
      profileImg: profileImg,
    });
    return createPlayer;
  }
}
