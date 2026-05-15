import type { Metadata } from "next";
import "./globals.css";
import { cookies, headers } from "next/headers";
import { readFile } from "fs/promises";
import { join } from "path";
import Sidebar from "@/components/Layout/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { MobileToolsBar } from "@/components/MobileToolsBar";
import { SiteFooter } from "@/components/SiteFooter";
import modulesConfig from "@/config/modules.json";
import { verifyToken, getCookieName } from "@/lib/auth";

export const viewport = {
  themeColor: '#c8975a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wenai-one.vercel.app'),
  title: 'Wenai · 电商商业交付系统',
  description:
    '从 SKU、类目规则、品牌禁区、内容营销、试跑报告到商务推进, 一条线跑完。',
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
    title: 'Wenai · 电商商业交付系统',
    description: '把电商上新、内容营销、验收报告和商务推进压成可交付标准包。',
    url: 'https://wenai-one.vercel.app',
    siteName: 'wenai',
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: 'wenai · 电商商业交付系统',
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wenai · 电商商业交付系统',
    description: '把电商上新、内容营销、验收报告和商务推进压成可交付标准包。',
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

  // 当前路径由 proxy 注入到 x-pathname header。
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // 公开页面不挂后台导航, 由各自页面负责营销页导航和页脚。
  const isMarketingRoute =
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/cases');

  // 未登录或访问公开页面时, 不展示后台壳。
  const showChrome = !!session && !isMarketingRoute;
  const tenantConfig = session?.tenant;
  const userRole = session?.role;

  const enabledModules = showChrome && tenantConfig
    ? (() => {
        const enabledIds = new Set(tenantConfig.enabledModules);
        return modulesConfig.modules
          .filter(m => enabledIds.has(m.id))
          .map(m => ({
            id: m.id,
            name: m.name,
            nameEn: m.nameEn,
            icon: m.icon,
            category: m.category,
            categoryLabel: m.categoryLabel,
          }));
      })()
    : [];

  return (
    <html
      lang="zh-CN"
      className="h-full"
    >
      <body className="min-h-full noise-overlay">
        {showChrome && (
          <Sidebar
            modules={enabledModules}
            categories={modulesConfig.categories}
            clientName={tenantConfig!.clientName}
            userRole={userRole}
          />
        )}
        <main className={showChrome ? "lg:ml-[240px] min-h-screen p-4 lg:p-8" : "min-h-screen"}>
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
