import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import {
  LoginDto,
  PlayerIdDto,
  SigninDto,
} from 'src/players/dto/create-player.dto';
import * as config from 'config';
const jwtConfig = config.get('jwt');

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlayerRepository)
    private playersRepository: PlayerRepository,
    private jwtService: JwtService
  ) {}

  // 1. 유져 인증단계
  // 로그인을 하게 되면 입력한  이메일 주소와 비밀번호를 받아 인증을 한다.
  // id, email, nickname을 받아서 jwtStratage에서 생성한 토큰을 반환한다.
  async validatePlayer(loginDto: LoginDto): Promise<SigninDto> {
    try {
      const { email, password } = loginDto;

      const player = await this.playersRepository.findByEmail({
        email: email,
      });

      const valid = await bcrypt.compare(password, player.password);
      if (email && valid) {
        const { id, email, nickname } = player;
        return { id, email, nickname };
      }
      return null;
    } catch (err) {
      console.log(err.message);
    }
  }
  // 2. 토큰 생성
  // 위 이메일 주소와 비밀번호가 일치하면 토크을 생성한다.
  // jwt로 생성한 토큰은 (id, email, nickname)를 담고 있다.
  async signin(
    email: string,
    nickname: string,
    id: number,
    refreshTokenFromClient: string
  ): Promise<any> {
    try {
      console.log('----')
      const payload = {
        id,
        email,
        nickname,
      };
      console.log(payload);

      if (!refreshTokenFromClient) {
        console.log('리프레쉬 토큰이 없다면 실행');
        const refreshToken = this.getJwtRefreshToken(payload);
        const accessToken = this.getJwtAccessToken(payload);

        const refreshUpload = await this.playersRepository.updateRefreshToken(
          id,
          refreshToken
        );
        console.log(refreshUpload);

        return { refreshToken, accessToken };
      } else {
        const isValid = await this.checkRefreshToken(
          id,
          refreshTokenFromClient.split(' ')[1]
        );
        console.log(isValid);
        if (isValid) {
          const accessToken = this.getJwtAccessToken(payload);
          return { accessToken };
        }
        return null;
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  //
  getJwtAccessToken(payload: object) {
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: `${jwtConfig.accessTokenExp}s`,
    });
    // const accessCookie = `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${jwtConfig.accessTokenExp}`;
    return accessToken;
  }

  getJwtRefreshToken(payload: object) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: `${jwtConfig.refreshTokenExp}s`,
    });
    // const refreshCookie = `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${jwtConfig.refreshTokenExp}`;
    return refreshToken;
  }

  // 사용자로 부터 받은 리프레쉬 토큰을 DB에서 검증하는 함수
  async checkRefreshToken(id: number, refreshToken: string) {
    try {
      const encryptToken = await this.playersRepository.checkRefreshToken(id);
      const { currentHashedRefreshToken } = encryptToken;
      const result = await bcrypt.compare(
        refreshToken,
        currentHashedRefreshToken
      );
      return result;
    } catch (err) {
      console.log(err.message);
    }
  }

  async updateToken(id: number, email: string, nickname: string) {
    try {
      const payload = {
        id,
        email,
        nickname,
      };

      const refreshToken = this.getJwtRefreshToken(payload);
      const accessToken = this.getJwtAccessToken(payload);

      const refreshUpload = await this.playersRepository.updateRefreshToken(
        id,
        refreshToken
      );
      console.log(refreshUpload);

      return { refreshToken, accessToken };
    } catch (err) {
      console.log(err.message);
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
