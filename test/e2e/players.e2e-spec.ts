import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PlayersModule } from 'src/players/players.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRepository } from 'src/players/players.repository';
import { Player } from 'src/players/entities/player.entity';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as pactum from 'pactum';
dotenv.config();

describe('Player E2E test', () => {
  let app: INestApplication;
  let repository: Repository<Player>;
  // const mockPlayersRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PlayersModule,
        PassportModule.register({ defaultStrategy: 'local' }),
        JwtModule.register({
          secret: process.env.JWT_ACCESS_TOKEN_SECRET,
          signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXP },
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST,
          password: process.env.DB_PASSWORD,
          port: parseInt(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          database: process.env.DB_DATABASE,
          // entities: ['../../dist/src/**/entities/*.entity.ts'],
          entities: ['./**/*.entity.ts'],
          synchronize: false,
        }),
      ],
    })
      // .overrideProvider(getRepositoryToken(PlayerRepository))
      // .useValue(mockPlayersRepository)
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
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  afterAll(() => app.close());

  // describe('로그인', () => {
  //   const dto = { email: 'test@test.com', password: '123456' };
  //   it('POST 로그인', async () => {
  //     const response = await request
  //       .agent(app.getHttpServer())
  //       .post('/api/players/signin')
  //       .set('Accept', 'application/json')
  //       .send(dto)
  //       .expect('Content-Type', /json/)
  //       .expect(201);
  //     console.log(response.body);
  //     expect(response.body.accessToken).toBeDefined();
  //   });
  // });

  describe('로그인', () => {
    it('POST 로그인', async () => {
      const response = await pactum
        .spec()
        .post('/api/players/signin')
        .withBody({ email: 'test@test.com', password: '123456' })
        .expectStatus(201);

      // console.log(response['req']);
    });
  });
});
