import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 루트 GET 요청에 대한 응답
  @Get()
  getHello(): string {
    return '니땅내땅 API 오신걸 환영합니다.';
  }
}
