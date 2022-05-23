import { Controller, Get, Query } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/api/ranks')
@ApiTags('랭킹 조회 API')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  @ApiOperation({ summary: '우리 지역 랭킹 조회 API' })
  getAll(
    @Query('si') regionSi: string,
    @Query('gu') regionGu: string,
    @Query('dong') regionDong: string
  ) {
    return this.ranksService.getAll(regionSi, regionGu, regionDong);
  }
}
