import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule, { cors: true });
  const serverConfig = config.get('server');
  const developmentConfig = config.get('jwt');

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  // app.use(
  //   session({
  //     secret: developmentConfig.accessSecret, //get env vars
  //     resave: false,
  //     saveUninitialized: true,
  //     cookie: { maxAge: 3600000 },
  //   })
  // );

  // app.use(passport.initialize());
  // app.use(passport.session());

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
