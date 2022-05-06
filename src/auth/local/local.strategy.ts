import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CreateBodyDto, CreateIdDto } from 'src/players/dto/create-player.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  // 인증이 되어 있나 감시
  async validate(email: string, password: string): Promise<CreateIdDto> {
    const player = await this.authService.validatePlayer(email, password);
    if (!player) {
      throw new UnauthorizedException();
    }
    return player;
  }
}
