import { Comment } from 'src/comments/entities/comment.entity';
import { Feed } from 'src/feeds/entities/feed.entity';

export const commentStub = (): Comment => {
  return {
    id: 1,
    comment: 'jest comment',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    feed: {
      id: 1,
      image1_url: 'img1',
      image2_url: 'img2',
      image3_url: 'img3',
      content: 'test content',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    },
    player: {},
  };
};
