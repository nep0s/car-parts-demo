# car-parts-demo

Aplicación de demostración fullstack que agrega el catálogo de repuestos automotrices de tres proveedores externos, los normaliza en un formato común y los expone a través de una interfaz web.

El backend es una API REST en NestJS que mantiene una copia en memoria del catálogo de cada proveedor y la refresca periódicamente. El frontend es una aplicación Next.js que consume esa API y muestra las piezas en una interfaz paginada.

Los archivos CLAUDE.md contienen documentación más detallada.

## Decisiones tomadas

El backend guarda un almacén de los datos de los proveedores.

El frontend accede a estos datos y los despliega en una lista. Se puede acceder a los detalles de un repuesto en específico, lo que revisa que el precio y el stock estén actualizados.

Los datos del almacén se refrescan cada 15 minutos, o si los detalles de precio/stock de un repuesto presentan una discrepancia con los datos disponibles.

## Despliegue

La página se encuentra desplegada en [Railway](https://www.railway.com/)

Frontend: https://car-parts-frontend-production-76fb.up.railway.app

Backend: https://car-parts-demo-production.up.railway.app

## API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/parts/catalog` | Catálogo paginado de todas las fuentes |
| `GET` | `/parts/:source/:sku` | Detalle de una pieza por fuente y SKU |

Parámetros de `/parts/catalog`:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | número | Página (default: 1) |
| `limit` | número | Resultados por página, máx. 100 (default: 10) |
| `search` | texto | Filtro por nombre de pieza |
| `manufacturer` | texto | Filtro por marca de vehículo compatible |
| `model` | texto | Filtro por modelo de vehículo compatible |
| `year` | número | Filtro por año de vehículo compatible |

## Requisitos (local)

- [Docker](https://www.docker.com/) con Docker Compose

## Levantar la aplicación

```bash
docker compose up --build
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).
