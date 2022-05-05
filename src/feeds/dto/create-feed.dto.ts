import { Column } from 'typeorm';

export class CreateFeedDto {
  @Column()
  image?: string;

  @Column()
  content?: string;
}
