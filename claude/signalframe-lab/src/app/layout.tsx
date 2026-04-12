import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SignalFrame",
  description:
    "Turn any product link into a structured synthetic UX report with personas, risks, and prioritized fixes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
