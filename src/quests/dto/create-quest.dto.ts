import { IsNotEmpty } from 'class-validator';
import { Dong } from '../entities/dong.entity';

export class CreateQuestDto {
  lat: number;
  lng: number;
  type: number;
  dong: Dong;
}
