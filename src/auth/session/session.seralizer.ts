import { PlayersService } from 'src/players/players.service';
import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private playersService: PlayersService) {
    super();
  }
  async serializeUser(
    user: any,
    done: (err: Error, user: any) => void
  ): Promise<any> {
    const result = await this.playersService.findByEmail(user.id);

    done(null, result);
  }

  async deserializeUser(
    payload: any,
    done: (err: Error, payload: string) => void
  ): Promise<any> {
    const user = await this.playersService.findByEmail(payload.id);

    // done(null, user);
    done(null, 'hello');
  }
}
