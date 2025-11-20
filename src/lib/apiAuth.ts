import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function validateApiAuth(request: NextRequest): Promise<boolean> {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');
  const apiKeyQuery = request.nextUrl.searchParams.get('api_key');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return token === apiKey;
  }

  if (apiKeyHeader) {
    return apiKeyHeader === apiKey;
  }

  if (apiKeyQuery) {
    return apiKeyQuery === apiKey;
  }

  return false;
}

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const hasApiAuth = await validateApiAuth(request);
  
  if (hasApiAuth) {
    return true;
  }

  const session = await getServerSession(authOptions);
  return !!session?.user?.email;
}

