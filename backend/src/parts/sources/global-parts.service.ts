import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CarPartDto, VehicleCompatibility } from '../dto/car-part.dto';

@Injectable()
export class GlobalPartsService implements OnModuleInit {
  private readonly logger = new Logger(GlobalPartsService.name);
  private store: CarPartDto[] = [];
  private lastRefreshedAt: Date | null = null;

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await this.refreshCatalog();
  }

  @Cron(process.env.PARTS_REFRESH_CRON || '0 */15 * * * *')
  async refreshCatalog() {
    try {
      const baseUrl = process.env.GLOBALPARTS_BASE_URL;
      const allParts: CarPartDto[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const { data } = await firstValueFrom(
          this.httpService.get(`${baseUrl}/inventory/catalog`, {
            params: { page, itemsPerPage: 100 },
          }),
        );
        const envelope = data.ResponseEnvelope;
        const listing = envelope.Body.CatalogListing;
        allParts.push(...listing.Items.map(GlobalPartsService.mapPart));
        hasNext = envelope.Footer.Pagination.HasMoreResults;
        page++;
      }

      this.store = allParts;
      this.lastRefreshedAt = new Date();
    } catch (err) {
      this.logger.warn(`GlobalParts catalog refresh failed: ${(err as Error).message}`);
    }
  }

  async fetchDetail(sku: string): Promise<CarPartDto | null> {
    const { data } = await firstValueFrom(
      this.httpService.get(`${process.env.GLOBALPARTS_BASE_URL}/inventory/search`, {
        params: { partNumber: sku },
      }),
    );
    const raw = data.ResponseEnvelope?.Body?.SearchResults?.Items?.[0];
    return raw ? GlobalPartsService.mapPart(raw) : null;
  }

  getStore(): CarPartDto[] {
    return this.store;
  }

  getLastRefreshedAt(): Date | null {
    return this.lastRefreshedAt;
  }

  static mapPart(raw: any): CarPartDto {
    const specs: Array<{ key: string; value: string }> = (
      raw.TechnicalSpecifications?.SpecificationList ?? []
    ).map((s: any) => ({ key: s.SpecificationName, value: s.SpecificationValue }));

    const compatibleVehicles: VehicleCompatibility[] = (
      raw.VehicleCompatibility?.CompatibleVehicles ?? []
    ).map((v: any) => ({
      manufacturer: v.Manufacturer?.Name,
      model: v.Model?.Name,
      yearStart: v.YearRange?.StartYear,
      yearEnd: v.YearRange?.EndYear,
      engine: v.EngineInfo?.Description || undefined,
      trim: v.TrimLevel?.Name || undefined,
    }));

    const images: string[] = (raw.MediaAssets?.Images ?? []).map(
      (img: any) => img.ImageUrl,
    );

    return {
      id: raw.ItemHeader.InternalId,
      source: 'globalparts',
      sku: raw.ItemHeader.ExternalReferences.SKU.Value,
      oemCode: raw.ItemHeader.ExternalReferences.OEM.Value,
      title: raw.ProductDetails.NameInfo.DisplayName,
      description: raw.ProductDetails.Description.FullText,
      brand: raw.ProductDetails.BrandInfo.BrandName,
      category: raw.ProductDetails.CategoryInfo.PrimaryCategory.Name,
      price: {
        amount: raw.PricingInfo.ListPrice.Amount,
        currency: raw.PricingInfo.ListPrice.CurrencyCode,
      },
      stock: raw.AvailabilityInfo.QuantityInfo.AvailableQuantity,
      warehouse: raw.AvailabilityInfo.WarehouseInfo.PrimaryWarehouse.Name,
      weight: {
        value: raw.PhysicalAttributes.Weight.Value,
        unit: raw.PhysicalAttributes.Weight.Unit,
      },
      images,
      specifications: specs,
      compatibleVehicles,
    };
  }
}
