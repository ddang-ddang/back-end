import { IsNotEmpty } from 'class-validator';
import { Column } from 'typeorm';

export class CreateFeedDto {
  @IsNotEmpty()
  content?: string;

  @IsNotEmpty()
  img?: string[];
}
