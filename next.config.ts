import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include config files in serverless function bundles
  outputFileTracingIncludes: {
    '/api/**': ['./src/config/**/*.json'],
    '/': ['./src/config/**/*.json'],
    '/modules/**': ['./src/config/**/*.json'],
    '/login': ['./src/config/**/*.json'],
    '/settings': ['./src/config/**/*.json'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
