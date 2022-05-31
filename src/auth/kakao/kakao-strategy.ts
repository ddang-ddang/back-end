import { PlayerRepository } from 'src/players/players.repository';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { PlayersService } from '../../players/players.service';
import { Logger } from '@nestjs/common';
import { kakaoConfig } from '../../../configs';
import * as bcrpyt from 'bcrypt';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('KakoStrategy');
  constructor(
    private readonly authService: AuthService,
    private readonly playersService: PlayersService,
    private readonly playersRepository: PlayerRepository
  ) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: process.env.KAKAO_CALLBACK_URL,

      //   scope: ['profile'],
    });
  }
  // 인증이 되어 있나 감시
  async validate(
    access_token: string,
    refreshToken: string,
    profile: any,
    Done: any
  ): Promise<any> {
    const { id, username } = profile;
    const { profile_image } = profile._json.properties;
    const email = profile._json.kakao_account.email;

    this.logger.verbose('kakao strategy 시작');

    //생성을 매번 하니까 안되는거지 ....

    const refreshToken2 = this.authService.getJwtRefreshTokenForKakao({
      id,
      username,
      email,
    });

    const player = {
      id,
      username,
      email,
      profileImg: profile_image,
      access_token,
      refreshToken: refreshToken2,
    };

    const isJoin = await this.playersService.findByEmail({
      email,
    });

    if (!isJoin) {
      console.log('가입해야합니다.');
      this.logger.verbose(
        `${player.email}님이 카카오로 회원가입을 진행합니다.`
      );

      // console.log(access_token);
      console.log(refreshToken2);
      //가입
      const joinGame = await this.playersService.signup({
        email: player.email,
        password: id + username,
        nickname: username,
        mbti: 'mbti',
        profileImg: profile_image,
        provider: 'kakao',
        providerId: id,
        currentHashedRefreshToken: await bcrpyt.hash(refreshToken2, 10),
        // currentHashedRefreshToken: access_token,
      });

      // this.playersRepository.saveRefreshToken(id, refreshToken2);
      // console.log(joinGame);
    } else {
      // const refreshToken = this.authService.getJwtRefreshToken(payload);
    }
    //로그인 엑세스토큰과 리프레쉬 토큰 가저오기

    // const player = {
    //   id
    // } }

    Done(null, player);
  }
}
