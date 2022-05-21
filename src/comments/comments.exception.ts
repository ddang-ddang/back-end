import {
  HttpStatus,
  ImATeapotException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CommentException {
  // 사용자 조회 실패
  NotFoundComment() {
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      ok: false,
      message: '삭제되었거나 존재하지 않는 댓글입니다.',
      error: 'Not Found',
    });
  }

  // DB 트랜젝션 오류
  Transaction() {
    throw new InternalServerErrorException({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      ok: false,
      message: '처리 중에 예기치 않은 오류가 발생하였습니다.',
      error: 'Internal Server Error',
    });
  }
}
