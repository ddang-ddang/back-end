import { IsNotEmpty } from 'class-validator';

export class CreateFeedQuestDto {
  @IsNotEmpty()
  content: string;
}
