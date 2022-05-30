import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PlayerRepository } from 'src/players/players.repository';
import { MailException } from './mail.exception';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectRepository(PlayerRepository)
    private playerRepository: PlayerRepository,
    private mailException: MailException
  ) {}

  async sendMail(email: string) {
    try {
      const emailMatch = this.playerRepository.findOne({ email });
      if (!emailMatch) {
        this.mailException.notFoundEmail();
      }
      let Num = '';
      for (let i = 0; i < 6; i++) {
        Num += Math.floor(Math.random() * 10);
      }
      await this.mailerService.sendMail({
        to: email, // list of receivers
        from: process.env.NODEMAILER_FROM, // sender address
        subject: '이메일 인증 요청 메일입니다.', // Subject line
        html: '6자리 인증 코드 : ' + `<b> ${Num}</b>`, // HTML body content
      });
      return Num;
    } catch (err) {
      console.log(err);
    }
  }

  async updatePassword(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    this.playerRepository.updatePassword(email, hashedPassword);
  }
}
