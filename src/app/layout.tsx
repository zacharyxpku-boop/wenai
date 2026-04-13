import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { readFile } from "fs/promises";
import { join } from "path";
import Sidebar from "@/components/Layout/Sidebar";
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

export const metadata: Metadata = {
  title: "Wenai · AI E-Commerce Workforce",
  description: "Enterprise-grade AI employee system for cross-border e-commerce",
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

  // If no session (not logged in), render without sidebar
  const showChrome = !!session;
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
        </main>
      </body>
    </html>
  );
}
