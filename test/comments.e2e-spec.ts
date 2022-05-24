import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('commentsController E2E test', () => {
  let app: INestApplication;

  const playerId = 10;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('should create a new comment', () => {
    return request(app.getHttpServer())
      .post('/api/feeds/2/comments')
      .send({
        comment: 'e2e test comment',
      })
      .expect(201);
  });
});
