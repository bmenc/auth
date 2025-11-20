import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/apiAuth';
import { connectMongoDB } from '@/lib/mongodb';
import ResponseData from '@/models/ResponseData';
import { ENTITY_OPTIONS } from '@/constants/entityOptions';

export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectMongoDB();
    const responseDataList = await ResponseData.find().sort({ createdAt: -1 });
    return NextResponse.json(responseDataList);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { entity, description, method, parameters, response, auth, url } = body;
    if (!entity || !description || !response) {
      return NextResponse.json({ error: 'Entity, description and response are required' }, { status: 400 });
    }
    if (!ENTITY_OPTIONS.includes(entity as typeof ENTITY_OPTIONS[number])) {
      return NextResponse.json({ error: 'Invalid entity. Must be one of the allowed entities' }, { status: 400 });
    }
    if (method && !['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
      return NextResponse.json({ error: 'Invalid method. Must be GET, POST, PUT or DELETE' }, { status: 400 });
    }
    await connectMongoDB();
    const newResponseData = new ResponseData({
      entity,
      description,
      method: method || 'GET',
      parameters: parameters || '',
      response,
      auth: auth !== undefined ? auth : false,
      url: url || '',
    });
    await newResponseData.save();
    return NextResponse.json(newResponseData, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

