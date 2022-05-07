import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const serverConfig = config.get('server');

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
