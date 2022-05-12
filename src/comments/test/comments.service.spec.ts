import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentsService } from '../comments.service';

const mockCommentRepository = () => {
  createComment: jest.fn();
  updateComment: jest.fn();
  deleteComment: jest.fn();
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CommentsService', () => {
  let commentservice: CommentsService;
  let commentRepository: MockRepository<Comment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository(),
        },
      ],
    }).compile();

    commentservice = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<MockRepository<Comment>>(
      getRepositoryToken(Comment)
    );
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  // it('createComment', async () => {});
  it('shoud be 4', () => {
    expect(2 + 2).toEqual(4);
  });
});
