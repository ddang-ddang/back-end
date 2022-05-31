import { JwtRefreshTokenGuard } from './../auth/jwt/jwt-refresh-token.guard';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
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
  BadRequestException,
  UnauthorizedException,
  HttpCode,
  Res,
  Param,
} from '@nestjs/common';

// 서비스 관련 모듈
import { AuthService } from 'src/auth/auth.service';
import { PlayersService } from './players.service';
import nodemailer from 'nodemailer';

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
    private readonly authService: AuthService,
    private readonly configService: ConfigService
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

    try {
      this.logger.verbose(`회원을 가입하려고 합니다.: ${email}`);
      const result = await this.playersService.signup({
        email,
        nickname,
        password,
        mbti,
        profileImg,
        provider: 'local',
        providerId: null,
        currentHashedRefreshToken: null,
      });
      return { ok: true, result };
    } catch (err) {
      return { ok: false, row: err.message };
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
    console.log(nickname);

    this.logger.verbose(`닉네임을 중복확인을 하려 합니다`);

    const result = await this.playersService.findByNickname({ nickname });
    console.log(result);

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
      return { ok: true, row: { email } };
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
  async signIn(@Request() req) {
    try {
      const { id, email, nickname } = req.user;

      this.logger.verbose(`${email}님이 로그인하려고 합니다`);

      const response = await this.authService.additionalInfo(email);

      const { mbti, profileImg, expPoints, points, level } = response;

      const tokens = await this.authService.signin(email, nickname, id);

      const { accessToken, refreshToken } = tokens;

      req.res.setHeader('accessToken', accessToken);
      req.res.setHeader('refreshToken', refreshToken);

      return {
        ok: true,
        row: {
          playerId: id,
          email,
          nickname,
          mbti,
          profileImg,
          expPoints,
          points,
          level,
        },
      };
    } catch (err) {
      throw new UnauthorizedException('refreshToken is invalid');
    }
  }

  // 엑세스 토큰 발급해주는 라우터
  @ApiOperation({ summary: 'jwt인증 API' })
  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async getHello(@Request() req): Promise<object> {
    try {
      const { playerId, email, nickname } = req.user.player;

      const response = await this.authService.additionalInfo(email);

      const { mbti, profileImg, expPoints, points, level } = response;

      this.logger.verbose(`${email}님이 인증 하려고 합니다`);

      return {
        ok: true,
        user: {
          playerId,
          email,
          nickname,
          mbti,
          profileImg,
          expPoints,
          points,
          level,
        },
      };
    } catch (err) {
      return {
        ok: false,
        message: err.message,
      };
    }
  }
  // 엑세스 토큰 발급해주는 라우터
  @UseGuards(JwtRefreshTokenGuard)
  @Get('auth/getToken')
  async test(@Request() req) {
    try {
      const { id, email, nickname } = req.user;

      this.logger.verbose(
        `${email}님이 새로운 엑세스 토큰을 발급하려고 합니다`
      );

      const accessToken = this.authService.getJwtAccessToken({
        id,
        email,
        nickname,
      });

      // 쿠키를 보내준다 주입한다.
      req.res.setHeader('accesstoken', accessToken);

      return { ok: true, profile: { id, email, nickname } };
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
      // console.log(playerId);
      // const result = await this.authService.logout(playerId);
      // req.res.setHeader('Set-Cookie', result);
      // console.log(result);

      return { ok: true, row: null };
    } catch (err) {
      return { ok: false, message: err.message };
    }
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async google() {
    console.log('hello');
  }

  @ApiOperation({ summary: '구글 로그인' })
  @UseGuards(GoogleAuthGuard)
  @Get('googleauth')
  async googleauth(@Request() req) {
    const { id, nickname, email } = req.user;

    this.logger.verbose(`${email}님이 카카오로 로그인하려고 합니다`);

    const tokens = await this.authService.signin(email, nickname, id);

    const { accessToken, refreshToken } = tokens;

    req.res.setHeader('accessToken', accessToken);
    req.res.setHeader('refreshToken', refreshToken);

    // return req.res.redirect('http://localhost:3005');
    return req.res.redirect(
      `http://localhost:3000/googleauth?code=${refreshToken}`
    );
  }

  //카카오 로그인 시작 1.단계
  @UseGuards(KakaoAuthGuard)
  @Get('kakao')
  async kakao() {
    this.logger.verbose('카카오로 로그인하려고 합니다');
    return 'hello';
  }

  /* 카카오 로그인 부분 */
  // 카카오 전략에 의해서 들어온 페이로더가 이쪽 req.user로 들어온다.
  @ApiOperation({ summary: '카카오 로그인' })
  @UseGuards(KakaoAuthGuard)
  @Get('kakaoauth')
  async kakaopage(@Request() req) {
    //정리된 개인정보를 구조분해 할당해준다.
    const { id, username, email, profileImg } = req.user;

    console.log(id, username, email, profileImg);

    this.logger.verbose('카카오 로그인 시작');

    //새로운 토큰을 발급 및 서버에 저장
    // 저장은 Beaerer 에다가 토큰을 붙이고 DB currentRefreshToken에 저장한다.
    const tokens = this.authService.updateToken(id, email, username);
    // 생성된 refresh토큰을 저장한다.
    const refreshToken = (await tokens).refreshToken;
    console.log(refreshToken);

    //페이로드에 저장
    const player = {
      id,
      username,
      email,
      profileImg,
      access_token: (await tokens).accessToken,
      refreshToken: refreshToken,
    };

    //가입여부 확인
    const isJoin = await this.playersService.findByEmail({
      email,
    });

    //가입 되어있으면 가입진행
    if (!isJoin) {
      console.log('가입해야합니다.');
      this.logger.verbose(
        `${player.email}님이 카카오로 회원가입을 진행합니다.`
      );

      //가입
      //DB에 개인정보 가입
      const joinGame = await this.playersService.signup({
        email: player.email,
        password: id + username,
        nickname: username,
        mbti: 'mbti',
        profileImg,
        provider: 'kakao',
        providerId: id,
        currentHashedRefreshToken: await bcrypt.hash(refreshToken, 10),
      });

      this.logger.verbose(`kakao strategy 가입완료 ${joinGame}`);
    }

    // 파라미터로 받은 페이로드에 보낸다.
    //이후 클라이언트에서는 refreshtoken을 받아서 auth/getToken을 통해 accessToken을 받아서 사용한다.
    // 이후는 jwt-refresh-strategy로 간다.
    // https://ddangddanaag.site/kakaoauth?code=${refreshToken}
    return req.res.redirect(
      `${process.env.KAKAO_REDIRECT_URI_LOCAL}/kakaoauth?code=${refreshToken}`
    );
  }

  // mypage
  @UseGuards(JwtAuthGuard)
  @Get('mypage')
  async loadMypage(@Request() req): Promise<object> {
    try {
      const { playerId } = req['user'].player;

      const data = await this.authService.checkIdByProviderId(playerId);

      this.logger.verbose(
        `유저 id ${playerId}님이 마이페이지를 이용 하려고 합니다`
      );

      const myInfo = await this.playersService.mypageInfo(data.id);

      return {
        ok: true,
        rows: myInfo,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
