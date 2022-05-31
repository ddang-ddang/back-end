import { PlayerRepository } from 'src/players/players.repository';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';
import { PlayersService } from '../../players/players.service';
import { Logger } from '@nestjs/common';

@Injectable()

// 카카오 로그인 2단계 카카오 전략
// 카카오  로그인페이지로 넘어가서 카카오서버에서 이증 완료후 토큰을 받아온다.
// 이 트큰은 카카오와 백에서만 사용할 것이다.
export class KakaoStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger('KakoStrategy');

  constructor(private readonly authService: AuthService) {
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

    const data = await this.authService.checkIdByProviderId(id);

    const player = {
      id: data.id,
      username,
      email,
      profileImg: profile_image,
    };

    // controller 부분으로 넘겨줄 페이로더 값
    // 인자갑으로 넘겨줌 -> 이후에는 kakaoauth로 넘어감
    Done(null, player);
  }
}
