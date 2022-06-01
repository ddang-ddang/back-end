import { PlayerRepository } from 'src/players/players.repository';
import * as bcrypt from 'bcrypt';
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

  constructor(
    private readonly authService: AuthService,
    private readonly playersService: PlayersService
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
    refreshToken2: string,
    profile: any,
    Done: any
  ): Promise<any> {
    // const { providerId: id, username } = profile;

    const info = {
      id: 0,
      providerId: profile.id,
      username: profile.username,
      profile_image: profile._json.properties.profile_image,
      email: profile._json.kakao_account.email,
      refreshToken: '',
    };
    console.log(info);

    //가입여부 확인
    const isJoin = await this.playersService.findByEmail({ email: info.email });
    console.log(isJoin);

    //가입 되어있으면 가입진행
    if (!isJoin) {
      console.log('가입해야합니다.');
      this.logger.verbose(
        `${{ email: info.email }}님이 카카오로 회원가입을 진행합니다.`
      );

      //가입
      //DB에 개인정보 가입
      const joinGame = await this.playersService.signup({
        email: info.email,
        password: info.providerId + info.username,
        nickname: info.username,
        mbti: '',
        profileImg: info.profile_image,
        provider: 'kakao',
        providerId: info.providerId,
        currentHashedRefreshToken: '',
      });

      // 린턴된 id값을 저장
      info.id = joinGame.id;
      console.log(info.id);

      // 토큰 생성
      const tokens = await this.authService.updateToken(
        info.id,
        info.email,
        info.username
      );

      // 생성된 refresh토큰을 저장한다.
      const refreshToken2 = (await tokens).refreshToken;
      info.refreshToken = refreshToken2;
      console.log(refreshToken2);

      const player = {
        id: info.id,
        email: info.email,
        nickname: info.username,
        profileImg: info.profile_image,
        refreshToken: refreshToken2,
      };

      // kakaoauth에 반환
      this.logger.verbose(`kakao strategy 가입완료 ${joinGame}`);
      return Done(null, player);
    }
    //새로운 토큰을 발급 및 서버에 저장
    // 저장은 Beaerer 에다가 토큰을 붙이고 DB currentRefreshToken에 저장한다.
    const id = await this.authService.checkIdByProviderId(info.providerId);

    // 저장
    info.id = id.id;

    const tokens = this.authService.updateToken(
      info.id,
      info.email,
      info.username
    );

    // 생성된 refresh토큰을 저장한다.
    info.refreshToken = (await tokens).refreshToken;

    const player = {
      refreshToken: info.refreshToken,
    };

    // controller 부분으로 넘겨줄 페이로더 값
    // 인자갑으로 넘겨줌 -> 이후에는 kakaoauth로 넘어감
    Done(null, player);
  }
}
