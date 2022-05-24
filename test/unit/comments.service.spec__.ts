import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Repository } from 'typeorm';
import { CommentRepository } from 'src/comments/comments.repository';
import { CommentsService } from 'src/comments/comments.service';
import { Comment } from 'src/comments/entities/comment.entity';
import { CreateCommentDto } from 'src/comments/dto/create-comment.dto';
import { CommentException } from 'src/comments/comments.exception';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('commentService', () => {
  let service: CommentsService;
  let commentsRepository: Repository<Comment>;

  const COMMENT_REPOSITORY_TOKEN = getRepositoryToken(Comment);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: COMMENT_REPOSITORY_TOKEN,
          useValue: {
            findAllComments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentsRepository = module.get<Repository<Comment>>(
      COMMENT_REPOSITORY_TOKEN
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // it('특정 게시글 댓글 전체 조회', async () => {
  //   const result = await commentsService.findAllComments(2);

  //   expect(result).toEqual(expect.any(Object));
  // });
});
