# car-parts-demo

Aplicación de demostración fullstack que agrega el catálogo de repuestos automotrices de tres proveedores externos, los normaliza en un formato común y los expone a través de una interfaz web con búsqueda y filtros por compatibilidad vehicular.

El backend es una API REST en NestJS que mantiene una copia en memoria del catálogo de cada proveedor y la refresca periódicamente. El frontend es una aplicación Next.js que consume esa API y muestra las piezas en una grilla paginada.

## Requisitos

- [Docker](https://www.docker.com/) con Docker Compose

## Levantar la aplicación

```bash
docker compose up --build
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).
