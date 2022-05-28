import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { Repository } from 'typeorm';
import { CommentsModule } from 'src/comments/comments.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import * as pactum from 'pactum';
import * as dotenv from 'dotenv';
dotenv.config();

describe('commentsController E2E test', () => {
  let app: INestApplication;
  let repository: Repository<Comment>;
  const mockCommentsRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        CommentsModule,
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
      .overrideProvider(getRepositoryToken(CommentRepository))
      .useValue(mockCommentsRepository)
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
    repository = moduleFixture.get('CommentRepository');
    await app.init();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => app.close());

  describe('Comment API', () => {
    const token = 'accesstoken';

    const feedId = 44;
    const commentId = 1;

    const commentList = {
      commentOne: {
        comment: 'jest comment one',
      },
    };

    it('댓글 작성', async () => {
      await pactum
        .spec()
        .post(`/api/feeds/${feedId}/comments`)
        .withHeaders('Authorization', `Bearer ${process.env.TEST_ACCESSTOKEN}`)
        .withBody(commentList.commentOne)
        .expectStatus(201);
    });
  });
});
