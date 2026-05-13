export interface VehicleCompatibility {
  manufacturer: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engine?: string;
  trim?: string;
}

export interface CarPartDto {
  id: string;
  source: 'autopartsplus' | 'repuestosmax' | 'globalparts';
  sku: string;
  oemCode: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  price: { amount: number; currency: string };
  stock: number;
  warehouse: string;
  weight: { value: number; unit: string };
  images: string[];
  specifications: Array<{ key: string; value: string }>;
  compatibleVehicles: VehicleCompatibility[];
}

export interface SourceSummary {
  count: number;
  lastRefreshedAt: Date | null;
}

export interface CatalogResponseDto {
  parts: CarPartDto[];
  pagination: { page: number; limit: number; total: number };
  sourcesSummary: {
    autopartsplus: SourceSummary;
    repuestosmax: SourceSummary;
    globalparts: SourceSummary;
  };
}
