import { IsNotEmpty } from 'class-validator';

export class CreateDongDto {
  date: string;
  regionSi: string;
  regionGu: string;
  regionDong: string;
}
