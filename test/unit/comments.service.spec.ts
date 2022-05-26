import { Test, TestingModule } from '@nestjs/testing';
import {
  Connection,
  getConnection,
  getConnectionManager,
  getConnectionOptions,
  QueryRunner,
  Repository,
} from 'typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import { CommentsService } from 'src/comments/comments.service';
import { Comment } from 'src/comments/entities/comment.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { CommentException } from 'src/comments/comments.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createConnection } from 'typeorm';

const mockCommentRepository = {
  findAllComments: jest.fn(),
  createComment: jest.fn().mockReturnValue({
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
  }),
  createQueryBuilder: jest.fn().mockReturnValue({
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
};

const mockCommentException = {};

const createComment = {
  findOne: jest.fn(),
};

const mockComment = {
  ok: jest.fn((x) => x),
  comment: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('commentService', () => {
  const createCommentDto: CreateCommentDto = {
    comment: 'jest test',
  };
  let feedId = 1;
  let playerId = 1;

  let commentsService: CommentsService;
  let commentsRepository: MockRepository<Comment>;

  const result: object[] = [{}];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: CommentRepository,
          useValue: mockCommentRepository,
        },
        {
          provide: CommentException,
          useValue: mockCommentException,
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
  });

  it('should be defined', () => {
    expect(commentsService).toBeDefined();
  });

  it('특정 게시글 댓글 전체 조회', async () => {
    const result = await commentsService.findAllComments(2);

    expect(result).toEqual(expect.any(Object));

    expect(
      mockCommentRepository.createQueryBuilder().getMany
    ).toHaveBeenCalled();

    expect(
      mockCommentRepository.createQueryBuilder().leftJoinAndSelect
    ).toBeCalledTimes(1);
  });

  it('댓글 생성', async () => {
    // mockCommentRepository.createComment.mockResolvedValue('save error');
    playerId = 10;
    feedId = 2;
    const createCommentDto: CreateCommentDto = {
      comment: 'spec test comment',
    };

    console.log('plpl', playerId);
    console.log('fdfd', feedId);
    console.log('aaaa', createCommentDto.comment);

    const mockComment = await commentsService.createComment(
      playerId,
      feedId,
      createCommentDto
    );
    expect(mockComment.player.id).toEqual(playerId);
    // expect(mockComment).toHaveBeenCalledWith(201);
  });
});
