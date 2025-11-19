# Mock API Server - HEMODILAB

Este proyecto incluye un Mock API implementado con Next.js API Routes que genera rutas dinámicas basadas en los datos almacenados en la colección `response_data` de MongoDB.

## Características

1. **Rutas Dinámicas**: Genera endpoints automáticamente basados en los datos de `response_data`
2. **Swagger Documentation**: Genera documentación Swagger automáticamente
3. **Next.js API Routes**: Implementado completamente con rutas API nativas de Next.js

## Uso

### Desarrollo Local

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000` con las siguientes rutas:

- **API Base**: `http://localhost:3000/api/hemodilab/{endpoint}`
- **Swagger JSON**: `http://localhost:3000/api/swagger` o `http://localhost:3000/api/swagger.json`
- **Swagger UI**: `http://localhost:3000/swagger`
- **Health Check**: `http://localhost:3000/api/health`

### Producción (Vercel)

El proyecto está completamente compatible con Vercel. Simplemente despliega la aplicación Next.js:

```bash
npm run build
npm start
```

Todas las rutas API funcionarán como serverless functions en Vercel.

## Estructura de Endpoints

Los endpoints se generan automáticamente basados en el campo `url` de cada registro en `response_data`:

- Si `url` está definido: `/api/hemodilab{url}`
- Si `url` está vacío: `/api/hemodilab/api/{entity.toLowerCase()}`

Ejemplo:
- Si `url = "/patients"` y `method = "GET"` → `GET /api/hemodilab/patients`
- Si `url = ""` y `entity = "Patient"` → `GET /api/hemodilab/api/patient`

## Respuestas

Cada endpoint responde con el contenido del campo `response` del registro correspondiente. Si `response` es un JSON válido, se parsea y se devuelve como JSON. Si no, se devuelve como string.

## Swagger

La documentación Swagger se genera automáticamente y se actualiza cada vez que se accede al endpoint `/api/swagger` o `/api/swagger.json`. Incluye:

- Todos los endpoints definidos en `response_data`
- Métodos HTTP (GET, POST, PUT, DELETE)
- Descripciones de cada endpoint
- Ejemplos de respuestas

## Variables de Entorno

El servidor usa las siguientes variables de entorno:

- `MONGODB_URI`: URI de conexión a MongoDB (requerido)
- `NEXT_PUBLIC_API_URL`: URL base de la API (opcional, default: `http://localhost:3000`)

## Arquitectura

- **Rutas API**: `/src/app/api/hemodilab/[...path]/route.ts` - Maneja todas las rutas dinámicas (GET, POST, PUT, DELETE)
- **Swagger**: `/src/app/api/swagger/route.ts` y `/src/app/api/swagger.json/route.ts` - Genera la especificación Swagger
- **Health Check**: `/src/app/api/health/route.ts` - Endpoint de salud del servidor
- **Swagger UI**: `/src/app/(logged-in)/swagger/page.tsx` - Interfaz visual de Swagger

## Notas

- Las rutas se generan dinámicamente consultando MongoDB en cada request
- No hay necesidad de recargar rutas manualmente, siempre están actualizadas
- Si un endpoint no se encuentra, devuelve un error 404
- Compatible con Vercel y cualquier plataforma que soporte Next.js
