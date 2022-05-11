import { IsNotEmpty } from 'class-validator';

export class CreateRegionDto {
  regionSi: string;
  regionGu: string;
  regionDong: string;
}
