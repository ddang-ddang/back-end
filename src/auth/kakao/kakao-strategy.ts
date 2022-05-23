import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { PlayersService } from '../../players/players.service';
import { Logger } from '@nestjs/common';
import { kakaoConfig } from '../../../configs';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('KakoStrategy');
  constructor(
    private readonly authService: AuthService,
    private readonly playersService: PlayersService
  ) {
    super({
      clientID: kakaoConfig.clientId,
      clientSecret: kakaoConfig.clientSecret,
      callbackURL: kakaoConfig.callbackUrl,
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

    const player = {
      id,
      username,
      email,
      profileImg: profile_image,
      refreshToken,
    };

    const isJoin = await this.playersService.findByEmail({
      email,
    });

    if (!isJoin) {
      console.log('가입해야합니다.');
      this.logger.verbose(
        `${player.email}님이 카카오로 회원가입을 진행합니다.`
      );
      //가입
      const joinGame = await this.playersService.signup({
        email: player.email,
        password: id + username,
        nickname: username,
        mbti: 'mbti',
        profileImg: profile_image,
        provider: 'kakao',
        providerId: id,
        currentHashedRefreshToken: refreshToken,
      });
      console.log(joinGame);
    }
    //로그인 엑세스토큰과 리프레쉬 토큰 가저오기

    Done(null, player);
  }
}
