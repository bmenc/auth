import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectMongoDB } from '@/lib/mongodb';
import ResponseData from '@/models/ResponseData';
import { ENTITY_OPTIONS } from '@/constants/entityOptions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
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
    const updatedResponseData = await ResponseData.findByIdAndUpdate(
      id,
      {
        entity,
        description,
        method: method || 'GET',
        parameters: parameters || '',
        response,
        auth: auth !== undefined ? auth : false,
        url: url || '',
      },
      { new: true }
    );
    if (!updatedResponseData) {
      return NextResponse.json({ error: 'Response data not found' }, { status: 404 });
    }
    return NextResponse.json(updatedResponseData);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    await connectMongoDB();
    const deletedResponseData = await ResponseData.findByIdAndDelete(id);
    if (!deletedResponseData) {
      return NextResponse.json({ error: 'Response data not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Response data deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

