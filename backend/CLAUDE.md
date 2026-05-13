# Backend

NestJS API running on port 3001. All business logic lives in `src/parts/`.

## Structure

```
src/parts/
├── dto/car-part.dto.ts           # CarPartDto — shared shape for all parts
├── sources/
│   ├── autoparts-plus.service.ts # AutoPartsPlus supplier
│   ├── repuestos-max.service.ts  # RepuestosMax supplier
│   └── global-parts.service.ts  # GlobalParts supplier
├── utils/retry.ts                # Shared retry helper (2 retries, no delay)
├── parts-aggregator.service.ts   # Merges stores, handles detail lookup
├── parts.controller.ts           # GET /parts/catalog, GET /parts/:source/:sku
└── parts.module.ts
```

## Key behaviors

- Each source service fetches its full catalog on startup and on a cron schedule (`PARTS_REFRESH_CRON`), storing it in memory. If a refresh fails, the previous copy is kept.
- `GET /parts/catalog` reads from the in-memory stores, merges and sorts by title, applies filters, then paginates. No live HTTP per request.
- `GET /parts/:source/:sku` calls the live detail API for fresh price/stock, falling back to the in-memory store if the live call fails.
- Catalog filters: `search`, `manufacturer`, `model`, `year` (all optional query params).
- Page size is capped at 100 in the controller.
