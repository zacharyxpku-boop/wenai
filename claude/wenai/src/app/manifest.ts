import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wenai · 电商内容实验决策中枢',
    short_name: 'Wenai',
    description: '导入平台 CSV，生成下一轮内容实验决策、脱敏报告和生产需求 Brief。',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e0e11',
    theme_color: '#c8975a',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity'],
    lang: 'zh-CN',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: '实验项目',
        short_name: '项目',
        description: '创建项目或从行业模板开始',
        url: '/dashboard',
      },
      {
        name: '导入 CSV',
        short_name: '导入',
        description: '上传平台表现数据并生成决策',
        url: '/factory',
      },
      {
        name: '定价',
        short_name: '定价',
        description: '查看 Free、Starter 和 Growth 权益',
        url: '/pricing',
      },
    ],
  };
}
