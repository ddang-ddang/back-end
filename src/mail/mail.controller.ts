import { Body, Controller, Patch, Post, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('/send')
  async sendEmail(@Query('email') email) {
    console.log(email);
    return await this.mailService.sendMail(email);
  }

  @Patch('/password/update')
  async updatePassword(@Body() password: string, @Query() email: string) {
    return await this.mailService.updatePassword(email, password);
  }
}
