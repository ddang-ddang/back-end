import { IsNotEmpty } from 'class-validator';
import { Column } from 'typeorm';

export class CreateFeedDto {
  @IsNotEmpty()
  img?: string[];

  @IsNotEmpty()
  content?: string;
}
