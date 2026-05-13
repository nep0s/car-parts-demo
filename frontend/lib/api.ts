const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

export interface VehicleCompatibility {
  manufacturer: string;
  model: string;
  yearStart: number;
  yearEnd: number;
  engine?: string;
  trim?: string;
}

export interface Part {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  oemCode?: string;
  category?: string;
  price: number;
  stock: number;
  warehouse?: string;
  weight?: { value: number; unit: string };
  source: string;
  images: string[];
  compatibleVehicles: VehicleCompatibility[];
}

interface CarPartDto {
  source: string;
  sku: string;
  title: string;
  description?: string;
  brand?: string;
  oemCode?: string;
  category?: string;
  price: { amount: number; currency: string };
  stock: number;
  warehouse?: string;
  weight?: { value: number; unit: string };
  images: string[];
  specifications?: { key: string; value: string }[];
  compatibleVehicles: VehicleCompatibility[];
}

export interface PartDetail {
  source: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  oemCode?: string;
  category?: string;
  price: number;
  stock: number;
  warehouse?: string;
  weight?: { value: number; unit: string };
  images: string[];
  specifications: { key: string; value: string }[];
  compatibleVehicles: VehicleCompatibility[];
}

interface CatalogResponse {
  parts: CarPartDto[];
  pagination: { page: number; limit: number; total: number };
}

export async function fetchDetail(source: string, sku: string): Promise<PartDetail> {
  const res = await fetch(`${BACKEND_URL}/parts/${source}/${sku}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Detail fetch failed: ${res.status}`);
  const dto: CarPartDto = await res.json();
  return {
    source: dto.source,
    sku: dto.sku,
    name: dto.title,
    description: dto.description,
    brand: dto.brand,
    oemCode: dto.oemCode,
    category: dto.category,
    price: dto.price.amount,
    stock: dto.stock,
    warehouse: dto.warehouse,
    weight: dto.weight,
    images: dto.images,
    specifications: dto.specifications ?? [],
    compatibleVehicles: dto.compatibleVehicles,
  };
}

export interface CatalogFilters {
  search?: string;
  manufacturer?: string;
  model?: string;
  year?: number;
}

export async function fetchCatalog(
  page: number,
  limit: number,
  filters: CatalogFilters = {},
): Promise<{ parts: Part[]; total: number; totalPages: number }> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.search) params.set('search', filters.search);
  if (filters.manufacturer) params.set('manufacturer', filters.manufacturer);
  if (filters.model) params.set('model', filters.model);
  if (filters.year !== undefined) params.set('year', String(filters.year));
  const res = await fetch(
    `${BACKEND_URL}/parts/catalog?${params.toString()}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
  const data: CatalogResponse = await res.json();
  return {
    parts: data.parts.map((dto) => ({
      id: `${dto.source}:${dto.sku}`,
      name: dto.title,
      description: dto.description,
      brand: dto.brand,
      oemCode: dto.oemCode,
      category: dto.category,
      price: dto.price.amount,
      stock: dto.stock,
      warehouse: dto.warehouse,
      weight: dto.weight,
      source: dto.source,
      images: dto.images,
      compatibleVehicles: dto.compatibleVehicles,
    })),
    total: data.pagination.total,
    totalPages: Math.ceil(data.pagination.total / limit),
  };
}
