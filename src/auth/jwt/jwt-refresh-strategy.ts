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
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // auth에는 클라이언트가 bearer 형식으로 refresh 토큰을 넣어준다.
          const token = request.headers['refreshtoken'];
          let refreshToken = '';
          if (typeof token === 'string') refreshToken = token.split(' ')[1];

          return refreshToken;
        },
      ]),
      secretOrKey: jwtConfig.refreshSecret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  // 위에서 return된 refreshToken를 통해 유저 정보를 decode 하고 payload로 반환된다.
  async validate(request: Request, payload: TokenPayloadDto) {
    const { id } = payload;

    const token = request.headers['refreshtoken'];
    let refreshToken = '';
    if (typeof token === 'string') refreshToken = token.split(' ')[1];

    const getData = await this.authService.checkRefreshToken(id, refreshToken);

    if (!getData) {
      return false;
    }

    return payload;
  }
}
