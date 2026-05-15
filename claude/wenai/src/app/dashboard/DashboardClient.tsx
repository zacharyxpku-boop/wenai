'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import { readJsonStorage, writeJsonStorage } from '@/lib/browser-storage';
import { saveEarlyBirdLead } from '@/lib/early-bird';
import { track } from '@/lib/local-analytics';
import {
  buildDeliveryPackage,
  createListingProject,
  createRunFromProject,
  loadListingFactoryRuns,
  saveListingFactoryRun,
} from '@/lib/listing-factory-engine';

type SubscriptionTier = 'Free' | 'Starter' | 'Growth';
type EarlyBirdTier = Exclude<SubscriptionTier, 'Free'>;

const USAGE_KEY = 'wenai_usage_state_v1';
const TEMPLATE_CONVERSION_KEY = 'wenai_template_conversions_v1';

type IndustryTemplate = {
  id: string;
  name: string;
  category: string;
  platforms: string[];
  contentGoal: string;
  copied: number;
  sellingPoints: string[];
  targetAudience: string;
  mappingRules: Array<{ header: string; field: string }>;
  experimentRules: string[];
};

const systemTemplates: IndustryTemplate[] = [
  {
    id: 'system-3c',
    name: '3C 数码 Hook 测试模板',
    category: '3C 数码',
    platforms: ['TikTok'],
    contentGoal: '测 hook',
    copied: 18,
    sellingPoints: ['前三秒痛点对比', '功能场景化演示', '价格锚点清晰'],
    targetAudience: '正在比较同类数码配件的 TikTok 用户',
    mappingRules: [
      { header: 'Campaign name', field: 'campaignName' },
      { header: 'Ad name', field: 'contentName' },
      { header: 'Tracking code', field: 'trackingCode' },
      { header: 'Cell ID', field: 'experimentCellId' },
      { header: 'Spend', field: 'spend' },
      { header: 'Impressions', field: 'impressions' },
      { header: 'Clicks', field: 'clicks' },
      { header: 'Orders', field: 'orders' },
      { header: 'Revenue', field: 'revenue' },
    ],
    experimentRules: ['每轮只改前三秒 hook', '保留同一 offer 和 CTA', '曝光不足 1000 不下结论'],
  },
  {
    id: 'system-fashion',
    name: '服装首屏 Hook 测试模板',
    category: '服装',
    platforms: ['TikTok'],
    contentGoal: '测 hook',
    copied: 12,
    sellingPoints: ['上身前后对比', '场景穿搭建议', '尺码顾虑解除'],
    targetAudience: '对版型、尺码和搭配有顾虑的 TikTok 用户',
    mappingRules: [
      { header: 'Campaign name', field: 'campaignName' },
      { header: 'Ad name', field: 'contentName' },
      { header: 'Tracking code', field: 'trackingCode' },
      { header: 'Cell ID', field: 'experimentCellId' },
      { header: 'Spend', field: 'spend' },
      { header: 'Impressions', field: 'impressions' },
      { header: 'Clicks', field: 'clicks' },
      { header: 'Orders', field: 'orders' },
      { header: 'Revenue', field: 'revenue' },
    ],
    experimentRules: ['首轮只测开头场景', '同一模特同一 offer', 'CTR 低于 0.5% 优先重做首屏'],
  },
  {
    id: 'system-beauty',
    name: '美妆痛点 Hook 测试模板',
    category: '美妆',
    platforms: ['TikTok'],
    contentGoal: '测 hook',
    copied: 21,
    sellingPoints: ['真实肤质痛点', '使用前后证据', '适用人群边界'],
    targetAudience: '正在寻找具体肤质解决方案的 TikTok 用户',
    mappingRules: [
      { header: 'Campaign name', field: 'campaignName' },
      { header: 'Ad name', field: 'contentName' },
      { header: 'Tracking code', field: 'trackingCode' },
      { header: 'Cell ID', field: 'experimentCellId' },
      { header: 'Spend', field: 'spend' },
      { header: 'Impressions', field: 'impressions' },
      { header: 'Clicks', field: 'clicks' },
      { header: 'Orders', field: 'orders' },
      { header: 'Revenue', field: 'revenue' },
    ],
    experimentRules: ['只测一个痛点表达', '不同时改价格和人群', 'CVR 低于 0.5% 检查 offer 或落地页'],
  },
];

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function loadUsage() {
  const parsed = readJsonStorage<{ month?: string; csvImports?: number } | null>(USAGE_KEY, null);
  return parsed?.month === currentMonthKey() ? { month: parsed.month, csvImports: parsed.csvImports || 0 } : { month: currentMonthKey(), csvImports: 0 };
}

