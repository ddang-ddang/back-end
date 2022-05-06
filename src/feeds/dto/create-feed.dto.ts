import { Column } from 'typeorm';

export class CreateFeedDto {
  @Column()
  image1?: string;

  @Column()
  image2?: string;

  @Column()
  image3?: string;

  @Column()
  content?: string;
}
