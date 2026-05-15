'use client';

import { useEffect, useMemo, useState } from 'react';
import { readJsonStorage, writeJsonStorage } from '@/lib/browser-storage';
import { track } from '@/lib/local-analytics';
import {
  buildDeliveryPackage,
  createListingProject,
  createRunFromProject,
  loadListingFactoryRuns,
  saveListingFactoryRun,
} from '@/lib/listing-factory-engine';

const TEMPLATE_CONVERSION_KEY = 'wenai_template_conversions_v1';

function sectionBullets(markdown: string, title: string, limit = 4) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex(line => line.trim().toLowerCase() === `## ${title.toLowerCase()}`);
  if (start < 0) return [];
  const bullets: string[] = [];
  for (const line of lines.slice(start + 1)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) break;
    if (trimmed.startsWith('- ')) bullets.push(trimmed.slice(2));
    if (bullets.length >= limit) break;
  }
  return bullets;
}

function readLineValue(markdown: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return markdown.match(new RegExp(`^${escaped}[：:]\\s*(.+)$`, 'im'))?.[1]?.trim()
    || markdown.match(new RegExp(`^-\\s*${escaped}[：:]\\s*(.+)$`, 'im'))?.[1]?.trim()
    || '';
}

function parseSnapshot(value: string) {
  try {
    const decoded = decodeURIComponent(value || '');
    return JSON.parse(decoded) as { productName?: string; platforms?: string[]; goal?: string };
  } catch {
    return {};
  }
}

function extractMetric(markdown: string, label: 'CTR' | 'ROAS') {
  const line = markdown.split(/\r?\n/).find(item => item.toUpperCase().includes(`${label}：`) || item.toUpperCase().includes(`${label}:`));
  if (!line) return label === 'CTR' ? '待导入' : '待导入';
  const value = line.replace(/^-\s*/, '').split(/[：:]/).slice(1).join(':').trim();
  return value || '待导入';
}

function parseDecisionReport(content: string, templateSnapshot: string) {
  const snapshot = parseSnapshot(templateSnapshot);
  const projectName = readLineValue(content, '项目背景').replace(/正在面向.+$/, '').trim() || readLineValue(content, '项目') || snapshot.productName || '分享决策模板';
  const platforms = (readLineValue(content, '平台') || snapshot.platforms?.join(' / ') || 'TikTok')
    .split(/[\/,，、]/)
    .map(item => item.trim())
    .filter(Boolean);
  const decision = readLineValue(content, '核心结论') || '继续测';
  const confidence = readLineValue(content, '置信度') || '复制模板后用自己的数据生成置信度';
  const sample = readLineValue(content, '样本量判断') || '复制模板后用自己的数据重新判断';
  const evidence = sectionBullets(content, '为什么这样判断', 8);
  const actions = sectionBullets(content, '下一轮动作', 4);
  const learningCards = [
    ...sectionBullets(content, '当前最有参考价值的内容', 4),
    ...evidence.filter(item => /CTR|ROAS|CVR|样本|点击|曝光/.test(item)).slice(0, 2),
  ].filter(Boolean).slice(0, 2);
  return {
    projectName,
    platforms: platforms.length > 0 ? platforms : ['TikTok'],
    decision,
    confidence,
    sample,
    ctr: extractMetric(content, 'CTR'),
    roas: extractMetric(content, 'ROAS'),
    evidence,
    actions,
    learningCards,
    goal: snapshot.goal || actions[0] || '导入 CSV 后生成下一轮内容实验计划',
  };
}

function recordConversion(event: Record<string, unknown>) {
  const existing = readJsonStorage<Array<Record<string, unknown>>>(TEMPLATE_CONVERSION_KEY, []);
  writeJsonStorage(TEMPLATE_CONVERSION_KEY, [event, ...existing].slice(0, 100));
}

