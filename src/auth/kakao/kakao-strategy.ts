import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import * as config from 'config';
import { AuthService } from '../auth.service';

const kakaoConfig = config.get('kakao');

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: kakaoConfig.clientId,
      clientSecret: kakaoConfig.clientSecret,
      callbackURL: '/api/players/kakaoauth',
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

    console.log(profile);
    // DB조회 후 없으면 DB저장
    // 저장될  provier id, provider, provider_id, email, nickname, profile_image, thumbnail_image
    // if (id) {
    // const hello = await this.authService.kakaoLogin(
    //   email,
    //   username,
    //   profile_image,
    //   'kakao',
    //   id
    // );

    //   return hello;
    // }

    // const player = await this.authService.findOrCreatePlayer(

    const player = {
      id,
      username,
      profileImg: profile_image,
      thumbnailImg: thumbnail_image,
      accessToken: access_token,
      refreshToken: refreshToken,
    };

    console.log(player);
    Done(null, player);
    return player;
  }
}
