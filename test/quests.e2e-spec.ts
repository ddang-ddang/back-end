import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

describe('QuestModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  describe('findAll', () => {
    it('should find all quests', () => {
      return request(app.getHttpServer())
        .get('api/quests?lat=37.263631&lng=127.006817')
        .expect(200)
        .expect((res) => {
          expect(res.body.ok).toBe(true);
        });
    });
  });

  it.todo('getAll');
  it.todo('getOne');
  it.todo('questComplete');
});
