import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/apiAuth';

export async function GET(request: NextRequest) {
  const authenticated = await isAuthenticated(request);
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({ 
    status: 'ok',
    server: 'Next.js API',
    timestamp: new Date().toISOString()
  });
}

