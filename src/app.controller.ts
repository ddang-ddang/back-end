// import { AuthService } from './auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './auth/local/local-auth.guard';
import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService // private AuthService: AuthService
  ) {}

  @Get()
  getHello(): string {
    return '니땅내땅 API 오신걸 환영합니다.';
  }

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  async login(@Request() req) {
    return req.user;
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login2')
  async login2(@Request() req) {
    return req.user;
  }
}
