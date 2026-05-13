import { Controller, Get, Param, Query } from '@nestjs/common';
import { PartsAggregatorService } from './parts-aggregator.service';
import type { CarPartDto, CatalogResponseDto } from './dto/car-part.dto';

@Controller('parts')
export class PartsController {
  constructor(private readonly partsAggregatorService: PartsAggregatorService) {}

  @Get('catalog')
  getCatalog(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('manufacturer') manufacturer?: string,
    @Query('model') model?: string,
    @Query('year') year?: string,
  ): CatalogResponseDto {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    return this.partsAggregatorService.getCatalog(
      Math.max(1, parseInt(page, 10) || 1),
      Math.min(100, Math.max(1, parseInt(limit, 10) || 10)),
      search || undefined,
      manufacturer || undefined,
      model || undefined,
      parsedYear && !isNaN(parsedYear) ? parsedYear : undefined,
    );
  }

  @Get(':source/:sku')
  getDetail(
    @Param('source') source: string,
    @Param('sku') sku: string,
  ): Promise<CarPartDto> {
    return this.partsAggregatorService.getDetail(source, sku);
  }
}
