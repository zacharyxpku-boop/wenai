import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/cases', '/pipelines/*', '/invite', '/status', '/privacy', '/terms', '/legal/*'],
        disallow: [
          '/api/*',
          '/admin/*',
          '/settings',
          '/modules/*', // 工具箱页面需登录
          '/pricing/checkout*',
        ],
      },
    ],
    sitemap: 'https://wenai-one.vercel.app/sitemap.xml',
  };
}
