import type { Metadata } from 'next';
import { ListingFactoryCalendarPage } from '@/components/marketing/ListingFactorySections';

export const metadata: Metadata = {
  title: '内容日历 | Wenai Listing Factory',
  description: '把 Brief 从资产库排进未来 7 天的内容生产与分发计划。',
};

export default function CalendarPage() {
  return <ListingFactoryCalendarPage />;
}
