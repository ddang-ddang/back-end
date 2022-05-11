import { access } from 'fs';
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
  Response,
  Logger,
  UseInterceptors,
  UploadedFile,
  Res,
  Param,
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
  InputPlayerDto,
  UpdateNickname,
} from './dto/create-player.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

  /*
   * 회원가입
   * @Param email, nickname, password, mbti, profileImg
   */

  @ApiOkResponse({ type: Player, isArray: true })
  @ApiQuery({ name: 'name', required: false })
  @ApiCreatedResponse({ type: CreateBodyDto })
  @Post('signup')
  async signUp(
    @Body()
    inputBodyDto: InputPlayerDto
  ): Promise<any> {
    const { email, nickname, password, mbti, profileImg } = inputBodyDto;
    this.logger.verbose(`try to sign up player: ${email}`);

    console.log({ email, nickname, password, mbti, profileImg });
    try {
      await this.playersService.signup({
        email,
        nickname,
        password,
        mbti,
        profileImg,
        provider: 'local',
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
  /*
   * 이메일로 로그인
   *
   */

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Request() req, @Res({ passthrough: true }) res) {
    try {
      const { email, nickname } = req.user;

      this.logger.verbose(`try to sign in player: ${email}`);

      const accessToken = await this.authService.login(email, nickname);
      res.setHeader('Authorization', `Bearer ${accessToken.accessToken}`);

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
  signOut(@Response() res) {
    res.cookie('accessToken', '', { expires: new Date(0) });
    return { hello: 'world' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }

  //원하는 곳에 JwtAuthGuard 붙이면 됨
  @ApiOperation({ summary: 'jwt인증 API' })
  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async getHello(@Request() req): Promise<any> {
    const { Id, email, nickname } = req.user.player;
    this.logger.verbose(`try to sign in player: ${email}`);
    console.log(req.user.player);
    return {
      ok: true,
      row: { playerId: Id, email: email, nickname: nickname },
    };
  }

  @ApiOperation({ summary: 'jwt인증 API' })
  @UseGuards(GoogleAuthGuard)
  @Get('googleauth')
  async googleAuth(@Request() req) {
    console.log(req.user);
    return req;
  }

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req, @Res() res) {
    // return this.authService.googleLogin(req);
    // return res.status(302).redirect('http://localhost:3005');
    return res.writeHead(301, { Location: 'http://localhost:3005' });
  }

  @UseGuards(KakaoAuthGuard)
  @Get('kakaoauth')
  async kakaoAuth(@Request() req) {
    const { email, nickname, accessToken, profileImg } = req.user;
    console.log(req.user);
    return { ok: true };
  }

  @Get('kakaoredirect')
  @UseGuards(KakaoAuthGuard)
  kakaopage(@Request() req, @Res() res) {
    const { email, nickname, accessToken, profileImg } = req.user;
    // return { ok: true, row: req.user };
    // return res.writeHead(301, { Location: 'http://localhost:3005' });
    return res.status(302).redirect('http://localhost:3005');
    // return res.status(302).redirect('/');
  }

  // mypage
  @UseGuards(JwtAuthGuard)
  @Get('mypage')
  async loadMypage(@Request() req): Promise<any> {
    console.log(req.user.player);
    const { email, nickname } = req.user.player;
    const player = await this.playersService.getDataByEmail(email);
    const { profileImg } = player;

    return {
      ok: true,
      row: { email: email, nickname: nickname, profileImg: profileImg },
    };
  }

  // 중복확인
  @Post('dupNickname')
  async duplicateNicknameCheck(@Body() nickname: string) {
    const result = await this.playersService.findByNickname(nickname);
    return { ok: true, row: result };
  }

  @Post('dupEmail')
  async duplicateEmailCheck(@Body() nickname: string) {
    console.log(nickname);
    const result = await this.playersService.findByEmail(nickname);
    return { ok: true, row: result };
  }
  // edit
  @Patch('edit')
  async editPlayers(@Body() { email, nickname }: UpdateNickname) {
    const result = await this.playersService.updateNickname({
      email,
      nickname,
    });
    return { ok: true, row: result };
  }
}
