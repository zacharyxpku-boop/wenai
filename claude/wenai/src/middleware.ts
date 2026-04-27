import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getCookieName } from '@/lib/auth';
import { checkRouteAccess } from '@/lib/rbac';

// 完全不需要 token 的路径(认证 / 静态营销页 / 公开物料)
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/demo',
  '/demo',
  '/terms',
  '/privacy',
  '/legal',
  '/api/sales/inquiry', // ToB 询盘提交 (POST) 必须开放给未登录访客
];

// 营销/演示前端页面 · 访客可看 hero/价值主张,但调 AI 接口仍需登录
// 这一层让 wenai-one.vercel.app 直接打开就能看到工厂叙事而不是登录墙
const PUBLIC_PAGE_PREFIXES = [
  '/', // 首页(精确匹配,见下方判断)
  '/pipelines/', // AI 影棚 / AI 视频 / 视频拆解 / 反向意图 / 新品上新 / 达人冷启 / 主图
  '/cases',
  '/enterprise',
  '/pricing',
  '/inquire',
  '/roadmap',
  '/changelog',
  '/status',
  '/docs',
  '/MOAT_MAP', // 文档页(若实装路由)
  '/share', // 公开分享页
  '/invite', // 邀请码兑换
  '/me', // 个人中心 (SKU 库) · 匿名用户用 IP 当 orgId
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 完全公开 (含 API)
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // 营销/演示前端页面 · 不要求登录,但 API 路径不放行(必须登录才能调 AI 烧 token)
  const isPageRoute = !pathname.startsWith('/api/');
  const isPublicPage =
    pathname === '/' ||
    PUBLIC_PAGE_PREFIXES.some(p => p !== '/' && pathname.startsWith(p));

  if (isPageRoute && isPublicPage && !pathname.startsWith('/admin')) {
    return NextResponse.next();
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

  // Role-based access control
  if (!checkRouteAccess(pathname, payload.role)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: '权限不足', requiredRole: 'admin' },
        { status: 403 }
      );
    }
    // Non-API routes: redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Inject tenant info into request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', payload.tenantId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-username', payload.username);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
