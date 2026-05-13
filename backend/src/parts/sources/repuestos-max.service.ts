import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { CarPartDto, VehicleCompatibility } from '../dto/car-part.dto';
import { withRetry } from '../utils/retry';

@Injectable()
export class RepuestosMaxService implements OnModuleInit {
  private readonly logger = new Logger(RepuestosMaxService.name);
  private store: CarPartDto[] = [];
  private lastRefreshedAt: Date | null = null;

  constructor(private readonly httpService: HttpService) {}

  async onModuleInit() {
    await this.refreshCatalog();
  }

  @Cron(process.env.PARTS_REFRESH_CRON || '0 */15 * * * *')
  async refreshCatalog() {
    try {
      const baseUrl = process.env.REPUESTOSMAX_BASE_URL;
      const allParts: CarPartDto[] = [];
      let pagina = 1;
      let hasNext = true;

      while (hasNext) {
        const { data } = await withRetry(() =>
          firstValueFrom(
            this.httpService.get(`${baseUrl}/catalogo`, {
              params: { pagina, limite: 100 },
            }),
          ),
        );
        allParts.push(...data.productos.map(RepuestosMaxService.mapPart));
        hasNext = data.paginacion.tieneSiguiente;
        pagina++;
      }

      this.store = allParts;
      this.lastRefreshedAt = new Date();
    } catch (err) {
      this.logger.warn(`RepuestosMax catalog refresh failed: ${(err as Error).message}`);
    }
  }

  async fetchDetail(sku: string): Promise<CarPartDto | null> {
    const { data } = await withRetry(() =>
      firstValueFrom(
        this.httpService.get(`${process.env.REPUESTOSMAX_BASE_URL}/productos`, {
          params: { codigo: sku },
        }),
      ),
    );
    const raw = data.resultado?.productos?.[0];
    return raw ? RepuestosMaxService.mapPart(raw) : null;
  }

  getStore(): CarPartDto[] {
    return this.store;
  }

  getLastRefreshedAt(): Date | null {
    return this.lastRefreshedAt;
  }

  static mapPart(raw: any): CarPartDto {
    const specs = Object.entries(
      raw.caracteristicas?.especificaciones ?? {},
    ).map(([key, value]) => ({ key, value: String(value) }));

    const compatibleVehicles: VehicleCompatibility[] = (
      raw.compatibilidad?.vehiculos ?? []
    ).map((v: any) => ({
      manufacturer: v.fabricante,
      model: v.modelo,
      yearStart: v.anios?.desde,
      yearEnd: v.anios?.hasta,
      engine: v.motor || undefined,
      trim: v.version || undefined,
    }));

    const images: string[] = (raw.multimedia?.imagenes ?? []).map(
      (img: any) => img.url,
    );

    return {
      id: raw.identificacion.codigoInterno,
      source: 'repuestosmax',
      sku: raw.identificacion.sku,
      oemCode: raw.identificacion.codigoOEM,
      title: raw.informacionBasica.nombre,
      description: raw.informacionBasica.descripcion,
      brand: raw.informacionBasica.marca.nombre,
      category: raw.informacionBasica.categoria.nombre,
      price: {
        amount: raw.precio.valor,
        currency: raw.precio.moneda,
      },
      stock: raw.inventario.cantidad,
      warehouse: raw.inventario.ubicacion.bodega,
      weight: {
        value: raw.caracteristicas.peso.valor,
        unit: raw.caracteristicas.peso.unidad,
      },
      images,
      specifications: specs,
      compatibleVehicles,
    };
  }
}
