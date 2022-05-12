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
  EmailDto,
  InputPlayerDto,
  NicknameDto,
  UpdateInfoDto,
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
    this.logger.verbose(`회원을 가입하려고 합니다.: ${email}`);

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

  /* 닉네임 중복확인 */
  @Post('dupNickname')
  async duplicateNicknameCheck(@Body() nicknameDto: NicknameDto) {
    const { nickname } = nicknameDto;

    const result = await this.playersService.findByNickname({ nickname });
    console.log(result);
    return { ok: true, row: result };
  }

  /* 이메일 중복확인 */
  @Post('dupEmail')
  async duplicateEmailCheck(@Body() emailDto: EmailDto) {
    const { email } = emailDto;

    const result = await this.playersService.findByEmail({ email });
    return { ok: true, row: result };
  }

  // 이메일을 받아서 닉네임을 수정
  @UseGuards(JwtAuthGuard)
  @Patch('edit')
  async editPlayers(
    @Body() { profileImg, nickname }: UpdateInfoDto,
    @Request() req
  ) {
    const { email } = req.user.player;
    console.log(nickname);
    const result = await this.playersService.updateNickname({
      email,
      profileImg,
      nickname,
    });
    return { ok: true, row: result };
  }

  /*
   ************************* 인증 관련 라우터 시작 *********************************
   *  로컬 이메일 인증 : /players/signin -> /players/auth
   *  카카오 인증 : /players/kakaosignin -> /players/auth
   *  구글 인증 : /players/googlesignin -> /players/auth
   ****************************************************************************
   */

  /*
   * 이메일로 로그인
   */
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Request() req, @Res({ passthrough: true }) res) {
    try {
      const { email, nickname } = req.user;

      this.logger.verbose(`${email}님이 로그인하려고 합니다`);

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

  //원하는 곳에 JwtAuthGuard 붙이면 됨
  @ApiOperation({ summary: 'jwt인증 API' })
  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async getHello(@Request() req): Promise<any> {
    const { playerId, email, nickname } = req.user.player;
    this.logger.verbose(`${email}님이 인증을 시도합니다.`);
    return {
      ok: true,
      row: { playerId: playerId, email: email, nickname: nickname },
    };
  }

  /*
   * 구글 로그인
   *
   */

  @ApiOperation({ summary: 'jwt인증 API' })
  @UseGuards(GoogleAuthGuard)
  @Get('googleauth')
  async googleAuth(@Request() req) {
    console.log(req.user);
    return req;
  }

  /* 구글 리다이렉트 부분 */
  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req, @Res() res) {
    const { email, nickname, accessToken, profileImg } = req.user;
    this.logger.verbose(
      `${email}님이 구글로그인 리다이렉트을 이용 하려고 합니다`
    );
    console.log(accessToken);
    console.log(req.user);
    return res.writeHead(301, { Location: 'http://localhost:3005' });
  }

  /*
   * 카카오 로그인
   */
  @UseGuards(KakaoAuthGuard)
  @Get('kakaoauth')
  async kakaoAuth(@Request() req) {
    const { email, nickname, accessToken, profileImg } = req.user;
    this.logger.verbose(`${email}님이 카카오 로그인을 이용 하려고 합니다`);
    console.log(accessToken);
    console.log(req.user);
    return { ok: true };
  }

  /* 카카오 리다이렉트 부분 */
  @Get('kakaoredirect')
  @UseGuards(KakaoAuthGuard)
  kakaopage(@Request() req, @Res() res) {
    const { email, nickname, accessToken, profileImg } = req.user;
    this.logger.verbose(
      `${email}님이 카카트로그인 리다이렉트을 이용 하려고 합니다`
    );

    console.log(accessToken);
    console.log(req.user);
    // return { ok: true, row: req.user };
    return res.writeHead(301, { Location: 'http://localhost:3005' });
    // return res.status(302).redirect('http://localhost:3005');
    // return res.status(302).redirect('/');
  }

  // mypage
  @UseGuards(JwtAuthGuard)
  @Get('mypage')
  async loadMypage(@Request() req): Promise<any> {
    try {
      const { email, nickname } = req.user.player;
      this.logger.verbose(`${email}님이 마이페이지를 이용 하려고 합니다`);
      const player = await this.playersService.getDataByEmail(email);
      const { profileImg } = player;

      return {
        ok: true,
        profile: { email: email, nickname: nickname, profileImg: profileImg },
      };
    } catch (err) {
      console.log(err);
    }
  }
}
