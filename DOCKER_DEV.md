# Docker desarrollo (hot reload)

## Requisitos

- Docker Desktop con Docker Compose v2

## Levantar entorno de desarrollo

```bash
npm run docker:dev:up
```

La API quedara disponible en `http://localhost:3000`.

## Detener entorno

```bash
npm run docker:dev:down
```

## Ver logs en tiempo real

```bash
docker compose -f docker-compose.dev.yml logs -f api
```

## Hot reload

El servicio ejecuta:

```bash
node --env-file .env --watch src/app.js
```

Con el volumen bind `.:/usr/src/app`, los cambios en `src/` se reflejan sin reconstruir la imagen.

## Notas

- Este compose no incluye MariaDB; la API usa tu configuracion externa definida en `.env`.
- `node_modules` se mantiene dentro del contenedor para evitar conflictos de dependencias entre host y contenedor.
