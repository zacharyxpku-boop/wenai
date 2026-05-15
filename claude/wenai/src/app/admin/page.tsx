import type { Metadata } from 'next';
import FounderAnalyticsClient from './FounderAnalyticsClient';

export const metadata: Metadata = {
  title: 'Wenai Founder Analytics',
  description: '本地使用数据看板',
};

export default function AdminIndex() {
  const enabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_ADMIN === 'true';
  return <FounderAnalyticsClient enabled={enabled} />;
}
