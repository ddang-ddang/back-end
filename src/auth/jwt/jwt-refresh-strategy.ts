import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { TokenPayloadDto } from '../../players/dto/create-player.dto';
import { Request } from 'express';

/*
 * JWT 토큰 Decode 로직
 *
 */
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token'
) {
  private logger = new Logger('PlayersController');
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          this.logger.verbose(
            'JWT REFREST strategy에서 유저 정보를 가져옵니다.'
          );
          // auth에는 클라이언트가 bearer 형식으로 refresh 토큰을 넣어준다.
          const token = request.headers['refreshtoken'];
          // console.log(token);
          let refreshToken = '';
          if (typeof token === 'string') refreshToken = token.split(' ')[1];
          console.log(refreshToken);

          return refreshToken;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  // 위에서 return된 refreshToken를 통해 유저 정보를 decode 하고 payload로 반환된다.
  async validate(request: Request, payload: TokenPayloadDto) {
    this.logger.verbose('JWT REFREST strategy에서 인증을 넘겨 줍니다.');

    const { id } = payload;
    console.log(payload);

    const token = request.headers['refreshtoken'];
    console.log(token);
    let refreshToken = '';
    if (typeof token === 'string') refreshToken = token;

    const getData = await this.authService.checkRefreshToken(id, refreshToken);

    if (!getData) {
      return false;
    }

    return payload;
  }
}
