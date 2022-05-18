import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as http from 'http';
import * as https from 'https';
import * as express from 'express';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const logger = new Logger();

  // const privateKey = fs.readFileSync(
  //   'D:\\localhost.ssh\\ajanuw.local.key',
  //   'utf8'
  // );
  // const certificate = fs.readFileSync(
  //   'D:\\localhost.ssh\\ajanuw.local.crt',
  //   'utf8'
  // );
  // const httpsOptions = { key: privateKey, cert: certificate };

  const server = express();

  // http.createServer(server).listen(3000);
  // https.createServer(httpsOptions, server).listen(443);
  const app = await NestFactory.create(
    AppModule,

    new ExpressAdapter(server)
  );
  const serverConfig = config.get('server');
  const developmentConfig = config.get('jwt');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  app.use(
    session({
      secret: developmentConfig.accessSecret, //get env vars
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 3600000 },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  //스웨거 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('너땅내땅 API Swagger')
    .setDescription('너땅내땅 관련 API 입니다.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('/', app, document);

  const port = serverConfig.port;
  await app.listen(port);
  logger.log(`Application running on port:: ${port}`);
}
bootstrap();
