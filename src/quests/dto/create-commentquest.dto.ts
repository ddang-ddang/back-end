import { IsNotEmpty } from 'class-validator';

export class CreateCommentQuestDto {
  @IsNotEmpty()
  comment: string;
}