function loadConversions(): Array<Record<string, unknown>> {
  return readJsonStorage<Array<Record<string, unknown>>>(TEMPLATE_CONVERSION_KEY, []);
}

function saveConversion(event: Record<string, unknown>) {
  const existing = loadConversions();
  writeJsonStorage(TEMPLATE_CONVERSION_KEY, [event, ...existing].slice(0, 100));
}

function createWorkspaceFromTemplate(template: IndustryTemplate) {
  const now = new Date();
  const project = createListingProject({
    productName: `${template.category} 实验项目`,
    category: template.category,
    targetPlatforms: template.platforms,
    priceBand: '待导入商品价格',
    sellingPoints: template.sellingPoints,
    targetAudience: template.targetAudience,
    contentGoal: template.contentGoal,
    brandGuardrails: ['导入自己的 CSV 后再做投放动作', '每轮只改一个主变量，避免复盘失真'],
    categoryRules: template.experimentRules,
    competitorNotes: `从行业模板 ${template.name} 创建；预设字段映射：${template.mappingRules.map(rule => `${rule.header}->${rule.field}`).join(' / ')}`,
  }, now);
  const run = createRunFromProject(project, now);
  saveListingFactoryRun({
    ...run,
    performanceRecords: [],
    normalizedPlatformMetricRecords: [],
    deliveryPackage: buildDeliveryPackage(run),
  });
  saveConversion({
    type: 'templateConversion',
    templateId: template.id,
    templateName: template.name,
    targetProjectId: project.id,
    createdAt: now.toISOString(),
  });
  return project;
}

