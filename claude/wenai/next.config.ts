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
};

export default nextConfig;
