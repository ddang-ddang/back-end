import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as config from 'config';

const jwtConfig = config.get('jwt');

/*
 * JWT 토큰 Decode 로직
 *
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessSecret,
    });
  }

  async validate(payload: any) {
    console.log(payload);
    return {
      ok: true,
      player: {
        playerId: payload.id,
        email: payload.email,
        nickname: payload.nickname,
      },
    };
  }
}
