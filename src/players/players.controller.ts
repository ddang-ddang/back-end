import { ApiCreatedResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { PlayersService } from './players.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { Player } from './entities/player.entity';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  CreateBodyDto,
  CreateIdDto,
  CreatePlayerDto,
} from './dto/create-player.dto';
import { LocalAuthGuard } from 'src/auth/local/local-auth.guard';

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
    return this.authService.login(email, password);
  }

  // signout
  @Get('signout')
  signOut() {
    return { hello: 'world' };
  }

  //원하는 곳에 JwtAuthGuard 붙이면 됨
  @UseGuards(JwtAuthGuard)
  @Get('auth')
  async getHello(@Request() req): Promise<any> {
    return req.user;
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
