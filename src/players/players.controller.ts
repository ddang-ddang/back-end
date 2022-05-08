import { ApiCreatedResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { GoogleAuthGuard } from 'src/auth/google/google-auth.guard';
import { Player } from './entities/player.entity';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Request,
  Header,
} from '@nestjs/common';
import {
  CreateBodyDto,
  CreateIdDto,
  CreatePlayerDto,
} from './dto/create-player.dto';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';
import { KakaoAuthGuard } from 'src/auth/kakao/kakao-auth.guard';

@Controller('players')
export class PlayersController {
  constructor(
    private playersService: PlayersService,
    private authService: AuthService
  ) {}

  @Post('test')
  test(@Body() { email }: Player): any {
    console.log('email' + email);
    console.log(email);
    return { email: email };
  }

  // signup
  @ApiCreatedResponse({ type: CreateBodyDto })
  @Post('signup')
  async signUp(
    @Body() { email, nickname, password, mbti, profileImg }: CreatePlayerDto
  ): Promise<any> {
    await this.playersService.signup({
      email,
      nickname,
      password,
      mbti,
      profileImg,
    });
    return { ok: true };
  }

  // signin
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Body() { email, password }: CreateIdDto) {
    await this.authService.login(email, password);
    return { ok: true };
  }

  // signout
  @Get('signout')
  signOut() {
    return { hello: 'world' };
  }

  //원하는 곳에 JwtAuthGuard 붙이면 됨
  @Header('Access-Control-Allow-Origin', '*')
  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async getHello(@Request() req): Promise<any> {
    return req.user;
  }

  @Header('Access-Control-Allow-Origin', '*')
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
