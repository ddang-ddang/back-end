import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import {
  LoginDto,
  // PlayerIdDto,
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
  async signin(email: string, nickname: string, id: number): Promise<any> {
    try {
      const payload = {
        id,
        email,
        nickname,
      };
      // console.log(res.user);

      // 리프레쉬 토큰생성
      const refreshToken = this.getJwtRefreshToken(payload);

      // 엑세스 토큰 생성
      const accessToken = this.getJwtAccessToken(payload);

      // refresh 토큰을 DB에 저장한다.
      const result = await this.playersRepository.saveRefreshToken(
        id,
        refreshToken
      );

      return { refreshToken, accessToken };
    } catch (err) {
      console.log(err.message);
    }
  }

  async logout(id: number) {
    try {
      const result = await this.playersRepository.deleteToken(id);
      console.log(result);
      const deleteCookie = [
        'authorization=; HttpOnly; Path=/; Max-Age=0',
        'Refresh=; HttpOnly; Path=/; Max-Age=0',
      ];
      return deleteCookie;
    } catch (err) {
      console.log(err.message);
    }
  }

  // 토큰을 생성하는 함수
  getJwtAccessToken(payload: object) {
    const token = this.jwtService.sign(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: `${jwtConfig.accessTokenExp}s`,
    });

    // const accessCookie = `authorization=Bearer ${accessToken}; HttpOnly; Path=/; Max-Age=${jwtConfig.accessTokenExp}`;
    const accessToken = `Bearer ${token}`;
    return accessToken;
  }

  // 리프레쉬 토큰을 생성하는 함수
  getJwtRefreshToken(payload: object) {
    const token = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: `${jwtConfig.refreshTokenExp}s`,
    });
    // const refreshCookie = `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${jwtConfig.refreshTokenExp}`;
    const refreshToken = `Bearer ${token}`;
    return refreshToken;
  }

  // 사용자로 부터 받은 리프레쉬 토큰을 DB에서 검증하는 함수
  async checkRefreshToken(id: number, refreshToken: string): Promise<boolean> {
    try {
      // 리프레쉬 토큰을 DB에서 검색한다.
      const encryptToken = await this.playersRepository.checkRefreshToken(id);
      // 리프레쉬 토큰이 일치하면 true, 아니면 false
      if (!encryptToken) {
        console.log('리프레쉬 토큰이 없다면 실행');
        return false;
      }
      // 리프레쉬토큰 구조분해 할당
      const { currentHashedRefreshToken } = encryptToken;

      // 리프레쉬 토큰을 구조분해한 값과 비교한다.
      const result = await bcrypt.compare(
        refreshToken,
        currentHashedRefreshToken
      );

      return result;
    } catch (err) {
      console.log(err.message);
    }
  }

  // 리프레쉬, 엑세스 토큰을 업데이트 하는 함수
  async updateToken(id: number, email: string, nickname: string) {
    try {
      const payload = {
        id,
        email,
        nickname,
      };

      const refreshToken = this.getJwtRefreshToken(payload);
      const accessToken = this.getJwtAccessToken(payload);

      await this.playersRepository.saveRefreshToken(id, refreshToken);

      return { refreshToken, accessToken };
    } catch (err) {
      console.log(err.message);
    }
  }

  async kakaoLogin(
    email: string,
    nickname: string,
    profileImg: string,
    provider: string,
    providerId: string
  ) {
    try {
      const result = this.playersRepository.findOrCreatePlayer({
        email,
        nickname,
        password: '',
        mbti: '자아성적성',
        profileImg,
        provider,
        providerId,
      });
    } catch (err) {
      console.log(err.messagge);
    }
  }

  async checkSignUp(providerId: string, provider: string): Promise<boolean> {
    try {
      const result = await this.playersRepository.checkSignUp(
        providerId,
        provider
      );
      return result;
    } catch (err) {
      console.log(err.message);
    }
  }

  async checkById(id: number): Promise<boolean> {
    try {
      const result = await this.playersRepository.checkById(id);
      return result;
    } catch (err) {
      console.log(err.message);
    }
  }
}
