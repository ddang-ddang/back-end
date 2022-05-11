import { IsNotEmpty, IsOptional } from 'class-validator';
import { Region } from '../entities/region.entity';

export class CreateQuestDto {
  @IsNotEmpty()
  region: Region;

  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;

  @IsNotEmpty()
  type: number;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  difficulty: number;

  @IsNotEmpty()
  reward: number;

  @IsOptional()
  timeUntil: Date;
}
