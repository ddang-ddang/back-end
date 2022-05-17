import { Test, TestingModule } from '@nestjs/testing';
import { Any } from 'typeorm';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('Comment controller', () => {
  let controller: CommentsController;

  const req =  createRequest();

  const mockCommentService = {
    createComment: jest.fn().mockImplementation((req, feedId, dto) => {
      return {
        ok: true,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService],
    })
      .overrideProvider(CommentsService)
      .useValue(mockCommentService)
      .compile();

    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a comment', () => {
    const dto = { comment: 'jest test' };

    expect(controller.createComment(req, 1, dto));

    // expect(mockCommentService.createComment).toHaveBeenCalled();
  });
});
