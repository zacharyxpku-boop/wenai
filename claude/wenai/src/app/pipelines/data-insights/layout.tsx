import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '数据洞察 · 粘贴销量数据 → AI 解读异常 + 行动建议 — Wenai',
  description:
    '测完款投放完, 把数据贴这, AI 帮你诊断:为啥点击下滑/转化低/退货高, 给具体的改图/调价/换词建议。',
};

export default function DataInsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
