import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import * as config from 'config';

const googleConfig = config.get('google');

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: '/api/players/googleauth',
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }
  // 인증이 되어 있나 감시
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    req: any
  ): Promise<any> {
    const { id, emails, disaplayName } = req;
    console.log(req);

    console.log(profile);
    return {
      provider: 'google',
      providerId: id,
      nickname: disaplayName,
      email: emails[0].value,
    };
  }
}
