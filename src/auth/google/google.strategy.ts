import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PlayersService } from '../../players/players.service';
import { googleConfig } from '../../../configs';
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private logger = new Logger('google');
  JwtService: any;
  constructor(
    private readonly playersService: PlayersService,
    private readonly authService: AuthService
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }
  // 인증이 되어 있나 감시
  async validate(
    accessToken: string,
    // refreshToken: string,
    user: any,
    req: any,
    done: VerifyCallback
  ): Promise<any> {
    const { id, emails, displayName, photos } = req;
    const isJoin = await this.playersService.findByEmail({
      email: emails[0].value,
    });

    const payload = {
      email: emails[0].value,
      displayName,
      id,
    };

    const refreshToken = this.authService.getJwtRefreshToken(payload);

    // console.log(access_token);
    console.log(refreshToken);

    if (!isJoin) {
      this.logger.verbose(`${displayName}님이 구글로 회원가입을 진행합니다.`);
      const payload = {
        email: emails[0].value,
        password: id + displayName,
        nickname: displayName,
        mbti: 'mbti',
        profileImg: photos[0].value,
        provider: 'google',
        providerId: id,
        currentHashedRefreshToken: refreshToken,
      };

      //가입
      const joinGame = await this.playersService.signup(payload);
      console.log(joinGame);
    }

    const player = {
      id,
      nickname: displayName,
      profileImg: photos[0].value,
      email: emails[0].value,
      refreshToken,
    };

    // 로그인 성공
    done(null, player);
  }
}
