import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class MailException {
  notFoundEmail() {
    throw new NotFoundException({
      ok: false,
      message: '존재하지 않는 이메일입니다.',
    });
  }
}
