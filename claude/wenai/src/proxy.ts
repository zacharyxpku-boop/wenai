import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCookieName } from '@/lib/auth';
import { checkRouteAccess } from '@/lib/rbac';

const PUBLIC_EXACT_PATHS = new Set([
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/demo',
  '/demo',
  '/terms',
  '/privacy',
  '/legal',
  '/manifest.webmanifest',
  '/api/sales/inquiry',
  '/api/health',
  '/api/share',
  '/api/unsubscribe',
]);

const PUBLIC_PAGE_PREFIXES = [
  '/',
  '/pipelines/',
  '/cases',
  '/enterprise',
  '/pricing',
  '/poc',
  '/inquire',
  '/roadmap',
  '/changelog',
  '/status',
  '/docs',
  '/MOAT_MAP',
  '/share',
  '/invite',
  '/me',
  '/tools',
  '/benchmark',
  '/dashboard',
  '/factory',
  '/report',
  '/settings/kuaizi',
  '/unsubscribed',
  '/about',
  '/product/',
  '/contact',
  '/resources',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_EXACT_PATHS.has(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const isPageRoute = !pathname.startsWith('/api/');
  const isPublicPage =
    pathname === '/' ||
    PUBLIC_PAGE_PREFIXES.some(p => p !== '/' && pathname.startsWith(p));

  if (isPageRoute && pathname === '/admin' && process.env.NODE_ENV !== 'development' && process.env.ENABLE_ADMIN !== 'true') {
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  if (isPageRoute && (pathname === '/admin' || (isPublicPage && !pathname.startsWith('/admin')))) {
    const publicHeaders = new Headers(request.headers);
    publicHeaders.set('x-pathname', pathname);
    return NextResponse.next({
      request: { headers: publicHeaders },
    });
  }

  const token = request.cookies.get(getCookieName())?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(getCookieName());
    return response;
  }

  if (!checkRouteAccess(pathname, payload.role)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: '权限不足', requiredRole: 'admin' },
        { status: 403 },
      );
    }

    return NextResponse.redirect(new URL('/', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', payload.tenantId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-username', payload.username);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
