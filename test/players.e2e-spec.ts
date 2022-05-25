import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PlayersModule } from 'src/players/players.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { Player } from 'src/players/entities/player.entity';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

describe('FeedsController E2E test', () => {
  let app: INestApplication;
  let repository: Repository<Player>;
  const mockPlayersRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PlayersModule,
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
      .overrideProvider(getRepositoryToken(PlayerRepository))
      .useValue(mockPlayersRepository)
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
    repository = moduleFixture.get('PlayerRepository');
    await app.init();
  });

  it('POST 로그인', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/players/signin')
      .set('Accept', 'application/json')
      .send({ email: 'test@test.com', password: '123456' })
      .expect('Content-Type', /json/)
      .expect(201);

    console.log(response.body);
    // expect(response.body.accessToken).toBeDefined();
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

  // describe('Authentication', () => {
  //   const URL = '/api/players/signin';
  //   it('should login', () => {
  //     return request(app.getHttpServer())
  //       .post(URL)
  //       .send({
  //         email: 'test@test.com',
  //         password: '123456',
  //       })
  //       .expect(201);
  //   });
  // });
});
