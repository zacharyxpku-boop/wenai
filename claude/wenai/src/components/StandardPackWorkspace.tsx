'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  WORKFLOW_TEMPLATES,
  buildStandardPack,
  formatStandardPackFollowup,
  formatStandardPackMarkdown,
  formatStandardPackOpsBrief,
  formatStandardPackReport,
  getStandardPackExecutionPlan,
  recommendWorkflowId,
  type WorkflowId,
} from '@/lib/sop-workflows';

type DeliverableKind = 'pack' | 'report' | 'brief' | 'followup';

const DELIVERABLE_LABELS: Record<DeliverableKind, string> = {
  pack: '完整交付包',
  report: '老板验收摘要',
  brief: '内部执行说明',
  followup: '客户跟进话术',
};

export default function StandardPackWorkspace({ compact = false }: { compact?: boolean }) {
  const params = useSearchParams();
  const goalParam = params.get('goal') || '';
  const brandParam = params.get('brand') || '';
  const skuParam = params.get('sku') || '';
  const linksParam = params.get('links') || '';
  const workflowParam = params.get('workflow') || '';
  const initialWorkflowId = WORKFLOW_TEMPLATES.some(item => item.id === workflowParam)
    ? workflowParam as WorkflowId
    : '';
  const [goal, setGoal] = useState(goalParam);
  const [brand, setBrand] = useState(brandParam);
  const [sku, setSku] = useState(skuParam);
  const [links, setLinks] = useState(linksParam);
  const [workflowId, setWorkflowId] = useState<WorkflowId | ''>(initialWorkflowId);
  const [copied, setCopied] = useState(false);
  const [copiedDeliverable, setCopiedDeliverable] = useState<DeliverableKind | ''>('');
  const [deliverableKind, setDeliverableKind] = useState<DeliverableKind>('pack');

  const pack = useMemo(() => {
    const picked = workflowId || recommendWorkflowId(`${goal}\n${brand}\n${sku}\n${links}`);
    return buildStandardPack({ goal, brand, sku, links, workflowId: picked });
  }, [goal, brand, sku, links, workflowId]);

  const markdown = useMemo(() => formatStandardPackMarkdown(pack), [pack]);
  const reportMarkdown = useMemo(() => formatStandardPackReport(pack), [pack]);
  const briefMarkdown = useMemo(() => formatStandardPackOpsBrief(pack), [pack]);
  const followupMarkdown = useMemo(() => formatStandardPackFollowup(pack), [pack]);
  const deliverables = useMemo<Record<DeliverableKind, string>>(() => ({
    pack: markdown,
    report: reportMarkdown,
    brief: briefMarkdown,
    followup: followupMarkdown,
  }), [markdown, reportMarkdown, briefMarkdown, followupMarkdown]);
  const activeDeliverable = deliverables[deliverableKind];
  const executionPlan = useMemo(() => getStandardPackExecutionPlan(pack), [pack]);
  const hasInput = goal.trim() || brand.trim() || sku.trim() || links.trim();

  const copyPack = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const copyDeliverable = async (kind: DeliverableKind) => {
    await navigator.clipboard.writeText(deliverables[kind]);
    setCopiedDeliverable(kind);
    window.setTimeout(() => setCopiedDeliverable(''), 1400);
  };

  const downloadDeliverable = () => {
    const blob = new Blob([activeDeliverable], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `wenai-${deliverableKind}-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const applyExample = () => {
    setGoal('给 TikTok Shop 新上的厨房收纳 SKU 做 7 天内容测试, 先验证首帧 Hook 和使用场景。');
    setBrand('美区独立站 + TikTok Shop, 主打高客单家居整理, 目标人群是 25-40 岁女性。品牌语气要干净、可信、不过度夸张。');
    setSku('伸缩抽屉收纳盒。卖点: 免打孔、可调宽度、30 秒安装、让厨房抽屉从混乱变整齐。');
    setLinks('待补: 3 条 TikTok 参考视频、2 个 Instagram 家居整理账号、1 个 Amazon 同类 listing。');
    setWorkflowId('slideshow-batch');
  };

  return (
    <div className={compact ? 'h-full overflow-auto bg-bg-root p-6' : 'min-h-screen bg-bg-root'}>
      <div className={compact ? 'max-w-[1120px] mx-auto' : 'max-w-[1120px] mx-auto px-6 py-8'}>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-[11px] font-mono text-text-tertiary">
            <Link href="/" className="hover:text-accent">首页</Link>
            <span>/</span>
            <span>SOP 标品引擎</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary font-[family-name:var(--font-outfit)] mb-3">
            标准交付包工作台
          </h1>
          <p className="max-w-[780px] text-[14px] text-text-secondary leading-relaxed">
            用户不需要懂 SOP 或 skill。填目标、品牌、SKU 和参考链接，系统自动选择 workflow，
            输出固定结构的电商宣传标品: 内容拆解、脚本、素材清单、测试排期和验收边界。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
          <section className="border border-border-subtle rounded-lg bg-bg-surface/35 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-mono text-accent uppercase tracking-wider">Step 1</div>
                <h2 className="text-[16px] font-semibold text-text-primary mt-1">输入最少必要信息</h2>
              </div>
              <button
                onClick={applyExample}
                className="text-[11px] font-mono text-accent border border-accent/30 rounded px-2.5 py-1 hover:bg-accent/10"
              >
                填入示例
              </button>
            </div>

            <Field label="增长目标">
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                rows={4}
                placeholder="例: 给 TikTok Shop 新上的厨房收纳 SKU 做 7 天内容测试, 先验证 hook 和使用场景。"
                className="w-full px-3 py-2 bg-bg-root border border-border-default rounded-md text-[13px] resize-none"
              />
            </Field>

            <Field label="品牌 / 店铺上下文">
              <textarea
                value={brand}
                onChange={e => setBrand(e.target.value)}
                rows={3}
                placeholder="例: 美区独立站, 主打高客单家居整理, 目标人群 25-40 岁女性。"
                className="w-full px-3 py-2 bg-bg-root border border-border-default rounded-md text-[13px] resize-none"
              />
            </Field>

            <Field label="SKU / 卖点">
              <textarea
                value={sku}
                onChange={e => setSku(e.target.value)}
                rows={3}
                placeholder="例: 伸缩抽屉收纳盒, 卖点是免打孔、可调宽度、30 秒安装。"
                className="w-full px-3 py-2 bg-bg-root border border-border-default rounded-md text-[13px] resize-none"
              />
            </Field>

            <Field label="参考链接 / 账号">
              <textarea
                value={links}
                onChange={e => setLinks(e.target.value)}
                rows={3}
                placeholder="例: TikTok 视频链接、Instagram 账号、Amazon listing。没有就写待补。"
                className="w-full px-3 py-2 bg-bg-root border border-border-default rounded-md text-[13px] resize-none"
              />
            </Field>

            <Field label="手动指定 workflow">
              <select
                value={workflowId}
                onChange={e => setWorkflowId(e.target.value as WorkflowId | '')}
                className="w-full px-3 py-2 bg-bg-root border border-border-default rounded-md text-[13px]"
              >
                <option value="">自动推荐</option>
                {WORKFLOW_TEMPLATES.map(item => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </Field>

            <div className="rounded-md border border-accent/30 bg-accent/10 p-3">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">推荐 workflow</div>
              <div className="text-[14px] font-semibold text-text-primary">{pack.workflow.label}</div>
              <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">{pack.workflow.whenToUse}</p>
            </div>

            <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">POC readiness</div>
                  <div className="text-[14px] font-semibold text-text-primary">{pack.readiness.label}</div>
                  <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">{pack.readiness.stageLabel}</p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[18px] font-bold text-accent tabular-nums">{pack.readiness.acceptanceScore}</div>
                  <div className="text-[9px] text-text-tertiary">ACCEPT</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <ScorePill label="线索分" value={pack.readiness.leadScore} />
                <ScorePill label="验收准备" value={pack.readiness.acceptanceScore} />
                <ScorePill label="合同准备" value={pack.readiness.contractReadiness} />
              </div>
              {pack.readiness.blockers.length > 0 && (
                <div className="mt-3 space-y-1">
                  {pack.readiness.blockers.slice(0, 3).map(item => (
                    <div key={item} className="text-[11px] text-text-secondary leading-relaxed">
                      {item}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 rounded-md border border-accent/20 bg-accent/5 p-2.5">
                <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">Next move</div>
                <div className="text-[12px] text-text-primary leading-relaxed">{pack.readiness.nextStepLabel}</div>
              </div>
            </div>

            {pack.missingInputs.length > 0 && (
              <div className="rounded-md border border-error/30 bg-error/5 p-3">
                <div className="text-[10px] font-mono text-error uppercase tracking-wider mb-2">缺料清单</div>
                <div className="flex flex-wrap gap-1.5">
                  {pack.missingInputs.map(item => (
                    <span key={item} className="text-[10px] font-mono border border-error/25 text-error rounded px-1.5 py-0.5">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyPack}
                disabled={!hasInput}
                className="px-4 py-2 bg-accent text-bg-root rounded-md text-[12px] font-semibold hover:bg-accent-hover disabled:opacity-50"
              >
                {copied ? '已复制' : '复制标品交付包'}
              </button>
              <Link
                href="/pipelines/video-teardown"
                className="px-4 py-2 border border-border-default rounded-md text-[12px] font-mono text-text-primary hover:border-accent/40"
              >
                拆参考视频
              </Link>
              <Link
                href="/inquire?from=standard-pack&platform=tiktok&skuCount=10"
                className="px-4 py-2 border border-accent/40 rounded-md text-[12px] font-mono text-accent hover:bg-accent/10"
              >
                提交 POC
              </Link>
            </div>

            <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">客户可直接拿走的产物</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  ['report', '给老板看: 是否值得继续接入'],
                  ['brief', '给运营做: 按什么清单交付'],
                  ['followup', '给销售发: 下一封跟进话术'],
                  ['pack', '给团队存档: 完整标准包'],
                ] as Array<[DeliverableKind, string]>).map(([kind, desc]) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => {
                      setDeliverableKind(kind);
                      void copyDeliverable(kind);
                    }}
                    disabled={!hasInput}
                    className="text-left rounded border border-border-subtle bg-bg-surface/35 p-2.5 hover:border-accent/40 disabled:opacity-50"
                  >
                    <div className="text-[11px] font-semibold text-text-primary">{DELIVERABLE_LABELS[kind]}</div>
                    <div className="mt-1 text-[10px] text-text-tertiary leading-relaxed">{desc}</div>
                    <div className="mt-2 text-[10px] font-mono text-accent">
                      {copiedDeliverable === kind ? '已复制' : '点击复制'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-accent/30 bg-accent/10 p-3">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-2">推荐执行入口</div>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[14px] font-semibold text-text-primary">{executionPlan.primaryPipeline.label}</div>
                  <p className="mt-1 text-[11px] text-text-secondary leading-relaxed max-w-[520px]">
                    {executionPlan.primaryPipeline.reason}
                  </p>
                </div>
                <Link
                  href={executionPlan.primaryPipeline.href}
                  className="text-[11px] font-mono text-bg-root bg-accent rounded px-3 py-1.5 hover:bg-accent-hover"
                >
                  开始执行 →
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {executionPlan.supportingPipelines.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[10px] font-mono text-text-primary border border-border-default rounded px-2 py-1 hover:border-accent/40"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="border border-border-subtle rounded-lg bg-bg-surface/20 p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Standardized output</div>
                <h2 className="text-[16px] font-semibold text-text-primary mt-1">用户可直接执行的标品输出</h2>
              </div>
              <span className="text-[9px] font-mono text-accent border border-accent/35 rounded px-1.5 py-0.5">
                {pack.workflow.shortLabel}
              </span>
            </div>

            <div className="space-y-3">
              <div className="rounded-md border border-accent/25 bg-accent/10 p-3">
                <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-2">POC 判断</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Metric label="线索分" value={`${pack.readiness.leadScore}/100`} />
                  <Metric label="验收准备" value={`${pack.readiness.acceptanceScore}/100`} />
                  <Metric label="合同准备" value={`${pack.readiness.contractReadiness}/100`} />
                  <Metric label="下一步" value={pack.readiness.label} />
                </div>
              </div>
              <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
                <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-2">商业推进</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">阶段判断</div>
                    <div className="text-[12px] text-text-primary leading-relaxed">{pack.readiness.stageLabel}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">建议动作</div>
                    <div className="text-[12px] text-text-primary leading-relaxed">{pack.readiness.nextStepLabel}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">签约阻塞</div>
                    <ul className="space-y-1">
                      {(pack.readiness.contractBlockers.length > 0 ? pack.readiness.contractBlockers : ['暂无关键签约阻塞']).map(item => (
                        <li key={item} className="text-[12px] text-text-secondary leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">签约信号</div>
                    <ul className="space-y-1">
                      {(pack.readiness.contractSignals.length > 0 ? pack.readiness.contractSignals : ['当前还没有明确签约信号']).map(item => (
                        <li key={item} className="text-[12px] text-text-secondary leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
                <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-2">执行路线</div>
                <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-3">
                  <div>
                    <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">主入口</div>
                    <Link href={executionPlan.primaryPipeline.href} className="text-[12px] text-accent hover:text-accent-hover">
                      {executionPlan.primaryPipeline.label} →
                    </Link>
                    <p className="mt-1 text-[11px] text-text-secondary leading-relaxed">{executionPlan.primaryPipeline.reason}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">客户四步走</div>
                    <ol className="space-y-1">
                      {executionPlan.customerSteps.map((item, index) => (
                        <li key={item} className="text-[12px] text-text-secondary leading-relaxed">
                          <span className="font-mono text-accent mr-1">{index + 1}.</span>{item}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
              {pack.sections.map(section => (
                <div key={section.title} className="rounded-md border border-border-subtle bg-bg-root/45 p-3">
                  <div className="text-[11px] font-mono text-accent uppercase tracking-wider mb-2">{section.title}</div>
                  <ul className="space-y-1.5">
                    {section.body.map(item => (
                      <li key={item} className="text-[12px] text-text-secondary leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
            <div className="text-[10px] font-mono text-text-tertiary">可直接复制的交付内容</div>
                  <select
                    value={deliverableKind}
                    onChange={e => setDeliverableKind(e.target.value as DeliverableKind)}
                    className="px-2 py-1 bg-bg-root border border-border-subtle rounded text-[10px] font-mono text-text-primary"
                  >
                    {Object.entries(DELIVERABLE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyDeliverable(deliverableKind)}
                    disabled={!hasInput}
                    className="text-[10px] font-mono text-accent border border-accent/30 rounded px-2 py-1 hover:bg-accent/10 disabled:opacity-50"
                  >
                    {copiedDeliverable === deliverableKind ? '已复制' : '复制当前产物'}
                  </button>
                  <button
                    type="button"
                    onClick={downloadDeliverable}
                    disabled={!hasInput}
                    className="text-[10px] font-mono text-text-primary border border-border-default rounded px-2 py-1 hover:border-accent/40 disabled:opacity-50"
                  >
                    下载 .md
                  </button>
                </div>
              </div>
              <pre className="max-h-[260px] whitespace-pre-wrap rounded-md border border-border-subtle bg-bg-root/65 p-4 text-[11px] leading-relaxed text-text-tertiary overflow-auto">
                {hasInput ? activeDeliverable : '填入信息后, 这里会生成可复制、可下载、可直接发给客户或团队的标准产物。'}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-mono text-text-secondary mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border-subtle rounded bg-bg-surface/40 px-2 py-1.5">
      <div className="text-[9px] font-mono text-text-tertiary uppercase">{label}</div>
      <div className="text-[13px] font-bold text-text-primary font-mono tabular-nums">{value}/100</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border-subtle rounded bg-bg-root/45 p-2">
      <div className="text-[9px] font-mono text-text-tertiary uppercase">{label}</div>
      <div className="mt-1 text-[12px] font-semibold text-text-primary">{value}</div>
    </div>
  );
}
