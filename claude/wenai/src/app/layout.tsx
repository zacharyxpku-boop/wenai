import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
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

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport = {
  themeColor: '#c8975a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Wenai · 跨境新品上新流水线",
  description: "选 1 个品类 → 贴 1 条 SKU → 同时跑翻译 / 文案 / 合规 → 一键打包。五大品类专属调教。",
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
    title: "Wenai · 跨境新品上新流水线",
    description: "30 秒跑完一个新品的翻译 + 文案 + 合规 · 品类专属调教",
    url: "https://wenai-one.vercel.app",
    siteName: "wenai",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "wenai · 跨境电商 AI 工作台",
      },
    ],
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wenai · 跨境电商 AI 工作台",
    description: "19 个 AI 模块 · 7 天免费内测",
    images: ["/api/og"],
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

  // 当前路径 · middleware 注入的 x-pathname header
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Marketing 路由: 不挂 dashboard chrome (sidebar / footer / palette / shortcuts / mobile bar)
  // 各 marketing page.tsx 自己 import TopNav + MarketingFooter 渲染
  const isMarketingRoute =
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/product/') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/resources') ||
    pathname.startsWith('/cases');

  // If no session (not logged in), render without sidebar
  // Marketing 路由也不挂 chrome (即使已登录访客逛首页, 也走 marketing 版式)
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
      className={`${outfit.variable} ${ibmPlexMono.variable} h-full`}
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
