import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBodyDto, UpdateNickname } from './dto/create-player.dto';
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

  // 플레이어 생성
  async signup({
    email,
    nickname,
    password,
    mbti,
    profileImg,
  }: CreateBodyDto): Promise<Player> {
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

  async findByNickname(nickname: string): Promise<any> {
    try {
      const result = await this.playersRepository.findByNickname(nickname);
      if (!result) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
    }
  }

  // 이멜일로 찾기
  async findByEmail(email: string): Promise<boolean> {
    try {
      const players = await this.playersRepository.findByEmail(email);
      if (!players) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
    }
  }

  // nickname 변경하기
  async updateNickname({ email, nickname }: UpdateNickname): Promise<any> {
    try {
      const result = await this.playersRepository.updateNickname({
        email,
        nickname,
      });
      if (!result) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
    }
  }
}
