import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Region } from '../entities/region.entity';

export class CreateQuestDto {
  @IsNotEmpty()
  region: Region;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  type: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  difficulty: number;

  @IsNumber()
  reward: number;

  @IsOptional()
  @IsDate()
  timeUntil: Date;
}
