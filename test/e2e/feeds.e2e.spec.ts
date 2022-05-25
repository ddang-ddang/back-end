import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { Repository } from 'typeorm';
import { Feed } from 'src/feeds/entities/feed.entity';
import { FeedsModule } from 'src/feeds/feeds.module';
import * as dotenv from 'dotenv';
import { FeedRepository } from 'src/feeds/feeds.repository';
dotenv.config();

describe('FeedsController E2E test', () => {
  let app: INestApplication;
  let repository: Repository<Feed>;
  const mockFeedsRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        FeedsModule,
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST,
          password: process.env.DB_PASSWORD,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          database: process.env.DB_DATABASE,
          entities: ['./**/*.entity.ts'],
          synchronize: false,
        }),
      ],
    })
      .overrideProvider(getRepositoryToken(FeedRepository))
      .useValue(mockFeedsRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    // app.setGlobalPrefix('api');
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      exposedHeaders: ['Authorization', 'refreshToken', 'accessToken'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    repository = moduleFixture.get('FeedRepository');
    await app.init();
  });

  it('피드 조회', () => {
    return request
      .agent(app.getHttpServer())
      .post('/api/feeds?type=distance')
      .send({
        regionSi: '서울시',
        regionGu: '강남구',
        regionDong: '삼성동',
        lat: 36.233233,
        lng: 127.342342,
      })
      .expect(200);
  });
});
