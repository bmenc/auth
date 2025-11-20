require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const PORT = process.env.MOCK_API_PORT || 60341;

// Conectar a MongoDB
const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    if (mongoose.connection.readyState === 1) {
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for Mock API');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Schema de ResponseData
const responseDataSchema = new mongoose.Schema({
  entity: String,
  description: String,
  method: String,
  parameters: String,
  response: String,
  auth: Boolean,
  url: String,
}, { 
  timestamps: true,
  collection: 'response_data'
});

const ResponseData = mongoose.models.ResponseData || mongoose.model('ResponseData', responseDataSchema);

// Función para normalizar URL
const normalizeUrl = (url) => {
  if (!url) return '';
  // Remover espacios y asegurar que empiece con /
  let normalized = url.trim();
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
};

// Función para crear rutas dinámicas
const createDynamicRoutes = async () => {
  try {
    const data = await ResponseData.find();
    
    // Limpiar rutas anteriores (solo para desarrollo)
    if (app._router && app._router.stack) {
      app._router.stack = app._router.stack.filter((layer) => {
        return !layer.route || !layer.route.path.startsWith('/hemodilab/');
      });
    }

    data.forEach((item) => {
      const endpoint = normalizeUrl(item.url || `/api/${item.entity.toLowerCase()}`);
      const fullPath = `${endpoint}`;
      
      const handler = async (req, res) => {
        try {
          // Parsear el response como JSON si es posible
          let responseData;
          try {
            responseData = JSON.parse(item.response);
          } catch {
            responseData = item.response;
          }

          // Headers
          res.setHeader('Content-Type', 'application/json');
          
          // Responder con el response almacenado
          res.status(200).json(responseData);
        } catch (error) {
          res.status(500).json({ error: 'Internal server error', message: error.message });
        }
      };

      // Crear ruta según el método
      switch (item.method) {
        case 'GET':
          app.get(fullPath, handler);
          break;
        case 'POST':
          app.post(fullPath, handler);
          break;
        case 'PUT':
          app.put(fullPath, handler);
          break;
        case 'DELETE':
          app.delete(fullPath, handler);
          break;
        default:
          app.get(fullPath, handler);
      }

      console.log(`Route created: ${item.method} ${fullPath}`);
    });
  } catch (error) {
    console.error('Error creating dynamic routes:', error);
  }
};

// Generar Swagger spec
const generateSwaggerSpec = async () => {
  try {
    const data = await ResponseData.find();
    
    const paths = {};
    
    data.forEach((item) => {
      const endpoint = normalizeUrl(item.url || `/api/${item.entity.toLowerCase()}`);
      const fullPath = `/hemodilab${endpoint}`;
      
      let responseSchema;
      try {
        const parsed = JSON.parse(item.response);
        responseSchema = {
          type: 'object',
          example: parsed
        };
      } catch {
        responseSchema = {
          type: 'string',
          example: item.response
        };
      }

      if (!paths[fullPath]) {
        paths[fullPath] = {};
      }

      paths[fullPath][item.method.toLowerCase()] = {
        tags: [item.entity],
        summary: item.description,
        description: item.description,
        parameters: item.parameters ? [
          {
            name: 'body',
            in: 'body',
            required: false,
            schema: {
              type: 'object'
            }
          }
        ] : [],
        responses: {
          '200': {
            description: 'Success',
            schema: responseSchema
          }
        }
      };
    });

    return {
      openapi: '3.0.0',
      info: {
        title: 'HEMODILAB Mock API',
        version: '1.0.0',
        description: 'Dynamic API endpoints generated from response_data collection'
      },
      servers: [
        {
          url: `http://localhost:${PORT}`,
          description: 'Mock API Server'
        }
      ],
      paths
    };
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    return null;
  }
};

// Endpoint para obtener Swagger spec
app.get('/swagger.json', async (req, res) => {
  try {
    const spec = await generateSwaggerSpec();
    if (spec) {
      res.json(spec);
    } else {
      res.status(500).json({ error: 'Failed to generate Swagger spec' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir Swagger UI
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HEMODILAB Mock API',
      version: '1.0.0',
    },
  },
  apis: [],
});

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(null, {
  swaggerOptions: {
    url: '/swagger.json'
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Inicializar servidor
const startServer = async () => {
  try {
    await connectMongoDB();
    await createDynamicRoutes();
    
    // Recargar rutas cada 30 segundos
    setInterval(async () => {
      await createDynamicRoutes();
    }, 30000);

    app.listen(PORT, () => {
      console.log(`Mock API server running on port ${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/swagger`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

