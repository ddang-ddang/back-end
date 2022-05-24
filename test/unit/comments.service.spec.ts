import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from 'src/auth/jwt/jwt.strategy';
import {
  Connection,
  createConnections,
  createQueryBuilder,
  getConnection,
  Repository,
} from 'typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import { CommentsService } from 'src/comments/comments.service';
import { Comment } from 'src/comments/entities/comment.entity';
import { plainToClass } from 'class-transformer';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';

const mockCommentRepository = {
  findAllComments: jest.fn(),
  createComment: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
};

// const mockRepository = () => {

// };

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('commentService', () => {
  const createCommentDto: CreateCommentDto = {
    comment: 'jest test',
  };
  const feedId = 1;
  const playerId = 1;

  let commentsService: CommentsService;
  let commentsRepository: MockRepository<Comment>;

  const result: object[] = [{}];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: CommentRepository,
          // provide: getRepositoryToken(Comment), // module import 하라고 나옴
          useValue: mockCommentRepository,
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    // commentsRepository = module.get<MockRepository<Comment>>(
    //   getRepositoryToken(Comment)
    // );
  });

  it('should be defined', () => {
    expect(commentsService).toBeDefined();
  });

  it('should be find All', async () => {
    const result = await commentsService.findAllComments(2);

    expect(result).toEqual(expect.any(Object));

    expect(
      mockCommentRepository.createQueryBuilder().getMany
    ).toHaveBeenCalled();

    expect(
      mockCommentRepository.createQueryBuilder().leftJoinAndSelect
    ).toBeCalledTimes(1);
  });

  it('cteate comment', async () => {
    // mockCommentRepository.createComment.mockResolvedValue('save error');

    const comment = await commentsService.createComment(
      playerId,
      feedId,
      createCommentDto
    );

    expect(comment).toEqual('save error');
  });
});
