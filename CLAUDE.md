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
