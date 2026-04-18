import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wenai · 跨境代运营流水线 OS',
    short_name: 'Wenai',
    description: '3 条 Pipeline 吃掉代运营日均重复劳动 · 五品类专属调教',
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
        name: 'Pipeline 01 · 新品上新',
        short_name: '新品',
        description: '翻译 / 文案 / 合规 并行',
        url: '/pipelines/new-listing',
      },
      {
        name: 'Pipeline 02 · 达人冷启',
        short_name: '达人',
        description: '批量个性化邮件',
        url: '/pipelines/influencer-outbound',
      },
      {
        name: 'Pipeline 03 · AI 主图',
        short_name: '主图',
        description: 'wanx 生图',
        url: '/pipelines/product-image',
      },
    ],
  };
}
