@AGENTS.md

# Frontend

Next.js app running on port 3000. Uses the App Router with server components for data fetching.

## Structure

```
app/
├── page.tsx                     # Catalog page — server component, fetches & paginates parts
├── layout.tsx                   # Root layout
├── components/
│   ├── SearchFilters.tsx        # Client component — search + vehicle compatibility filters
│   ├── PartCard.tsx             # Part card with supplier badge and compatible vehicles
│   ├── PartImage.tsx            # Supplier image with local placeholder fallback
│   ├── PartDetailModal.tsx      # Modal with live price/stock for a single part
│   └── Pagination.tsx           # Page links, carries active filters via URL params
lib/
├── api.ts                       # fetchCatalog / fetchDetail, Part and CatalogFilters types
└── utils.ts                     # formatCLP currency formatter
```

## Key behaviors

- Filters (`search`, `manufacturer`, `model`, `year`) live in URL search params — set by `SearchFilters`, read by `page.tsx`, forwarded to the backend.
- `Pagination` preserves active filters across page navigation via `extraParams`.
- `PartImage` falls back to a local placeholder if the supplier image URL is broken or missing.
- `PartDetailModal` calls `GET /parts/:source/:sku` for fresh price and stock on open.
- Server components fetch from `http://backend:3001` (internal Docker network); the browser uses `NEXT_PUBLIC_BACKEND_URL`.
