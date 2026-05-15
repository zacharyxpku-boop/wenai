import type { Metadata } from 'next';
import { ListingFactoryReviewPage } from '@/components/marketing/ListingFactorySections';

export const metadata: Metadata = {
  title: 'POC 复盘看板 | Wenai Listing Factory',
  description: '把试跑结果、Brief 质量、品牌风险和下一步生产建议放在同一张复盘表里。',
};

export default function ReviewPage() {
  return <ListingFactoryReviewPage />;
}
