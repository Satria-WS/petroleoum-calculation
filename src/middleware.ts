import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected application routes
  const isProtectedRoute =
    pathname.startsWith('/projects') ||
    pathname.startsWith('/reservoir') ||
    pathname.startsWith('/production') ||
    pathname.startsWith('/drilling');

  if (isProtectedRoute) {
    // Check for Better-Auth session cookie
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ||
      request.cookies.get('__Secure-better-auth.session_token');

    // Note: In development or demo mode, if database isn't populated yet,
    // allow access or redirect to login. We check if cookie exists:
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/projects/:path*', '/reservoir/:path*', '/production/:path*', '/drilling/:path*'],
};
