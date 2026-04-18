import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pipeline 02 · 达人批量冷启 · wenai',
  description: '贴达人名单 (最多 10 位) → 每位独立个性化邮件。根据粉丝量+平台自动选调性,Excel 直喂 Gmail Mail Merge / Mailmeteor。',
  openGraph: {
    title: 'Pipeline 02 · 达人批量冷启',
    description: '媒介手工 2 小时活 → 20 秒闭环 · 回复率翻 10 倍',
    images: [{
      url: '/api/og?title=%E8%BE%BE%E4%BA%BA%E6%89%B9%E9%87%8F%E5%86%B7%E5%90%AF&module=Pipeline%2002',
      width: 1200,
      height: 630,
    }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
