import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function validateApiKey(request: Request): boolean {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');
  const url = new URL(request.url);
  const apiKeyQuery = url.searchParams.get('api_key');

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

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    
    if (pathname.startsWith('/api/')) {
      const publicApiRoutes = ['/api/auth', '/api/register'];
      const isPublicRoute = publicApiRoutes.some(route => pathname.startsWith(route));
      
      if (isPublicRoute) {
        return NextResponse.next();
      }

      const hasApiKey = validateApiKey(req);
      const hasSession = !!req.nextauth.token;

      if (!hasApiKey && !hasSession) {
        return NextResponse.json(
          { error: 'Unauthorized. Provide API key via X-API-Key header, Authorization Bearer token, or api_key query parameter' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        if (pathname.startsWith('/api/')) {
          const publicApiRoutes = ['/api/auth', '/api/register'];
          const isPublicRoute = publicApiRoutes.some(route => pathname.startsWith(route));
          
          if (isPublicRoute) {
            return true;
          }

          const hasApiKey = validateApiKey(req);
          
          if (hasApiKey) {
            return true;
          }
          
          return !!token;
        }
        
        return !!token;
      },
    },
    pages: {
      signIn: '/sign-in',
    },
  }
);

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!sign-in|sign-up|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

