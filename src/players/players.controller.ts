import { JwtRefreshTokenGuard } from '../auth/jwt/jwt-refresh-token.guard';
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
  UnauthorizedException,
  HttpCode,
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
import { EmailDto, InputPlayerDto, NicknameDto } from './dto/create-player.dto';

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

    try {
      await this.playersService.signup({
        email,
        nickname,
        password,
        mbti,
        profileImg,
        provider: 'local',
        providerId: null,
        currentHashedRefreshToken: null,
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
      const { id, email, nickname } = req.user;

      //로그인할때 헤더에서 토큰을 받는다.
      const refreshTokenFromClient = req.headers['authorization'];

      this.logger.verbose(`${email}님이 로그인하려고 합니다`);

      const tokens = await this.authService.signin(
        email,
        nickname,
        id,
        refreshTokenFromClient
      );

      const { accessToken, refreshToken } = tokens;
      console.log(accessToken);

      if (!refreshTokenFromClient) {
        res.setHeader('refresh', refreshToken);
        res.setHeader('authorization', accessToken);
        // req.res.setHeader('Set-Cookie', accessCookie);

        return { ok: true, row: { email: email, nickname: nickname } };
      } else {
        res.setHeader('authorization', accessToken);
        // req.res.setHeader('Set-Cookie', accessCookie);
      }
      throw new UnauthorizedException('refreshToken is invalid');
    } catch (err) {
      return {
        ok: false,
        message: err.message,
      };
    }
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('auth')
  async test(@Request() req, @Res({ passthrough: true }) res) {
    try {
      // console.log(req.user);
      // console.log("1111111111111111")
      const { id, email, nickname } = req.user;
      const createCookie = this.authService.getJwtAccessToken({
        id,
        email,
        nickname,
      });

      // 쿠키를 강제로 주입한다.
      res.setHeader('access', createCookie);
      // req.res.setHeader('Set-Cookie', createCookie.accessCookie);

      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  @HttpCode(200)
  async logout(@Request() req) {
    try {
      const { playerId, email } = req.user.player;
      this.logger.verbose(`${email}님이 로그아웃 하려고 합니다`);
      // 엑세스 토큰을 삭제
      // DB에서 리프레쉬 삭제
      // 클라이언트에서는 localstorage에서 삭제따로 해줘야함
      console.log(playerId);
      const result = await this.authService.logout(playerId);
      req.res.setHeader('Set-Cookie', result);

      return { ok: true, row: result };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async google() {}

  @ApiOperation({ summary: '구글 로그인' })
  @UseGuards(GoogleAuthGuard)
  @Get('googleauth')
  async googleauth(@Request() req) {
    const { email, accessToken, refreshToken } = req.user;

    this.logger.verbose(`${email}님이 구글로 로그인 하려고 합니다`);

    // res.redirect('http://localhost:3005');
    // req.res.setHeader('access', accessToken);
    // req.res.setHeader('refresh', refreshToken);

    // req.res.redirect('http://localhost:3005');
    return { ok: true, row: { accessToken, refreshToken } };
  }

  /* 카카오 로그인 부분 */
  @ApiOperation({ summary: '카카오 로그인' })
  @UseGuards(KakaoAuthGuard)
  @Get('kakaoAuth')
  async kakaopage(@Request() req) {
    const { username, refreshToken, accessToken } = req.user;
    this.logger.verbose(`${username}님이 카카오로 로그인 하려고 합니다`);
    console.log(accessToken)
    console.log(refreshToken)

    console.log('hello');
    // await req.res.setHeader('access', accessToken);
    // await req.res.setHeader('refresh', refreshToken);
    // await req.res.redirect('http://localhost:3005');
    // return res.redirect('http://localhost:3005/');
    return { ok: true, row: { accessToken, refreshToken } };
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
