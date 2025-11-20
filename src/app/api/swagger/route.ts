import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ResponseData from '@/models/ResponseData';

const normalizeUrl = (url: string) => {
  if (!url) return '';
  let normalized = url.trim();
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
};

export async function GET() {
  try {
    await connectMongoDB();
    const data = await ResponseData.find();
    
    const paths: Record<string, Record<string, {
      tags: string[];
      summary: string;
      description: string;
      parameters: Array<{
        name: string;
        in: string;
        required: boolean;
        schema: { type: string };
      }>;
      responses: {
        '200': {
          description: string;
          content: {
            'application/json': {
              schema: { type: string; example?: unknown };
            };
          };
        };
      };
    }>> = {};
    
    data.forEach((item) => {
      const endpoint = normalizeUrl(item.url || `/api/${item.entity.toLowerCase()}`);
      const fullPath = `/hemodilab${endpoint}`;
      
      let responseSchema: { type: string; example?: unknown };
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
            content: {
              'application/json': {
                schema: responseSchema
              }
            }
          }
        }
      };
    });

    const swaggerSpec = {
      openapi: '3.0.0',
      info: {
        title: 'HEMODILAB Mock API',
        version: '1.0.0',
        description: 'Dynamic API endpoints generated from response_data collection'
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Next.js API Server'
        },
        {
          url: `http://localhost:${process.env.MOCK_API_PORT || 60341}`,
          description: 'Mock API Server'
        }
      ],
      paths
    };

    return NextResponse.json(swaggerSpec);
  } catch {
    return NextResponse.json({ error: 'Failed to generate Swagger spec' }, { status: 500 });
  }
}

