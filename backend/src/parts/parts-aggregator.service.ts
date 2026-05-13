import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { CarPartDto, CatalogResponseDto } from './dto/car-part.dto';
import { AutoPartsPlusService } from './sources/autoparts-plus.service';
import { RepuestosMaxService } from './sources/repuestos-max.service';
import { GlobalPartsService } from './sources/global-parts.service';

@Injectable()
export class PartsAggregatorService {
  private readonly logger = new Logger(PartsAggregatorService.name);
  constructor(
    private readonly autoPartsPlusService: AutoPartsPlusService,
    private readonly repuestosMaxService: RepuestosMaxService,
    private readonly globalPartsService: GlobalPartsService,
  ) {}

  async getDetail(source: string, sku: string): Promise<CarPartDto> {
    type SourceService = AutoPartsPlusService | RepuestosMaxService | GlobalPartsService;
    const serviceMap: Record<string, SourceService | undefined> = {
      autopartsplus: this.autoPartsPlusService,
      repuestosmax: this.repuestosMaxService,
      globalparts: this.globalPartsService,
    };

    const sourceService = serviceMap[source];
    let part: CarPartDto | null = null;

    if (sourceService) {
      part = await sourceService.fetchDetail(sku);

      if (part) {
        const stored = sourceService.getStore().find((p) => p.sku === sku);
        if (
          stored &&
          (stored.price.amount !== part.price.amount || stored.stock !== part.stock)
        ) {
          await sourceService.refreshCatalog();
        }
      }
    }

    if (!part) {
      part = sourceService?.getStore().find((p) => p.sku === sku) ?? null;
    }

    if (!part) throw new NotFoundException(`Part not found: ${source}/${sku}`);
    this.logger.log(`detail ${source}/${sku} — price: ${part.price.amount} ${part.price.currency}, stock: ${part.stock}`);
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
