import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { PrimaryGeneratedColumn, Repository } from 'typeorm';
import { Feed } from 'src/feeds/entities/feed.entity';
import { FeedsModule } from 'src/feeds/feeds.module';
import * as dotenv from 'dotenv';
import { FeedRepository } from 'src/feeds/feeds.repository';
import * as pactum from 'pactum';
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
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => app.close());

  describe('피드', () => {
    it('내가 작성한 피드 조회', async () => {
      const token = 'accessToken';

      await pactum
        .spec()
        .get('/api/feeds/myfeed')
        .withHeaders('Authorization', `Bearer ${token}`)
        .expectStatus(200);
    });

    it('우리 동네 전체 피드 조회', async () => {
      const token = 'fakeToken';

      await pactum
        .spec()
        .get('/api/feeds/myfeed')
        .withHeaders('Authorization', `Bearer ${token}`)
        .expectStatus(200);
    });
  });
});
