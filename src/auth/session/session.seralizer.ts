import { AuthService } from 'src/auth/auth.service';
import { PlayersService } from 'src/players/players.service';
import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { KakaoStrategy } from '../kakao/kakao-strategy';
import { LocalStrategy } from '../local/local.strategy';
import { GoogleStrategy } from '../google/google.strategy';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    private playersService: PlayersService,
    private kakaoStrategy: KakaoStrategy,
    private localStrategy: LocalStrategy,
    private googleStrategy: GoogleStrategy,
    private authService: AuthService
  ) {
    super();
  }
  async serializeUser(
    user: any,
    done: (err: Error, user: any) => void
  ): Promise<any> {
    console.log(user);

    console.log('시리얼 라이즈 되는 부분');

    done(null, user.id);
  }

  async deserializeUser(
    // id: any,
    payload: any,
    done: (err: Error, payload: string) => void
  ): Promise<any> {
    console.log('-----------------------------------');
    const result = await this.authService.checkById(payload);
    console.log(result)
    console.log(payload);
    console.log('디ㅏ시리얼 라이즈 되는 부분');
    console.log('-----------------------------------');
    // console.log()
    done(null, payload);
    // done(null, user);
  }
}
