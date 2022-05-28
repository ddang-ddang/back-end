import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { PrimaryGeneratedColumn, Repository } from 'typeorm';
import { Feed } from 'src/feeds/entities/feed.entity';
import { FeedsModule } from 'src/feeds/feeds.module';
import { FeedRepository } from 'src/feeds/feeds.repository';
import * as pactum from 'pactum';
import * as dotenv from 'dotenv';
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

  describe('Feed API', () => {
    const token = 'accesstoken';

    const feedId = 45;

    const feedList = {
      feedOne: {
        content: 'jest content one',
        img: ['image_one', 'image_two', 'image_three'],
      },
      feedTwo: {
        content: 'jest content two',
        img: ['image_four', 'image_five', 'image_six'],
      },
    };

    it('내가 작성한 피드 조회', async () => {
      await pactum
        .spec()
        .get('/api/feeds/myfeed')
        .withHeaders('Authorization', `Bearer ${process.env.TEST_ACCESSTOKEN}`)
        .expectStatus(200);
    });

    it('우리 동네 전체 피드 조회', async () => {
      await pactum
        .spec()
        .get('/api/feeds/myfeed')
        .withHeaders('Authorization', `Bearer ${process.env.TEST_ACCESSTOKEN}`)
        .expectStatus(200);
    });

    it('피드 수정 PASS', async () => {
      await pactum
        .spec()
        .patch(`/api/feeds/${feedId}`)
        .withHeaders('Authorization', `Bearer ${process.env.TEST_ACCESSTOKEN}`)
        .withBody(feedList.feedOne)
        .expectStatus(200);
    });

    it('피드 수정 FAIL', async () => {
      await pactum
        .spec()
        .patch(`/api/feeds/${feedId}`)
        .withHeaders('Authorization', `Bearer ${process.env.TEST_ACCESSTOKEN}`)
        .withBody({})
        .expectStatus(204);
    });
  });
});
