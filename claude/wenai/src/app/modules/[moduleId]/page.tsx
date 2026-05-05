import { notFound } from 'next/navigation';
import AIWorkspace from '@/components/AIWorkspace';
import VideoWorkspace from '@/components/VideoWorkspace';
import TranslateWorkspace from '@/components/TranslateWorkspace';
import StandardPackWorkspace from '@/components/StandardPackWorkspace';
import modulesConfig from '@/config/modules.json';
import clientConfig from '@/config/client.json';

const moduleFields: Record<string, { key: string; label: string; placeholder: string }[]> = {
  translate: [
    { key: 'targetLang', label: '目标语言', placeholder: '英语 / English' },
  ],
  content: [
    { key: 'mode', label: '生成模式', placeholder: 'single（深度单篇） / matrix（3平台×3角度批量矩阵）' },
    { key: 'platforms', label: '目标平台', placeholder: '小红书+TikTok / 全平台 / 仅Instagram...' },
  ],
  outreach: [
    { key: 'influencer', label: '达人信息', placeholder: '达人名称、平台、粉丝量...' },
    { key: 'product', label: '产品信息', placeholder: '产品名称、卖点...' },
    { key: 'cooperation', label: '合作方式', placeholder: '寄样试用 / 佣金合作...' },
  ],
  livestream: [
    { key: 'product', label: '产品信息', placeholder: '产品名称、价格、卖点...' },
    { key: 'platform', label: '直播平台', placeholder: 'TikTok Shop US / Shopee SG / 抖音...' },
    { key: 'audience', label: '目标人群', placeholder: '25-35岁女性 / 家庭主妇...' },
  ],
  positioning: [
    { key: 'platform', label: '目标平台', placeholder: 'TikTok Shop / Shopee Live / Amazon Live...' },
    { key: 'resources', label: '当前资源', placeholder: '供应链/预算/团队规模/已有账号...' },
  ],
  'customer-service': [
    { key: 'shopInfo', label: '店铺信息', placeholder: '店铺类型、主营品类、退换政策...' },
  ],
  'private-domain': [
    { key: 'scenario', label: '场景类型', placeholder: 'Welcome / Abandoned Cart / Post-Purchase / Winback / VIP' },
    { key: 'market', label: '目标市场', placeholder: 'US / SEA / EU / JP...' },
    { key: 'product', label: '产品信息', placeholder: '产品名称、客单价、复购周期...' },
  ],
  'data-insights': [
    { key: 'context', label: '业务背景', placeholder: '品类、阶段、当前问题、分析目标...' },
  ],
  'ad-optimizer': [
    { key: 'platform', label: '投放平台', placeholder: 'TikTok Ads / Meta / Google Ads / Amazon Ads' },
    { key: 'goal', label: '业务目标', placeholder: '降低CPA / 提升ROAS / 扩量 / 新品冷启...' },
  ],
};

const csvEnabledModules = new Set(['translate', 'copywriting', 'outreach', 'reviews']);

const modulePlaceholders: Record<string, string> = {
  translate: '请输入需要翻译的商品信息（标题、描述、卖点等）...',
  outreach: '请输入额外的合作需求或补充说明...',
  reviews: '请粘贴商品评论（支持多条，每条一行）...',
  video: '请描述您的视频需求（产品、风格、时长、平台）...',
  copywriting: '请输入商品信息（名称、品类、价格、核心卖点、目标人群）...',
  content: '请输入产品信息（名称、卖点、目标人群、使用场景）...',
  images: '请输入商品信息（名称、品类、风格定位、参考竞品）...',
  livestream: '请输入额外的直播需求说明...',
  positioning: '请输入商品/品牌信息（品类、核心卖点、品牌故事、价格带）...',
  competitor: '请输入竞品信息（链接、名称、价格、或任何已知信息）...',
  selection: '请输入品类方向或选品需求...',
  operations: '请输入店铺/产品现状（品类、日均销量、客单价、当前问题）...',
  'customer-service': '请输入客户咨询内容...',
  leads: '请描述目标客户画像（行业、规模、地区、预算）...',
  'private-domain': '补充说明（老客标签、已发过的内容、品牌Tone）...',
  'data-insights': '请粘贴数据（CSV/表格/截图文字）或描述现状指标...',
  'ad-optimizer': '请粘贴广告报表数据或描述账户现状（花费、CTR、CPA、ROAS...）',
};

interface PageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModulePage({ params }: PageProps) {
  const { moduleId } = await params;
  const mod = modulesConfig.modules.find(m => m.id === moduleId);
  const enabledIds = new Set(clientConfig.enabledModules);

  if (!mod || !enabledIds.has(moduleId)) {
    notFound();
  }

  // Specialized workspaces
  if (moduleId === 'translate') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <TranslateWorkspace />
      </div>
    );
  }

  if (moduleId === 'video') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <VideoWorkspace />
      </div>
    );
  }

  if (moduleId === 'standard-pack') {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <StandardPackWorkspace compact />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <AIWorkspace
        moduleId={mod.id}
        moduleName={`${mod.name} · ${mod.nameEn}`}
        modulePrompt={mod.prompt}
        placeholder={modulePlaceholders[mod.id] || '请输入内容...'}
        fields={moduleFields[mod.id]}
        supportCSV={csvEnabledModules.has(mod.id)}
        assistOnly={(mod as Record<string, unknown>).assistOnly === true}
        assistOnlyReason={(mod as Record<string, unknown>).assistOnlyReason as string | undefined}
      />
    </div>
  );
}

export async function generateStaticParams() {
  return modulesConfig.modules.map(m => ({ moduleId: m.id }));
}
