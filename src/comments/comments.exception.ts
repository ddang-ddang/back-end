import {
  BadRequestException,
  HttpStatus,
  ImATeapotException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CommentException {
  // 댓글 조회 실패
  NotFoundComment() {
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      ok: false,
      message: '삭제되었거나 존재하지 않는 댓글입니다.',
      error: 'Not Found',
    });
  }

  // 피드 조회 실패
  NotFoundFeed() {
    throw new NotFoundException({
      statusCode: HttpStatus.NOT_FOUND,
      ok: false,
      message: '삭제되었거나 존재하지 않는 피드입니다.',
      error: 'Not Found',
    });
  }

  // 댓글 사용자만 수정 가능
  CannotEditComment() {
    throw new BadRequestException({
      statusCode: HttpStatus.BAD_GATEWAY,
      ok: false,
      message: '댓글 작성자만 수정할 수 있습니다.',
      error: 'Bad Request',
    });
  }

  // 댓글 사용자만 삭제 가능
  CannotDeleteComment() {
    throw new BadRequestException({
      statusCode: HttpStatus.BAD_GATEWAY,
      ok: false,
      message: '댓글 작성자만 삭제할 수 있습니다.',
      error: 'Bad Request',
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
