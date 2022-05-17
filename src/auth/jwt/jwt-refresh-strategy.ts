import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as config from 'config';
import { AuthService } from '../auth.service';
import { TokenPayloadDto } from '../../players/dto/create-player.dto';
import { Request } from 'express';
import { PlayersService } from '../../players/players.service';

const jwtConfig = config.get('jwt');

/*
 * JWT 토큰 Decode 로직
 *
 */
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token'
) {
  constructor(
    private readonly authService: AuthService,
    private readonly playersService: PlayersService
  ) {
    console.log('hello');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request.headers['cookies'];
          let tokenValue = '';
          if (typeof token === 'string') tokenValue = token.split(' ')[1];
          console.log(tokenValue);
          return tokenValue;
        },
      ]),
      secretOrKey: jwtConfig.refreshSecret,
      passReqToCallback: true,
      // ignoreExpiration: false,
    });
  }

  // 위에서 return된 tokenValue를 통해 유저 정보를 decode 하고 payload로 반환된다.
  async validate(request: Request, payload: TokenPayloadDto) {
    console.log(payload);
    const { id, email, nickname } = payload;
    const data = await this.playersService.getRefreshToken(id);
    console.log(data);
  }

  //   async validate(payload: any) {
  //     return {
  //       ok: true,
  //       player: {
  //         playerId: payload.id,
  //         email: payload.email,
  //         nickname: payload.nickname,
  //       },
  //     };
  //   }
}
