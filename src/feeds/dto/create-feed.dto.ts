import { IsOptional } from 'class-validator';

export class CreateFeedDto {
  @IsOptional()
  img?: string[];

  @IsOptional()
  content?: string;
}
