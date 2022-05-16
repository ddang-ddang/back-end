import { IsNumber, IsString } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  regionSi: string;

  @IsString()
  regionGu: string;

  @IsString()
  regionDong: string;

  @IsNumber()
  totalCount: number;

  @IsNumber()
  pageCount: number;
}
