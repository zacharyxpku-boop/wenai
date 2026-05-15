import type { Metadata } from 'next';
import { ListingFactoryInsightLibraryPage } from '@/components/marketing/ListingFactorySections';

export const metadata: Metadata = {
  title: '类目洞察库 | Wenai Listing Factory',
  description: '沉淀不同类目、平台和内容结构的可复用经验，让上新不再从零开始。',
};

export default function InsightsPage() {
  return <ListingFactoryInsightLibraryPage />;
}
