import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { MailController } from './mail.controller';
import * as dotenv from 'dotenv';
import { PlayerRepository } from 'src/players/players.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailException } from './mail.exception';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerRepository]),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: process.env.NODEMAILER_HOST,
          secure: false,
          auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
          },
        },
        defaults: {
          from: `"No Reply" <${process.env.NODEMAILER_FROM}>`,
        },
        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService, MailException],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
