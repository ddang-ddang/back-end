import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { serverConfig } from '../configs';

import * as express from 'express';

async function bootstrap() {
  const logger = new Logger();

  const server = express();

  const app = await NestFactory.create(
    AppModule,

    new ExpressAdapter(server)
  );

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

  // 스웨거 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('니땅내땅 API')
    .setDescription('니땅내땅 관련 API 입니다.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: '니땅내땅 API',
  };
  SwaggerModule.setup('/', app, document, customOptions);

  const port = serverConfig.port || 3000;
  await app.listen(port);
  logger.log(`Application running on port:: ${port}`);
}
bootstrap();
