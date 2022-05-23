import { IsOptional, Length } from 'class-validator';

export class CreateFeedDto {
  @IsOptional()
  img?: string[];

  @IsOptional()
  @Length(0, 255)
  content?: string;
}
