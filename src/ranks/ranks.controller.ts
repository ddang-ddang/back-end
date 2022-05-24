import { Controller, Get, Query } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/api/ranks')
@ApiTags('랭킹 조회 API')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  @ApiOperation({
    summary: '우리 지역 랭킹 조회 API',
    description: '지역 데이터를 기반으로 개인별, 그룹별 랭킹을 조회합니다.',
  })
  @ApiNotFoundResponse({ description: '랭킹을 조회할 수 없음' })
  getAll(
    @Query('si') regionSi: string,
    @Query('gu') regionGu: string,
    @Query('dong') regionDong: string
  ) {
    return this.ranksService.getAll(regionSi, regionGu, regionDong);
  }
}
