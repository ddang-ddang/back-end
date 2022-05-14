import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PlayersService } from '../../players/players.service';

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
    console.log('kaka', result);

    done(null, result);
  }

  async deserializeUser(
    payload: any,
    done: (err: Error, payload: string) => void
  ): Promise<any> {
    const user = await this.playersService.findByEmail(payload.id);
    console.log('deserialize', user);

    // done(null, user);
    done(null, 'find');
  }
}
