import { Body, Controller, Post } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('/api/ranks')
@ApiTags('랭킹 조회 API')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Post()
  @ApiOperation({ summary: '우리 지역 랭킹 조회 API' })
  getAll(@Body() body: any) {
    const { currentRegion } = body;
    return this.ranksService.getAll(currentRegion);
  }
}
