import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CarPartDto, VehicleCompatibility } from '../dto/car-part.dto';
import { withRetry } from '../utils/retry';

// Vehicle compatibility is encoded as a free-text string, e.g. "Honda Civic 2015-2020 1.5L Turbo".
// parseVehicle extracts the structured fields via regex; entries without a YYYY-YYYY range are dropped.
interface RawPart {
  part_id: string;
  sku: string;
  oem_code: string;
  title: string;
  desc: string;
  brand_name: string;
  category_name: string;
  unit_price: number;
  currency_code: string;
  qty_available: number;
  warehouse_location: string;
  weight_value: number;
  weight_unit: string;
  img_urls: string[];
  fits_vehicles: string[];
  // Parallel arrays: spec_keys[i] is the label for spec_values[i]
  spec_keys: string[];
  spec_values: string[];
}

@Injectable()
export class AutoPartsPlusService implements OnModuleInit {
  private readonly logger = new Logger(AutoPartsPlusService.name);
  private store: CarPartDto[] = [];
  private lastRefreshedAt: Date | null = null;

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await this.refreshCatalog();
  }

  @Cron(process.env.PARTS_REFRESH_CRON || '0 */15 * * * *')
  async refreshCatalog() {
    try {
      const baseUrl = process.env.AUTOPARTSPLUS_BASE_URL;
      const allParts: CarPartDto[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const { data } = await withRetry(() =>
          firstValueFrom(
            this.httpService.get(`${baseUrl}/catalog`, {
              params: { page, limit: 100 },
            }),
          ),
        );
        allParts.push(...data.parts.map(AutoPartsPlusService.mapPart));
        hasNext = data.pagination.has_next;
        page++;
      }

      this.store = allParts;
      this.lastRefreshedAt = new Date();
    } catch (err) {
      this.logger.warn(`AutoPartsPlus catalog refresh failed: ${(err as Error).message}`);
    }
  }

  async fetchDetail(sku: string): Promise<CarPartDto | null> {
    const { data } = await withRetry(() =>
      firstValueFrom(
        this.httpService.get(`${process.env.AUTOPARTSPLUS_BASE_URL}/parts`, {
          params: { sku },
        }),
      ),
    );
    const raw = data.parts?.[0];
    return raw ? AutoPartsPlusService.mapPart(raw) : null;
  }

  getStore(): CarPartDto[] {
    return this.store;
  }

  getLastRefreshedAt(): Date | null {
    return this.lastRefreshedAt;
  }

  private static parseVehicle(v: string): VehicleCompatibility | null {
    const yearMatch = v.match(/(\d{4})-(\d{4})/);
    if (!yearMatch) return null;
    const beforeYear = v.slice(0, v.indexOf(yearMatch[0])).trim();
    const afterYear = v.slice(v.indexOf(yearMatch[0]) + yearMatch[0].length).trim();
    const tokens = beforeYear.split(/\s+/);
    if (tokens.length < 2) return null;
    return {
      manufacturer: tokens[0],
      model: tokens.slice(1).join(' '),
      yearStart: parseInt(yearMatch[1]),
      yearEnd: parseInt(yearMatch[2]),
      engine: afterYear || undefined,
    };
  }

  static mapPart(raw: RawPart): CarPartDto {
    const specs: Array<{ key: string; value: string }> = (
      raw.spec_keys as string[]
    ).map((key: string, i: number) => ({ key, value: raw.spec_values[i] }));

    return {
      id: raw.part_id,
      source: 'autopartsplus',
      sku: raw.sku,
      oemCode: raw.oem_code,
      title: raw.title,
      description: raw.desc,
      brand: raw.brand_name,
      category: raw.category_name,
      price: { amount: raw.unit_price, currency: raw.currency_code },
      stock: raw.qty_available,
      warehouse: raw.warehouse_location,
      weight: { value: raw.weight_value, unit: raw.weight_unit },
      images: raw.img_urls ?? [],
      specifications: specs,
      compatibleVehicles: (raw.fits_vehicles ?? [])
        .map(AutoPartsPlusService.parseVehicle)
        .filter((v: VehicleCompatibility | null): v is VehicleCompatibility => v !== null),
    };
  }
}
