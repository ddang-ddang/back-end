import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { SigninDto } from 'src/players/dto/create-player.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlayerRepository)
    private playersRepository: PlayerRepository,
    private jwtService: JwtService
  ) {}

  async validatePlayer(email: string, password: string): Promise<SigninDto> {
    const player = await this.playersRepository.findOne({ email: email });
    const valid = await bcrypt.compare(password, player.password);
    if (email && valid) {
      const { Id, email, nickname } = player;
      console.log(Id, email, nickname);
      return { Id, email, nickname };
    }
    return null;
  }

  async login(email: string, nickname: string): Promise<any> {
    try {
      const player = await this.playersRepository.findOne({ email: email });

      const payload = {
        Id: player.Id,
        email: email,
        nickname: nickname,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
      };
    } catch (err) {
      console.log(err);
    }
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