export default function DashboardClient() {
  const router = useRouter();
  const [usage] = useState(() => loadUsage());
  const [runs, setRuns] = useState(() => loadListingFactoryRuns());
  const [conversions, setConversions] = useState(() => loadConversions());
  const [message, setMessage] = useState('选择一个行业模板，创建工作台后上传 CSV，就能生成第一轮内容实验决策。');
  const [earlyBirdTier, setEarlyBirdTier] = useState<EarlyBirdTier | null>(null);
  const [earlyBirdEmail, setEarlyBirdEmail] = useState('');

  useEffect(() => {
    track('page_view', { page: 'dashboard' });
  }, []);

  const openEarlyBird = (tier: EarlyBirdTier) => {
    setEarlyBirdTier(tier);
    setMessage(`${tier} 即将上线，留下邮箱获取早鸟优惠。`);
  };

  const submitEarlyBird = () => {
    if (!earlyBirdTier || !earlyBirdEmail.trim()) return;
    const result = saveEarlyBirdLead({ tier: earlyBirdTier, email: earlyBirdEmail, source: 'dashboard' });
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setEarlyBirdEmail('');
    setEarlyBirdTier(null);
    setMessage('已记录。Starter/Growth 上线后会优先通知你。当前仍为 Free 试用中。');
  };

  const startFromTemplate = (template: IndustryTemplate) => {
    const project = createWorkspaceFromTemplate(template);
    track('template_copied', { source: 'dashboard', templateId: template.id, templateName: template.name });
    setRuns(loadListingFactoryRuns());
    setConversions(loadConversions());
    setMessage(`已创建工作台：${project.productName}。现在导入你的 CSV，跑第一轮实验。`);
    router.push('/factory');
  };

  if (runs.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <OnboardingChecklist projectCount={0} />
        <section className="rounded-md border border-amber-200 bg-amber-50 p-6">
          <div className="text-[12px] font-black uppercase tracking-wide text-amber-700">Wenai Content Decision OS</div>
          <h1 className="mt-2 text-3xl font-black text-slate-950">从行业模板开始</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-700">
            选择一个模板创建第一个实验项目。模板已预设 TikTok 平台、测 hook 的内容目标和字段映射规则，下一步只需要上传 CSV。
          </p>
          <button type="button" onClick={() => startFromTemplate(systemTemplates[0])} className="mt-5 rounded-md bg-slate-950 px-5 py-3 text-[13px] font-black text-white">
            创建第一个实验项目
          </button>
        </section>
        <section className="mt-5 grid gap-4 md:grid-cols-3">
          {systemTemplates.map(template => (
            <button
              key={template.id}
              type="button"
              onClick={() => startFromTemplate(template)}
              className="rounded-md border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-amber-300 hover:bg-amber-50"
            >
              <div className="text-[16px] font-black text-slate-950">{template.name}</div>
              <p className="mt-2 text-[12px] font-bold text-amber-700">预设平台：{template.platforms.join(' / ')}</p>
              <p className="mt-1 text-[12px] font-bold text-slate-700">内容目标：{template.contentGoal}</p>
              <div className="mt-3 rounded-md bg-slate-50 p-3">
                <div className="text-[12px] font-black text-slate-900">预设字段映射规则</div>
                <p className="mt-2 text-[12px] leading-5 text-slate-600">
                  {template.mappingRules.slice(0, 5).map(rule => `${rule.header}→${rule.field}`).join(' / ')}
                </p>
              </div>
            </button>
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <OnboardingChecklist projectCount={runs.length} />
      <section className="rounded-md border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-[12px] font-black uppercase tracking-wide text-amber-700">Wenai Dashboard</div>
            <h1 className="mt-2 text-3xl font-black text-slate-950">订阅状态与模板市场</h1>
            <p className="mt-2 text-[13px] text-slate-600">当前档位：Free 试用中 / 本月 CSV 导入：{usage.csvImports}</p>
            <p className="mt-1 text-[12px] text-slate-500">Starter/Growth 即将开放，留下邮箱后优先通知；当前不会改变 Free 试用档位。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openEarlyBird('Starter')} className="rounded-md bg-slate-950 px-4 py-2 text-[12px] font-bold text-white">获取 Starter 上线通知</button>
            <button type="button" onClick={() => openEarlyBird('Growth')} className="rounded-md bg-amber-600 px-4 py-2 text-[12px] font-bold text-white">获取 Growth 上线通知</button>
          </div>
        </div>
        {earlyBirdTier && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="text-[13px] font-black text-slate-950">{earlyBirdTier} 即将上线，留下邮箱获取早鸟优惠</div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={earlyBirdEmail}
                onChange={event => setEarlyBirdEmail(event.target.value)}
                placeholder="you@company.com"
                className="min-h-10 flex-1 rounded-md border border-amber-200 px-3 text-[13px] outline-none focus:border-amber-500"
              />
              <button type="button" onClick={submitEarlyBird} className="min-h-10 rounded-md bg-slate-950 px-4 text-[12px] font-black text-white">提交邮箱</button>
              <button type="button" onClick={() => setEarlyBirdTier(null)} className="min-h-10 rounded-md border border-amber-200 px-4 text-[12px] font-bold text-slate-700">继续使用 Free</button>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><div className="text-[12px] text-slate-500">本地项目</div><div className="mt-1 text-2xl font-black">{runs.length}</div></div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><div className="text-[12px] text-slate-500">模板复制</div><div className="mt-1 text-2xl font-black">{conversions.length}</div></div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4"><div className="text-[12px] text-slate-500">分享转化</div><div className="mt-1 text-2xl font-black">{conversions.length > 0 ? '本地已记录' : '待产生'}</div></div>
      </section>

      <section className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-xl font-black text-slate-950">模板市场</h2>
        <p className="mt-2 text-[13px] text-slate-700">{message}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {systemTemplates.map(template => {
            const localCopies = conversions.filter(item => item.templateId === template.id).length;
            return (
              <article key={template.id} className="rounded-md border border-amber-100 bg-white p-4">
                <div className="text-[13px] font-black text-slate-950">{template.name}</div>
                <p className="mt-2 text-[12px] text-slate-600">{template.category} / {template.platforms.join(' / ')} / {template.contentGoal}</p>
                <p className="mt-2 text-[12px] text-slate-500">被复制 {template.copied + localCopies} 次</p>
                <button type="button" onClick={() => startFromTemplate(template)} className="mt-3 rounded-md bg-slate-950 px-3 py-2 text-[12px] font-bold text-white">复制模板</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-xl font-black text-slate-950">我复制过的模板</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {conversions.length === 0 && <p className="text-[13px] text-slate-600">还没有复制记录。</p>}
          {conversions.slice(0, 8).map((item, index) => (
            <div key={`${String(item.createdAt)}-${index}`} className="rounded-md border border-slate-100 bg-slate-50 p-3">
              <div className="text-[12px] font-bold text-slate-900">{String(item.templateName || item.sourceProjectId || '公开决策模板')}</div>
              <p className="mt-1 text-[11px] text-slate-500">{String(item.createdAt || '')}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
