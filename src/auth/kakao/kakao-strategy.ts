import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import * as config from 'config';

const kakaoConfig = config.get('kakao');

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: kakaoConfig.clientId,
      clientSecret: kakaoConfig.clientSecret,
      callbackURL: 'http://localhost:3000/players/kakaoredirect',
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
    const { profile_image, thumbnail_image } = profile._json.properties;

    const player = {
      id: id,
      username: username,
      profileImg: profile_image,
      thumbnailImg: thumbnail_image,
      access_token,
    };
    Done(null, player);
  }
}
