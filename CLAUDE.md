# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**car-parts-demo** — a fullstack demo app with a NestJS REST API backend and a Next.js frontend, coordinated via Docker Compose.

## Repository layout

```
/
├── backend/      # NestJS API
├── frontend/     # Next.js app
└── docker-compose.yml
```

## Common commands

### Docker (from repo root)
```bash
docker compose up --build        # start all services
docker compose up -d             # start detached
docker compose down              # stop and remove containers
docker compose logs -f backend   # tail backend logs
docker compose logs -f frontend  # tail frontend logs
```

### Backend (from /backend)
```bash
npm run start:dev    # watch mode
npm run build        # compile to /dist
npm run test         # unit tests
npm run test:e2e     # end-to-end tests
npm run test -- --testPathPattern=<file>  # single test file
npm run lint         # ESLint
```

### Frontend (from /frontend)
```bash
npm run dev          # dev server (port 3000)
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint + Next.js rules
```

## Architecture

- **backend** runs on port `3001` (or as configured in `docker-compose.yml`), exposes a REST API consumed by the frontend.
- **frontend** runs on port `3000`, uses Next.js App Router. Server components fetch directly from the backend service name inside Docker (`http://backend:3001`); client components go through Next.js API routes or relative URLs.
- Services communicate over an internal Docker network; only `3000` and `3001` are published to the host.
- Environment variables are injected via Docker Compose `environment:` / `.env` files — never hard-coded.

## Parts module (`backend/src/parts/`)

Fetches car parts from 3 external supplier APIs, normalizes them into a shared `CarPartDto`, and exposes two endpoints:

- `GET /parts/catalog?page=1&limit=10` — returns a paginated merged list from all 3 sources
- `GET /parts/:source/:sku` — returns a single part by source and SKU (calls the live detail API, falls back to the in-memory store)

### Structure

```
backend/src/parts/
├── dto/car-part.dto.ts           # CarPartDto and CatalogResponseDto interfaces
├── sources/
│   ├── autoparts-plus.service.ts # fetches /api/autopartsplus/catalog + /parts
│   ├── repuestos-max.service.ts  # fetches /api/repuestosmax/catalogo + /productos
│   └── global-parts.service.ts  # fetches /api/globalparts/inventory/catalog + /search
├── parts-aggregator.service.ts   # merges stores, handles detail lookup
├── parts.controller.ts
└── parts.module.ts
```

### Cache + refresh pattern

Each source service maintains an **in-memory store** (full catalog). On startup (`OnModuleInit`) and on every cron tick (`PARTS_REFRESH_CRON`), the service paginates through all pages of its API and atomically replaces the store on success. If a fetch fails, the previous copy is retained and a warning is logged.

The catalog endpoint reads from the stores and paginates in-process (no live HTTP per request).

## Environment variables

Copy `.env.example` to `.env` at the repo root before starting — Docker Compose reads `.env` automatically. `DATABASE_URL` is declared but not yet used (no DB service is wired up).

| Variable | Used by | Description |
|---|---|---|
| `DATABASE_URL` | backend | Not yet wired up — reserved for future DB |
| `AUTOPARTSPLUS_BASE_URL` | backend | Base URL for AutoPartsPlus API |
| `REPUESTOSMAX_BASE_URL` | backend | Base URL for RepuestosMax API |
| `GLOBALPARTS_BASE_URL` | backend | Base URL for GlobalParts API |
| `PARTS_REFRESH_CRON` | backend | Cron schedule for catalog refresh (default: `0 */15 * * * *`) |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | Backend URL visible to the browser |
