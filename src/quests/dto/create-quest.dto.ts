import { IsNotEmpty } from 'class-validator';
import { Region } from '../entities/region.entity';

export class CreateQuestDto {
  lat: number;
  lng: number;
  type: number;
  region: Region;
}
