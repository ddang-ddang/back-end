import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBodyDto, UpdateInfoDto } from './dto/create-player.dto';
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
  async signup(createPlayerDto: CreateBodyDto): Promise<Player> {
    try {
      const { email, password, nickname, mbti, profileImg, provider } =
        createPlayerDto;
      console.log('createPlayerDto', createPlayerDto);
      const hashedPassword = await bcrypt.hash(password, 10);
      const createPlayer = await this.playersRepository.createPlayer({
        email: email,
        nickname: nickname,
        password: hashedPassword,
        mbti: mbti,
        profileImg: profileImg,
        provider: provider,
        // providerId: providerId,
      });
      return createPlayer;
    } catch (err) {
      console.log(err);
    }
  }

  async findByNickname(nickname: string): Promise<any> {
    try {
      const result = await this.playersRepository.findByNickname(nickname);
      console.log(result);
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
      console.log(players);
      if (!players) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
    }
  }

  async getDataByEmail(email: string): Promise<any> {
    try {
      const result = await this.playersRepository.findOne({
        where: { email },
        select: ['profileImg'],
      });
      console.log(result);
      if (!result) {
        return { ok: false };
      }
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  // nickname 변경하기
  async updateNickname({
    email,
    profileImg,
    nickname,
  }: UpdateInfoDto): Promise<any> {
    try {
      const result = await this.playersRepository.updateNickname({
        email,
        profileImg,
        nickname,
      });
      console.log(result);
      if (!result) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
    }
  }
}
