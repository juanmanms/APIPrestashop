# API Prestashop

API REST construida con Node.js y Express para conectar con tiendas Prestashop a través de su webservice y una base de datos MariaDB.

## Requisitos previos

- Node.js 20+
- npm
- Base de datos MariaDB accesible
- **Para Docker:** Docker Desktop con Docker Compose v2

## Configuración

Crea un archivo `.env` en la raíz del proyecto basándote en el siguiente ejemplo:

```env
WebServiceKey=TU_CLAVE_WEBSERVICE
Server=tudominio.cat
DB=nombre_base_datos
UsuarioDB=usuario_db
PasswordDB=contraseña_db
cookie_key=clave_secreta_jwt
group_atributos=24
transportista=27
estado_definitivo=28
estado_tpv=29
```

> ⚠️ Nunca subas el archivo `.env` al repositorio.

## Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `GET /` | Bienvenida |
| `/products` | Gestión de productos |
| `/attributes` | Atributos de productos |
| `/sellers` | Vendedores |
| `/auth` | Autenticación |
| `/orders` | Pedidos |
| `/clients` | Clientes |
| `/repartos` | Repartos |
| `/utiles` | Utilidades |
| `/categories` | Categorías |
| `/cp` | Zonas por código postal |
| `/cms` | Contenido CMS e imágenes |

---

## Desarrollo local (sin Docker)

```bash
npm install
npm run dev
```

La API arrancará en `http://localhost:3000` con hot reload activado mediante `--watch`.

---

## Desarrollo con Docker (recomendado)

### Levantar el entorno

```bash
npm run docker:dev:up
```

O directamente con Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up --build
```

La API quedará disponible en `http://localhost:3000`.

### Detener el entorno

```bash
npm run docker:dev:down
```

### Ver logs en tiempo real

```bash
docker compose -f docker-compose.dev.yml logs -f api
```

### Hot reload

Los cambios en `src/` se reflejan automáticamente sin necesidad de reconstruir la imagen. El proceso dentro del contenedor ejecuta:

```bash
node --env-file .env --watch src/app.js
```

### Notas sobre Docker

- La imagen usa **Node 20 Alpine**.
- La base de datos MariaDB es **externa**; el contenedor solo corre la API.
- `node_modules` se mantiene dentro del contenedor para evitar conflictos entre host y contenedor en Windows.
- Las variables de entorno se cargan desde tu `.env` local.

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Arranca en desarrollo con hot reload (local) |
| `npm run docker:dev:up` | Construye y levanta el entorno Docker de desarrollo |
| `npm run docker:dev:down` | Para y elimina los contenedores de desarrollo |
