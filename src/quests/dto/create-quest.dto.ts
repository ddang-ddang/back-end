import { IsNotEmpty } from 'class-validator';

export class CreateQuestDto {
  content: string;
  comment: string;
}
