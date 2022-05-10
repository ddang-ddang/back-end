import { CreateLikeDto } from './../../likes/dto/create-like.dto';
// import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import * as config from 'config';

const googleConfig = config.get('google');

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: '/players/redirect',
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }
  // 인증이 되어 있나 감시
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    Done: VerifyCallback
  ): Promise<any> {
    console.log(googleConfig.clientId);
    console.log(googleConfig.clientSecret);
    // console.log(accessToken);
    try {
      console.log(profile);
      const { emails, photos } = profile;
      const player = {
        email: emails[0].value,
        profileImg: photos[0].value,
        accessToken,
      };
      Done(null, player);
    } catch (err) {
      console.log(err);
    }
  }
}
