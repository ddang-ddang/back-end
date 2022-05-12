import { IsString } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  regionSi: string;

  @IsString()
  regionGu: string;

  @IsString()
  regionDong: string;
}
