# Mock API Server - HEMODILAB

Este proyecto incluye un servidor Mock API que genera rutas dinámicas basadas en los datos almacenados en la colección `response_data` de MongoDB.

## Características

1. **Rutas Dinámicas**: Genera endpoints automáticamente basados en los datos de `response_data`
2. **Swagger Documentation**: Genera documentación Swagger automáticamente
3. **Dos Modos de Operación**:
   - **Next.js API Routes**: Rutas en `http://localhost:3000/api/hemodilab/{endpoint}`
   - **Mock Server Express**: Servidor independiente en `http://localhost:60341`

## Uso

### Opción 1: Servidor Mock Express (Puerto 60341)

```bash
# Iniciar solo el servidor mock
npm run dev:mock

# O iniciar ambos servidores (Next.js + Mock API)
npm run dev:all
```

El servidor mock estará disponible en:
- **API Base**: `http://localhost:60341`
- **Swagger UI**: `http://localhost:60341/swagger`
- **Swagger JSON**: `http://localhost:60341/swagger.json`
- **Health Check**: `http://localhost:60341/health`

### Opción 2: Next.js API Routes (Puerto 3000)

Las rutas dinámicas están disponibles en:
- **API Base**: `http://localhost:3000/api/hemodilab/{endpoint}`
- **Swagger JSON**: `http://localhost:3000/api/swagger`
- **Swagger UI**: `http://localhost:3000/swagger`

## Estructura de Endpoints

Los endpoints se generan automáticamente basados en el campo `url` de cada registro en `response_data`:

- Si `url` está definido: `/hemodilab{url}`
- Si `url` está vacío: `/hemodilab/api/{entity.toLowerCase()}`

Ejemplo:
- Si `url = "/patients"` y `method = "GET"` → `GET /hemodilab/patients`
- Si `url = ""` y `entity = "Patient"` → `GET /hemodilab/api/patient`

## Respuestas

Cada endpoint responde con el contenido del campo `response` del registro correspondiente. Si `response` es un JSON válido, se parsea y se devuelve como JSON. Si no, se devuelve como string.

## Swagger

La documentación Swagger se genera automáticamente y se actualiza cada vez que se accede al endpoint `/api/swagger`. Incluye:

- Todos los endpoints definidos en `response_data`
- Métodos HTTP (GET, POST, PUT, DELETE)
- Descripciones de cada endpoint
- Ejemplos de respuestas

## Variables de Entorno

El servidor mock usa las siguientes variables de entorno:

- `MONGODB_URI`: URI de conexión a MongoDB (requerido)
- `MOCK_API_PORT`: Puerto para el servidor mock (default: 60341)

## Notas

- El servidor mock recarga las rutas cada 30 segundos automáticamente
- Las rutas se generan basándose en los datos actuales de MongoDB
- Si un endpoint no se encuentra, devuelve un error 404

