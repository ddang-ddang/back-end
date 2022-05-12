import { CommentsController } from "./comments.controller";
import { Comment } from "./entities/comment.entity";

describe('Comment controller', () => {
  Comment.create = jest.fn();

  it('should have a create method', () => {
    expect(typeof Comment.create).toBe('function');
  })

  // it('should call medel create method when it invoked', () => {
  //   CommentsController.createComment();
  //   expect()
  // });
})