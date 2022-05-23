import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class RanksException {
  notFound() {
    throw new NotFoundException({
      ok: false,
      message: '현재 위치를 찾을 수 없습니다.',
    });
  }

  serverError() {
    throw new InternalServerErrorException({
      ok: false,
      message: '랭킹을 조회할 수 없습니다.',
    });
  }
}
