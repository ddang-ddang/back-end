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
<<<<<<< HEAD
    await this.authService.checkById(payload);
=======
    console.log('-----------------------------------');
    const result = await this.authService.checkById(payload);
    console.log(result);
    console.log(payload);
    console.log('디ㅏ시리얼 라이즈 되는 부분');
    console.log('-----------------------------------');
    // console.log()
>>>>>>> 56e9f943902094f2c0b836f4f9e8628b803f7ead
    done(null, payload);
  }
}
