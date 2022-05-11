import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlayersService } from 'src/players/players.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { SigninDto } from 'src/players/dto/create-player.dto';
import { access } from 'fs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlayerRepository)
    private playersService: PlayersService,
    private playersRepository: PlayerRepository,
    private jwtService: JwtService
  ) {}

  async validatePlayer(email: string, password: string): Promise<SigninDto> {
    const player = await this.playersRepository.findOne({ email: email });
    const valid = await bcrypt.compare(password, player.password);
    console.log('------');
    console.log(player);
    if (email && valid) {
      const { Id, email, nickname } = player;
      console.log(Id, email, nickname);
      return { Id, email, nickname };
    }
    return null;
  }

  async login(email: string, nickname: string): Promise<any> {
    // const hashedPassword = await bcrypt.hash(password, 10);
    console.log('loginsld 할게요');

    // const player = await this.playersRepository.findOne({ email: email });

    const payload = {
      // Id: Id,
      email: email,
      nickname: nickname,
      // password: hashedPassword,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User information from google',
      user: req.user,
    };
  }

  kakaoLogin(req) {
    console.log(req.user);
    if (!req) {
      return 'No user from kakao';
    }
    return {
      message: 'User information from kakao',
      data: req.user,
    };
  }
}
