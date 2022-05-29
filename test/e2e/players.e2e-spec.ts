import { Test, TestingModule } from '@nestjs/testing';
import { Header, INestApplication, ValidationPipe } from '@nestjs/common';
import { PlayersModule } from 'src/players/players.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Player } from 'src/players/entities/player.entity';
import { Repository } from 'typeorm';
import * as dotenv from 'dotenv';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as pactum from 'pactum';
dotenv.config();

const userList = {
  newUser: {
    email: 'test2@test.com',
    nickname: 'testnick',
    password: 'Abcd1234',
    mbti: 'esfj',
    profileImg: 'image',
  },

  userOne: {
    email: 'test@test.com',
    password: 'Abcd1234',
  },

  userTwo: {
    email: 'aaaaa',
    password: 'bbbbb',
  },
};

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

  describe('회원가입', () => {
    it('POST 회원가입 성공', async () => {
      await pactum
        .spec()
        .post('/api/players/signup')
        .withBody(userList.newUser)
        .expectStatus(201);
    });
  });

  describe('로그인', () => {
    it('POST 로그인 성공', async () => {
      await pactum
        .spec()
        .post('/api/players/signin')
        .withBody(userList.userOne)
        .expectStatus(201);
    });

    it('POST 로그인 실패', async () => {
      await pactum
        .spec()
        .post('/api/players/signin')
        .withBody(userList.userTwo)
        .expectStatus(401);
    });
  });
});