export default function ReportTemplateClient({
  shareId,
  title,
  content,
  createdAt,
  sourceProjectId,
  channel,
  templateSnapshot,
}: {
  shareId: string;
  title: string;
  content: string;
  createdAt: string;
  sourceProjectId: string;
  channel: string;
  templateSnapshot: string;
}) {
  const parsed = useMemo(() => parseDecisionReport(content, templateSnapshot), [content, templateSnapshot]);
  const [message, setMessage] = useState('复制模板后上传你的 CSV，生成自己的第一轮内容决策。');
  const [hasLocalWorkspace, setHasLocalWorkspace] = useState(() => typeof window !== 'undefined' && loadListingFactoryRuns().length > 0);
  const sourceLabel = `来自 ${sourceProjectId || parsed.projectName} 的决策模板`;

  useEffect(() => {
    track('page_view', { page: 'public_report', shareId, sourceProjectId, channel });
  }, [channel, shareId, sourceProjectId]);

  const copyTemplate = () => {
    try {
      const hadLocalWorkspace = loadListingFactoryRuns().length > 0;
      const now = new Date();
      const project = createListingProject({
        productName: `${parsed.projectName} 复制模板`,
        category: 'content decision template',
        targetPlatforms: parsed.platforms,
        priceBand: '待导入自己的商品价格',
        sellingPoints: parsed.learningCards.length > 0 ? parsed.learningCards : ['沿用这份报告里的实验结构'],
        targetAudience: '待导入自己的目标人群',
        contentGoal: parsed.goal,
        brandGuardrails: ['上传自己的 CSV 后再做投放动作', '每轮只改一个主变量，避免复盘失真'],
        categoryRules: ['保留 trackingCode', '保留 experimentCellId', '每轮只改一个主变量', '样本不足时继续跑 3 天'],
        competitorNotes: `使用公开报告 ${shareId} 的实验结构，原报告生成时间 ${createdAt}。`,
      }, now);
      const run = createRunFromProject(project, now);
      const templateRun = {
        ...run,
        performanceRecords: [],
        normalizedPlatformMetricRecords: [],
        activityLog: [
          { id: `activity-${now.getTime()}`, time: now.toISOString(), action: 'Copied public decision template', detail: title },
          ...run.activityLog,
        ].slice(0, 12),
      };
      saveListingFactoryRun({ ...templateRun, deliveryPackage: buildDeliveryPackage(templateRun) });
      setHasLocalWorkspace(true);
      recordConversion({
        type: 'templateConversion',
        shareId,
        sourceProjectId,
        channel: channel || 'unknown',
        templateSnapshot,
        targetProjectId: project.id,
        createdAt: now.toISOString(),
      });
      track('template_copied', { source: hadLocalWorkspace ? 'report_page' : 'public_link', shareId, sourceProjectId, channel: channel || 'unknown' });
      setMessage(hadLocalWorkspace ? '已创建工作台。现在导入你的 CSV，跑第一轮实验。' : '打开 Wenai 导入你的 CSV 继续跑。已在本地创建模板工作台。');
      window.setTimeout(() => {
        window.location.assign('/factory');
      }, 1200);
    } catch {
      setMessage('打开 Wenai 导入你的 CSV 继续跑。复制失败时，请刷新页面后重试。');
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="border-b border-slate-200 pb-6">
        <div className="text-[12px] font-bold uppercase tracking-wide text-amber-700">Wenai 决策报告</div>
        <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950">{sourceLabel}</h1>
        <p className="mt-3 text-[13px] text-slate-500">{title} / 分享 ID：{shareId} / {new Date(createdAt).toLocaleString('zh-CN')}</p>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-[12px] text-slate-500">项目结构（已脱敏）</div>
          <div className="mt-2 text-[18px] font-black text-slate-950">{parsed.projectName}</div>
          <p className="mt-2 text-[12px] text-slate-600">{parsed.platforms.join(' / ')}</p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <div className="text-[12px] text-amber-700">决策结论</div>
          <div className="mt-2 text-2xl font-black text-slate-950">{parsed.decision}</div>
          <p className="mt-2 text-[12px] text-slate-600">{parsed.confidence} / {parsed.sample}</p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-[12px] text-emerald-700">下一步</div>
          <div className="mt-2 text-[13px] font-bold leading-6 text-slate-900">{parsed.actions[0] || '复制模板后导入自己的 CSV。'}</div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-[14px] font-black text-slate-950">核心证据</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-4">
              <div className="text-[12px] text-slate-500">CTR</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{parsed.ctr}</div>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <div className="text-[12px] text-slate-500">ROAS</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{parsed.roas}</div>
            </div>
          </div>
          {(parsed.evidence.length > 0 ? parsed.evidence.slice(0, 3) : ['复制模板后上传自己的 CSV，即可生成专属证据链。']).map(item => (
            <p key={item} className="mt-3 text-[12px] leading-5 text-slate-700">{item}</p>
          ))}
        </div>
        <div className="rounded-md border border-violet-200 bg-violet-50 p-5">
          <h2 className="text-[14px] font-black text-slate-950">学习卡片摘要</h2>
          {(parsed.learningCards.length > 0 ? parsed.learningCards : ['模板会保留实验结构，方便你快速开始第一轮测试。']).map(item => (
            <p key={item} className="mt-3 text-[12px] leading-5 text-slate-700">{item}</p>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-md border border-amber-300 bg-amber-50 p-5 text-center">
        <p className="text-[13px] font-bold text-slate-800">{message}</p>
        {!hasLocalWorkspace && (
          <div className="mx-auto mt-3 max-w-2xl rounded-md bg-white px-4 py-3 text-[13px] leading-6 text-slate-700">
            Wenai 帮助跨境电商商家把每一轮内容实验变成可复用的增长资产。免费开始第一轮实验。
          </div>
        )}
        <button type="button" aria-label="复制这个决策模板，创建我的工作台" onClick={copyTemplate} className="mt-4 rounded-md bg-amber-600 px-5 py-3 text-[13px] font-black text-white hover:bg-amber-700">
          复制这个决策模板，创建我的工作台
        </button>
        {!hasLocalWorkspace && (
          <button type="button" onClick={() => { track('template_copied', { source: 'public_link', shareId, intent: 'landing_cta' }); window.location.href = `/?template=${encodeURIComponent(parsed.platforms[0] || 'tiktok')}`; }} className="ml-0 mt-3 rounded-md border border-amber-300 bg-white px-5 py-3 text-[13px] font-black text-amber-800 hover:border-amber-600 sm:ml-3 sm:mt-4">
            免费开始第一轮实验
          </button>
        )}
      </section>
    </main>
  );
}
