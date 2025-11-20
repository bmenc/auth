import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    
    if (pathname.startsWith('/api/')) {
      const publicApiRoutes = ['/api/auth', '/api/register'];
      const isPublicRoute = publicApiRoutes.some(route => pathname.startsWith(route));
      
      if (!isPublicRoute && !req.nextauth.token) {
        return NextResponse.json(
          { error: 'Unauthorized' },
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

