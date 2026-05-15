import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Wenai Dashboard',
  description: '本地订阅状态、模板市场和分享转化统计',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
