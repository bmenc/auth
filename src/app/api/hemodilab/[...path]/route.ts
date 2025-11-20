import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/apiAuth';
import { connectMongoDB } from '@/lib/mongodb';
import ResponseData from '@/models/ResponseData';

// Función para normalizar URL
const normalizeUrl = (url: string) => {
  if (!url) return '';
  let normalized = url.trim();
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  return normalized;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const path = '/' + params.path.join('/');
    await connectMongoDB();
    
    // Buscar el endpoint que coincida con la URL
    const allData = await ResponseData.find({ method: 'GET' });
    const matched = allData.find((item) => {
      const itemUrl = normalizeUrl(item.url || `/api/${item.entity.toLowerCase()}`);
      return `/hemodilab${itemUrl}` === `/hemodilab${path}` || itemUrl === path;
    });

    if (!matched) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    // Parsear el response
    let responseData;
    try {
      responseData = JSON.parse(matched.response);
    } catch {
      responseData = matched.response;
    }

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const path = '/' + params.path.join('/');
    await connectMongoDB();
    
    const allData = await ResponseData.find({ method: 'POST' });
    const matched = allData.find((item) => {
      const itemUrl = normalizeUrl(item.url || `/api/${item.entity.toLowerCase()}`);
      return `/hemodilab${itemUrl}` === `/hemodilab${path}` || itemUrl === path;
    });

    if (!matched) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    let responseData;
    try {
      responseData = JSON.parse(matched.response);
    } catch {
      responseData = matched.response;
    }

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const path = '/' + params.path.join('/');
    await connectMongoDB();
    
    const allData = await ResponseData.find({ method: 'PUT' });
    const matched = allData.find((item) => {
      const itemUrl = normalizeUrl(item.url || `/api/${item.entity.toLowerCase()}`);
      return `/hemodilab${itemUrl}` === `/hemodilab${path}` || itemUrl === path;
    });

    if (!matched) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    let responseData;
    try {
      responseData = JSON.parse(matched.response);
    } catch {
      responseData = matched.response;
    }

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const path = '/' + params.path.join('/');
    await connectMongoDB();
    
    const allData = await ResponseData.find({ method: 'DELETE' });
    const matched = allData.find((item) => {
      const itemUrl = normalizeUrl(item.url || `/api/${item.entity.toLowerCase()}`);
      return `/hemodilab${itemUrl}` === `/hemodilab${path}` || itemUrl === path;
    });

    if (!matched) {
      return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 });
    }

    let responseData;
    try {
      responseData = JSON.parse(matched.response);
    } catch {
      responseData = matched.response;
    }

    return NextResponse.json(responseData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

