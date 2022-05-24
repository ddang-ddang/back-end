import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

describe('feedsController E2E test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();
  });

  it('사용자 생성', async () => {
    const response = await request(app.getHttpServer())
      .post('api/players/signin')
      .send({ email: 'test@test.com', password: '123456' })
      .expect(200);

    expect(response.body.accessToken).not.toBeDefined();
  });

  // it('피드 조회', () => {
  //   return request(app.getHttpServer())
  //     .post('/api/feeds?type=distance')
  //     .send({
  //       regionSi: '서울시',
  //       regionGu: '강남구',
  //       regionDong: '삼성동',
  //       lat: 36.233233,
  //       lng: 127.342342,
  //     })
  //     .expect(200);
  // });
});
