import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clico",
  description: "AI Video Dashboard for merchants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
