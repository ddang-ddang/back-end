import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class AuthService {
  constructor(
    private playersService: PlayersService,
    private jwtService: JwtService
  ) {}

  // 인증이 되어 있나 감시
  async validatePlayer(email: string, password: string): Promise<any> {
    const player = await this.playersService.getByEmail(email);
    if (email && player.password === password) {
      const { password, ...result } = player;
      return result;
    }
    return null;
  }

  async login(email: string, password: string): Promise<any> {
    const payload = { email: email, password: password };

    return {
      email,
      access_token: this.jwtService.sign(payload),
    };
  }
}
