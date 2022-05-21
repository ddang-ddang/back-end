import { AuthService } from 'src/auth/auth.service';
import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthService) {
    super();
  }
  async serializeUser(
    user: any,
    done: (err: Error, user: any) => void
  ): Promise<any> {
    done(null, user.id);
  }

  async deserializeUser(
    // id: any,
    payload: any,
    done: (err: Error, payload: string) => void
  ): Promise<any> {
    await this.authService.checkById(payload);
    done(null, payload);
  }
}
