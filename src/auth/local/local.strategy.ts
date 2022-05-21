import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  // 인증이 되어 있나 감시
  async validate(email: string, password: string): Promise<object> {
    try {
      const player = await this.authService.validatePlayer({ email, password });
      const { nickname, id } = player;

      if (!player) {
        console.log('error');
        throw new UnauthorizedException();
      }
      return { email, nickname, id };
    } catch (err) {}
  }
}
