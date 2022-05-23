import { IsEmail, IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/swagger';

export class CreateBedgeDto {
  @IsNotEmpty()
  iron: string;

  @IsNotEmpty()
  bronze: string;

  @IsNotEmpty()
  silver: string;

  @IsNotEmpty()
  gold: string;

  @IsNotEmpty()
  platinum: string;

  @IsNotEmpty()
  diamond: string;
}

export class BedgeDto extends PickType(CreateBedgeDto, [] as const) {}
