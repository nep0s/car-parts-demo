import { Injectable, NotFoundException } from '@nestjs/common';
import type { CarPartDto, CatalogResponseDto } from './dto/car-part.dto';
import { AutoPartsPlusService } from './sources/autoparts-plus.service';
import { RepuestosMaxService } from './sources/repuestos-max.service';
import { GlobalPartsService } from './sources/global-parts.service';

@Injectable()
export class PartsAggregatorService {
  constructor(
    private readonly autoPartsPlusService: AutoPartsPlusService,
    private readonly repuestosMaxService: RepuestosMaxService,
    private readonly globalPartsService: GlobalPartsService,
  ) {}

  async getDetail(source: string, sku: string): Promise<CarPartDto> {
    let part: CarPartDto | null = null;

    if (source === 'autopartsplus') {
      part = await this.autoPartsPlusService.fetchDetail(sku);
    } else if (source === 'repuestosmax') {
      part = await this.repuestosMaxService.fetchDetail(sku);
    } else if (source === 'globalparts') {
      part = await this.globalPartsService.fetchDetail(sku);
    }

    if (!part) {
      const storeMap: Record<string, CarPartDto[]> = {
        autopartsplus: this.autoPartsPlusService.getStore(),
        repuestosmax: this.repuestosMaxService.getStore(),
        globalparts: this.globalPartsService.getStore(),
      };
      part = storeMap[source]?.find((p) => p.sku === sku) ?? null;
    }

    if (!part) throw new NotFoundException(`Part not found: ${source}/${sku}`);
    return part;
  }

  getCatalog(page: number, limit: number): CatalogResponseDto {
    const appStore = this.autoPartsPlusService.getStore();
    const rmStore = this.repuestosMaxService.getStore();
    const gpStore = this.globalPartsService.getStore();

    const merged = [...appStore, ...rmStore, ...gpStore];
    const start = (page - 1) * limit;
    const parts = merged.slice(start, start + limit);

    return {
      parts,
      pagination: { page, limit, total: merged.length },
      sourcesSummary: {
        autopartsplus: {
          count: appStore.length,
          lastRefreshedAt: this.autoPartsPlusService.getLastRefreshedAt(),
        },
        repuestosmax: {
          count: rmStore.length,
          lastRefreshedAt: this.repuestosMaxService.getLastRefreshedAt(),
        },
        globalparts: {
          count: gpStore.length,
          lastRefreshedAt: this.globalPartsService.getLastRefreshedAt(),
        },
      },
    };
  }
}
