import type { Metadata } from 'next';
import './globals.css';
import { cookies, headers } from 'next/headers';
import { readFile } from 'fs/promises';
import { join } from 'path';
import Sidebar from '@/components/Layout/Sidebar';
import { CommandPalette } from '@/components/CommandPalette';
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp';
import { MobileToolsBar } from '@/components/MobileToolsBar';
import { SiteFooter } from '@/components/SiteFooter';
import modulesConfig from '@/config/modules.json';
import { getCookieName, verifyToken } from '@/lib/auth';

export const viewport = {
  themeColor: '#c8975a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wenai-one.vercel.app'),
  title: 'Wenai | 电商 AI 商业交付系统',
  description: '输入 SKU 信息，生成上新 SOP、营销交付包、验收报告与合同推进动作。',
  manifest: '/manifest.webmanifest',
  applicationName: 'Wenai',
  appleWebApp: {
    capable: true,
    title: 'Wenai',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Wenai | 电商 AI 商业交付系统',
    description: '演示 SKU 工作流，承接 POC、营销交付与企业接入需求。',
    url: 'https://wenai-one.vercel.app',
    siteName: 'wenai',
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'wenai | 电商 AI 商业交付系统',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wenai | 电商 AI 商业交付系统',
    description: '演示 SKU 工作流，承接 POC、营销交付与企业接入需求。',
    images: ['/api/og'],
  },
};

interface TenantConfig {
  clientName: string;
  enabledModules: string[];
  [key: string]: unknown;
}

interface SessionInfo {
  tenant: TenantConfig;
  role: string;
}

async function getSessionInfo(): Promise<SessionInfo | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getCookieName())?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const tenantPath = join(process.cwd(), 'src/config/tenants', `${payload.tenantId}.json`);
    const data = await readFile(tenantPath, 'utf-8');
    return { tenant: JSON.parse(data) as TenantConfig, role: payload.role };
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionInfo();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  const isMarketingRoute =
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/cases');

  const showChrome = !!session && !isMarketingRoute;
  const tenantConfig = session?.tenant;
  const userRole = session?.role;

  const enabledModules =
    showChrome && tenantConfig
      ? (() => {
          const enabledIds = new Set(tenantConfig.enabledModules);
          return modulesConfig.modules
            .filter((module) => enabledIds.has(module.id))
            .map((module) => ({
              id: module.id,
              name: module.name,
              nameEn: module.nameEn,
              icon: module.icon,
              category: module.category,
              categoryLabel: module.categoryLabel,
            }));
        })()
      : [];

  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full noise-overlay">
        {showChrome && (
          <Sidebar
            modules={enabledModules}
            categories={modulesConfig.categories}
            clientName={tenantConfig!.clientName}
            userRole={userRole}
          />
        )}
        <main className={showChrome ? 'min-h-screen p-4 lg:ml-[240px] lg:p-8' : 'min-h-screen'}>
          {children}
          {showChrome && <SiteFooter />}
        </main>
        {showChrome && <CommandPalette />}
        {showChrome && <KeyboardShortcutsHelp />}
        {showChrome && <MobileToolsBar />}
      </body>
    </html>
  );
}
