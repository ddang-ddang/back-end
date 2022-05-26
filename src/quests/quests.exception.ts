import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class QuestsException {
  notFoundQuest() {
    throw new NotFoundException({
      ok: false,
      message: '요청하신 퀘스트를 찾을 수 없습니다.',
    });
  }

  missingContent() {
    throw new BadRequestException({
      ok: false,
      message: '피드의 내용이 누락되었습니다.',
    });
  }

  notFoundKakaoAddress() {
    throw new NotFoundException({
      ok: false,
      message: '카카오 주소를 찾을 수 없습니다.',
    });
  }

  notFoundPublicAddress() {
    throw new NotFoundException({
      ok: false,
      message: '공공 API 주소를 찾을 수 없습니다.',
    });
  }

  alreadyCompleted() {
    throw new ConflictException({
      ok: false,
      message: '퀘스트를 이미 완료하였습니다.',
    });
  }

  cantCompleteQuest() {
    throw new InternalServerErrorException({
      ok: false,
      message: '퀘스트를 완료할 수 없습니다.',
    });
  }
}
