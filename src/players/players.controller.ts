import { LocalAuthGuard } from './../auth/local/local-auth.guard';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { PlayersService } from './players.service';
import { CreateBodyDto } from './dto/create-player.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';

@Controller('players')
export class PlayersController {
  constructor(
    private playersService: PlayersService,
    private authService: AuthService
  ) {}
  // signup
  @ApiCreatedResponse({ type: CreateBodyDto })
  @Post('signup')
  signUp(
    @Body() { email, password, nickname, mbti, profileImg }: CreateBodyDto
  ): Promise<CreateBodyDto> {
    console.log(email, password, nickname, mbti, profileImg);
    return this.playersService.createPlayer(
      email,
      password,
      nickname,
      mbti,
      profileImg
    );
  }

  // signin
  // @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signIn(@Body() { email, password }) {
    console.log(email, password);
    return this.authService.login(email, password);
  }

  // signout
  @Get('signout')
  signOut() {
    return { hello: 'world' };
  }

  // auth
  // @Get('auth')
  // async authPlayer(@Request() req) {
  //   return this.authService.login(req);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  async getHello(@Request() req): Promise<any> {
    console.log(req.user);
    return req.players.email;
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
