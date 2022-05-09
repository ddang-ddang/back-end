import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Request,
  Header,
  Logger,
} from '@nestjs/common';

// 서비스 관련 모듈
import { AuthService } from 'src/auth/auth.service';
import { PlayersService } from './players.service';

// 인증관련 모듈
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { GoogleAuthGuard } from 'src/auth/google/google-auth.guard';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { KakaoAuthGuard } from 'src/auth/kakao/kakao-auth.guard';

// 데이터 엔티티
import { Player } from './entities/player.entity';
import {
  CreateBodyDto,
  CreateIdDto,
  CreatePlayerDto,
} from './dto/create-player.dto';

/* TODO
 * 1. [ ] 이메일 중복 조회 (중복 이메일이 있으면 중복, 없으면 사용 가능)
 * 2. [ ] 닉네임 수정
 * 3. [ ] 프로필 사진 수정
 * 4. [ ] auth controller를 만들어서 넣을지 생각해보자
 * 5.
 */

@Controller('players')
export class PlayersController {
  private logger = new Logger('PlayersController');
  constructor(
    private readonly playersService: PlayersService,
    private readonly authService: AuthService
  ) {}

  // signup
  @ApiOkResponse({ type: Player, isArray: true })
  @ApiQuery({ name: 'name', required: false })
  @ApiCreatedResponse({ type: CreateBodyDto })
  @Post('signup')
  async signUp(
    @Body() { email, nickname, password, mbti, profileImg }: CreateBodyDto
  ): Promise<any> {
    this.logger.verbose(`try to sign up player: ${email}`);
    try {
      await this.playersService.signup({
        email,
        nickname,
        password,
        mbti,
        profileImg,
      });
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.message,
      };
    }
  }

  // signin
  // 흐름도 local auth -> auth service (validate) -> controller
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Request() req) {
    try {
      const { email, nickname } = req.user;
      return { ok: true, row: { email: email, nickname: nickname } };
    } catch (err) {
      return {
        ok: false,
        message: err.message,
      };
    }
  }

  // signout
  @Get('signout')
  signOut() {
    return { hello: 'world' };
  }

  //원하는 곳에 JwtAuthGuard 붙이면 됨
  @Header('Access-Control-Allow-Origin', '*')
  @ApiOperation({ summary: 'jwt인증 API' })
  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async getHello(@Request() req): Promise<any> {
    return req.user;
  }

  @Header('Access-Control-Allow-Origin', '*')
  @ApiOperation({ summary: 'jwt인증 API' })
  @UseGuards(GoogleAuthGuard)
  @Get('googleauth')
  async googleAuth(@Request() req) {
    return req;
  }

  @Header('Access-Control-Allow-Origin', '*')
  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.authService.googleLogin(req);
  }

  @Header('Access-Control-Allow-Origin', '*')
  @UseGuards(KakaoAuthGuard)
  @Get('kakaoauth')
  async kakaoAuth(@Request() req) {
    return req;
  }

  @Get('kakaoredirect')
  @UseGuards(KakaoAuthGuard)
  kakaopage(@Request() req) {
    return this.authService.kakaoLogin(req);
  }

  // mypage
  @Get('mypage')
  loadMypage() {
    return null;
  }

  // edit
  @Patch('edit')
  editPlayers() {
    return null;
  }
}
