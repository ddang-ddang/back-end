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
          // auth에는 클라이언트가 refreshtoken 헤더 key로 토큰을 받는다.
          const token = request.headers['refreshtoken'];
          // console.log(token);

          let refreshToken = '';
          // beaerer를 분리해준다.
          if (typeof token === 'string') refreshToken = token.split(' ')[1];
          console.log(refreshToken);

          return refreshToken;
        },
      ]),
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  // 위에서 return된 refreshToken를 통해 유저 정보를 decode 하고 payload로 반환된다.
  async validate(request: Request, payload: TokenPayloadDto) {
    this.logger.verbose('JWT REFREST strategy에서 인증을 넘겨 줍니다.');

    const { id } = payload;

    // 위에서 받아온 헤더의 refreshtoken을 받아와서 저장한다.
    const token = request.headers['refreshtoken'];
    let refreshToken = '';

    if (typeof token === 'string') refreshToken = token;

    // 앞에 혹시라도 Beaere가 붙어 있으면 나누고 토큰만 반환
    if (refreshToken.split(' ')[0] === 'Bearer') {
      const getData = await this.authService.checkRefreshToken(
        id,
        refreshToken.split(' ')[1]
      );
      if (!getData) {
        return false;
      }

      return payload;
    } else {
      // 만약 토큰인 Beaer가 안붙어있으면 붙여서 리프레쉬 토큰 비교
      const getData = await this.authService.checkRefreshToken(
        id,
        `Bearer` + refreshToken
      );
      if (!getData) {
        return false;
      }

      return payload;
    }
  }
}
