import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerRepository } from '../players/players.repository';
import { CreateIdDto, SigninDto } from '../players/dto/create-player.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlayerRepository)
    private playersRepository: PlayerRepository,
    private jwtService: JwtService
  ) {}

  // 1. 유져 인증단계
  //로그인을 하게 되면 입력한  이메일 주소와 비밀번호를 받아 인증을 한다.
  async validatePlayer(createIdDto: CreateIdDto): Promise<SigninDto> {
    const { email, password } = createIdDto;
    const player = await this.playersRepository.findByEmail({
      email: email,
    });

    const valid = await bcrypt.compare(password, player.password);
    if (email && valid) {
      const { id, email, nickname } = player;
      console.log(id, email, nickname);
      return { id, email, nickname };
    }
    return null;
  }
  // 2. 토큰 생성
  // 위 이메일 주소와 비밀번호가 일치하면 토크을 생성한다.
  // jwt로 생성한 토큰은 (id, email, nickname)를 담고 있다.
  async login(email: string, nickname: string): Promise<string> {
    try {
      const player = await this.playersRepository.findOne({ email });

      const payload = {
        id: player.id,
        email: email,
        nickname: nickname,
      };

      const accessToken = this.jwtService.sign(payload);

      return accessToken;
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
