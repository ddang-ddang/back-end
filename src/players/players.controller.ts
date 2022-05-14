import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Request,
  Logger,
  Res,
  BadRequestException,
} from '@nestjs/common';

// 서비스 관련 모듈
import { PlayersService } from './players.service';

// 인증관련 모듈

// 데이터 엔티티
import { Player } from './entities/player.entity';
import { EmailDto, InputPlayerDto, NicknameDto } from './dto/create-player.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local/local-auth.guard';
import { GoogleAuthGuard } from '../auth/google/google-auth.guard';
import { KakaoAuthGuard } from '../auth/kakao/kakao-auth.guard';

@Controller('api/players')
@ApiTags('플레이어 API')
export class PlayersController {
  private logger = new Logger('PlayersController');
  constructor(
    private readonly playersService: PlayersService,
    private readonly authService: AuthService
  ) {}

  /*
   * 회원가입
   * @param email, nickname, password, mbti, profileImg
   */
  @ApiOkResponse({ type: Player, isArray: true })
  @ApiQuery({ name: '회원가입', required: false })
  @ApiCreatedResponse({ type: InputPlayerDto })
  @Post('signup')
  async signUp(
    @Body()
    inputBodyDto: InputPlayerDto
  ): Promise<object> {
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
      if (!err) {
        throw new BadRequestException({
          ok: false,
          message: err.message,
        });
      }
    }
  }

  /* 닉네임 중복확인 */
  /**
   * @param {nickname} nickname - 중복체크할 닉네임
   * @returns {boolean} - true: 중복, false: 중복안됨
   */
  @ApiOkResponse({ type: Player, isArray: true })
  @ApiQuery({ name: '닉네임 중복확인', required: false })
  @ApiCreatedResponse({ type: NicknameDto })
  @Post('dupNickname')
  async duplicateNicknameCheck(@Body() nicknameDto: NicknameDto) {
    const { nickname } = nicknameDto;

    this.logger.verbose(`닉네임을 중복확인을 하려 합니다`);

    const result = await this.playersService.findByNickname({ nickname });

    return { ok: true, row: result };
  }

  /* 이메일 중복확인 */
  /**
   * @param { email } email - 중복체크할 이메일
   * @returns { row }  row - true: 중복, false: 중복안됨
   */
  @ApiOkResponse({ type: Player, isArray: true })
  @ApiQuery({ name: '이메일 중복확인', required: false })
  @ApiCreatedResponse({ type: EmailDto })
  @Post('dupEmail')
  async duplicateEmailCheck(@Body() emailDto: EmailDto) {
    const { email } = emailDto;
    this.logger.verbose(`이메일 중복확인을 하려 합니다`);

    const result = await this.playersService.findByEmail({ email });
    return { ok: true, row: result };
  }

  // 이메일을 받아서 닉네임을 수정
  @UseGuards(JwtAuthGuard)
  @Patch('edit')
  async editPlayers(@Body() { profileImg, nickname }, @Request() req) {
    try {
      const { email } = req.user.player;
      this.logger.verbose(
        `${email}님이 닉네임 또는 프로파일 이미지를 수정 하려 합니다`
      );

      const result = await this.playersService.editPlayer({
        email,
        profileImg,
        nickname,
      });
      return { ok: true, row: result };
    } catch (err) {
      if (!err) {
        throw new BadRequestException({
          ok: false,
          message: err.message,
        });
      }
    }
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
   * local.straegy에서 이메일을 찾아서 로그인한다.
   *  authService validate를 한다이메일을 찾아서 로그인한다.
   *  authService 에서 로그인을 한다.
   *
   */
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Request() req, @Res({ passthrough: true }) res) {
    try {
      const { email, nickname } = req.user;

      this.logger.verbose(`${email}님이 로그인하려고 합니다`);

      const accessToken = await this.authService.login(email, nickname);
      console.log(accessToken);

      res.setHeader('Authorization', `Bearer ${accessToken}`);

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
  async getHello(@Request() req): Promise<object> {
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
    const { email, accessToken } = req.user;
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
    const { email, accessToken } = req.user;
    this.logger.verbose(`${email}님이 카카오 로그인을 이용 하려고 합니다`);
    console.log(accessToken);
    console.log(req.user);
    return { ok: true };
  }

  /* 카카오 리다이렉트 부분 */
  @Get('kakaoredirect')
  @UseGuards(KakaoAuthGuard)
  kakaopage(@Request() req, @Res() res) {
    const { email, accessToken } = req.user;
    this.logger.verbose(
      `${email}님이 카카트로그인 리다이렉트을 이용 하려고 합니다`
    );

    return res.writeHead(301, { Location: 'http://localhost:3005' });
  }

  // mypage
  @UseGuards(JwtAuthGuard)
  @Get('mypage')
  async loadMypage(@Request() req): Promise<object> {
    try {
      const { email, nickname, playerId } = req.user.player;
      this.logger.verbose(`${email}님이 마이페이지를 이용 하려고 합니다`);
      const player = await this.playersService.getDataByEmail({ email });
      console.log(player);

      const { profileImg, mbti, level, exp } = player;

      const locations = await this.playersService.loadLatLng(playerId);
      // const test = await this.playersService.

      // const { comments } = locations;

      console.log(locations);

      return {
        ok: true,
        // locations,
        profile: {
          playerId: playerId,
          email: email,
          nickname: nickname,
          profileImg: profileImg,
          mbti: mbti,
          level: level,
          exp: exp,
          occupiedPlaces: locations,
        },
      };
    } catch (err) {
      console.log(err);
    }
  }
}
