'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';
import { CATEGORIES, type CategoryId } from '@/lib/category-prompts';
import modulesConfig from '@/config/modules.json';

type StepId = 'translate' | 'copywriting' | 'ip-compliance';

interface StepState {
  status: 'idle' | 'running' | 'done' | 'error';
  result: string;
  error?: string;
}

const STEPS: { id: StepId; label: string; icon: string; desc: string; accent: string }[] = [
  {
    id: 'translate',
    label: '多语言翻译',
    icon: '🌐',
    desc: '英 / 日 / 韩 / 西 / 德 五语同步',
    accent: '#c8975a',
  },
  {
    id: 'copywriting',
    label: '商品文案',
    icon: '✍️',
    desc: '标题 + 5 点描述 + 长描述',
    accent: '#6ea8d7',
  },
  {
    id: 'ip-compliance',
    label: '侵权合规扫描',
    icon: '🛡️',
    desc: '商标冲突 + 认证清单 + 违规词',
    accent: '#9b8ec4',
  },
];

// 批量模式每条 SKU 的处理状态
interface BatchRow {
  id: string;
  skuPreview: string;
  fullInput: string;
  results: Record<StepId, string>;
  status: 'pending' | 'running' | 'done' | 'error';
  currentStep?: StepId;
  error?: string;
}

function NewListingPipelineInner() {
  const params = useSearchParams();
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [skuInput, setSkuInput] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [phase2Clicked, setPhase2Clicked] = useState(false);

  // 批量模式状态
  const [batchInput, setBatchInput] = useState('');
  const [batchRows, setBatchRows] = useState<BatchRow[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchRunning, setBatchRunning] = useState(false);
  const batchAbortRef = useRef<boolean>(false);

  const [states, setStates] = useState<Record<StepId, StepState>>({
    translate: { status: 'idle', result: '' },
    copywriting: { status: 'idle', result: '' },
    'ip-compliance': { status: 'idle', result: '' },
  });

  const [demoBanner, setDemoBanner] = useState(false);
  const abortControllers = useRef<Record<StepId, AbortController | null>>({
    translate: null,
    copywriting: null,
    'ip-compliance': null,
  });

  const isRunning = Object.values(states).some(s => s.status === 'running');
  const allDone = Object.values(states).every(s => s.status === 'done');
  const canStart = category && skuInput.trim().length > 10 && !isRunning;

  // 新手 demo 路径 · /?demo=1 自动灌入示例 SKU + 自动触发
  useEffect(() => {
    if (params.get('demo') === '1') {
      const homeCategory = CATEGORIES.find(c => c.id === 'home');
      if (homeCategory) {
        setCategory('home');
        setSkuInput(homeCategory.exampleSku);
        setDemoBanner(true);
        // 等 state 提交再触发
        setTimeout(() => {
          // 不依赖 canStart（因为 state 还没刷新），直接跑 3 步
          STEPS.forEach(s => runStep(s.id));
        }, 200);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runStep = async (stepId: StepId) => {
    const mod = modulesConfig.modules.find(m => m.id === stepId);
    if (!mod) return;

    const controller = new AbortController();
    abortControllers.current[stepId] = controller;

    setStates(s => ({ ...s, [stepId]: { status: 'running', result: '' } }));

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'x-from-pipeline': '1', // 跳过 per-module 限额，走 Pipeline 级配额
        },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: mod.prompt,
          input: skuInput + (stepId === 'translate' ? '\n\n目标语言：英语 日语 韩语 西班牙语 德语' : ''),
          moduleId: stepId,
          category,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Try SSE stream
      const reader = res.body?.getReader();
      if (!reader) {
        const data = await res.json();
        setStates(s => ({
          ...s,
          [stepId]: { status: 'done', result: data.content || '(empty)' },
        }));
        return;
      }

      const decoder = new TextDecoder();
      let finalContent = '';
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.content) {
              finalContent = parsed.content;
              setStates(s => ({
                ...s,
                [stepId]: { status: 'running', result: parsed.content },
              }));
            }
          } catch {}
        }
      }

      setStates(s => ({
        ...s,
        [stepId]: { status: 'done', result: finalContent },
      }));
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setStates(s => ({
        ...s,
        [stepId]: {
          status: 'error',
          result: '',
          error: err instanceof Error ? err.message : '未知错误',
        },
      }));
    }
  };

  const handleStart = async () => {
    // 先预占 Pipeline 级配额，不够不启动
    try {
      const check = await fetch('/api/ratelimit/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'pipeline:new-listing' }),
      });
      if (!check.ok) {
        const data = await check.json().catch(() => ({}));
        alert(`Pipeline 配额已达上限\n${data.resetAtText ? '将于 ' + data.resetAtText + ' 重置' : ''}\n升级 Team 版可扩到 50 次/天`);
        return;
      }
    } catch {
      // 配额接口不可用不 block Pipeline，让 /api/ai 后端自己决定
    }
    // 并行触发 3 步
    STEPS.forEach(s => runStep(s.id));
  };

  const handleStopAll = () => {
    Object.values(abortControllers.current).forEach(c => c?.abort());
  };

  const handleExportExcel = () => {
    const cat = CATEGORIES.find(c => c.id === category);
    const wb = XLSX.utils.book_new();

    // Sheet 1: 概览
    const overview = [
      ['字段', '内容'],
      ['品类', cat?.label || ''],
      ['生成时间', new Date().toLocaleString('zh-CN')],
      ['原始 SKU', skuInput],
      [],
      ['模块', '状态', '字符数'],
      ['多语言翻译', states.translate.status, states.translate.result.length],
      ['商品文案', states.copywriting.status, states.copywriting.result.length],
      ['侵权合规', states['ip-compliance'].status, states['ip-compliance'].result.length],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overview), '概览');

    // Sheet 2/3/4: 每步独立 sheet，分行保留结构
    const addSheet = (name: string, content: string) => {
      const rows = content.split('\n').map(line => [line]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['内容'], ...rows]), name);
    };
    addSheet('翻译', states.translate.result || '(空)');
    addSheet('文案', states.copywriting.result || '(空)');
    addSheet('合规', states['ip-compliance'].result || '(空)');

    XLSX.writeFile(wb, `wenai-new-listing-${Date.now()}.xlsx`);
  };

  const handleExport = () => {
    const cat = CATEGORIES.find(c => c.id === category);
    const md = `# 新品上新 · ${cat?.label || ''} · Pipeline 产出

> Generated by wenai · ${new Date().toLocaleString('zh-CN')}

## 原始商品信息
\`\`\`
${skuInput}
\`\`\`

## 1. 多语言翻译
${states.translate.result || '(空)'}

---

## 2. 商品文案
${states.copywriting.result || '(空)'}

---

## 3. 侵权合规扫描
${states['ip-compliance'].result || '(空)'}

---

*wenai · 跨境代运营新品上新流水线 · 品类：${cat?.label}*
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-new-listing-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 分享到公开只读链接(给老板看)
  const [sharing, setSharing] = useState(false);
  const handleShare = async () => {
    setSharing(true);
    try {
      const cat = CATEGORIES.find(c => c.id === category);
      const md = `## 多语言翻译\n\n${states.translate.result}\n\n---\n\n## 商品文案\n\n${states.copywriting.result}\n\n---\n\n## 侵权合规扫描\n\n${states['ip-compliance'].result}`;
      const title = `${cat?.label || ''} · ${skuInput.split('\n')[0].slice(0, 50)}`;
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'pipeline-01',
          source: 'pipeline-01',
          title,
          content: md,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error || '分享失败');
      const fullUrl = `${window.location.origin}/share/${data.id}`;
      const nav = navigator as Navigator & { share?: (data: { title: string; url: string }) => Promise<void> };
      if (typeof nav !== 'undefined' && typeof nav.share === 'function') {
        try {
          await nav.share({ title: 'wenai · 跨境新品 Pipeline 产出', url: fullUrl });
          return;
        } catch { /* fallback to clipboard */ }
      }
      await nav.clipboard.writeText(fullUrl);
      alert('链接已复制到剪贴板\n' + fullUrl + '\n\n7 天有效,可直接发给老板');
    } catch (err) {
      alert('分享失败: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSharing(false);
    }
  };

  // ============================================================
  // 批量模式 · 串行处理多个 SKU（避免并发撞 API 速率）
  // ============================================================

  const parseBatchInput = (text: string): { id: string; preview: string; full: string }[] => {
    // 以 --- 分隔符或空行 × 2 切分
    const blocks = text.split(/\n-{3,}\n|\n\n\n+/).map(s => s.trim()).filter(Boolean);
    return blocks.slice(0, 20).map((block, i) => ({
      id: `sku_${Date.now()}_${i}`,
      preview: block.split('\n')[0].slice(0, 50),
      full: block,
    }));
  };

  // 单条重试 · 给批量失败的 SKU 重跑 (不再走整个配额预占)
  const handleRetryOne = async (rowId: string) => {
    const row = batchRows.find(r => r.id === rowId);
    if (!row || batchRunning) return;
    // 预占 1 次配额
    try {
      const check = await fetch('/api/ratelimit/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'pipeline:new-listing' }),
      });
      if (!check.ok) {
        const d = await check.json().catch(() => ({}));
        alert(`配额不足无法重试\n${d.resetAtText || ''}`);
        return;
      }
    } catch {}

    setBatchRows(rows => rows.map(r => r.id === rowId ? { ...r, status: 'running', error: undefined } : r));
    const result = await runOneBatchRow(row);
    setBatchRows(rows => rows.map(r => r.id === rowId ? result : r));
  };

  const runOneBatchRow = async (row: BatchRow): Promise<BatchRow> => {
    const results: Record<StepId, string> = { translate: '', copywriting: '', 'ip-compliance': '' };

    for (const step of STEPS) {
      if (batchAbortRef.current) {
        return { ...row, results, status: 'error', error: '用户取消' };
      }
      const mod = modulesConfig.modules.find(m => m.id === step.id);
      if (!mod) continue;

      try {
        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-from-pipeline': '1', // 批量也走 Pipeline 额度
          },
          body: JSON.stringify({
            prompt: mod.prompt,
            input: row.fullInput + (step.id === 'translate' ? '\n\n目标语言：英语 日语 韩语 西班牙语 德语' : ''),
            moduleId: step.id,
            category,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        results[step.id] = data.content || '';
      } catch (err) {
        return {
          ...row,
          results,
          status: 'error',
          error: err instanceof Error ? err.message : '未知错误',
        };
      }
    }

    return { ...row, results, status: 'done' };
  };

  const handleBatchStart = async () => {
    if (!category) return alert('先选品类');
    const parsed = parseBatchInput(batchInput);
    if (parsed.length === 0) return alert('请粘贴至少 1 条 SKU（多条用三连字符 --- 分隔）');

    batchAbortRef.current = false;
    setBatchRunning(true);
    setBatchProgress({ current: 0, total: parsed.length });

    const initialRows: BatchRow[] = parsed.map(p => ({
      id: p.id,
      skuPreview: p.preview,
      fullInput: p.full,
      results: { translate: '', copywriting: '', 'ip-compliance': '' },
      status: 'pending',
    }));
    setBatchRows(initialRows);

    for (let i = 0; i < initialRows.length; i++) {
      if (batchAbortRef.current) break;
      const row = initialRows[i];

      // 每条 SKU 独立预占 1 次 Pipeline 配额（修复之前只扣 1 次的 bug）
      try {
        const check = await fetch('/api/ratelimit/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'pipeline:new-listing' }),
        });
        if (!check.ok) {
          const data = await check.json().catch(() => ({}));
          alert(`第 ${i + 1} 条 SKU 前触发配额上限\n已完成 ${i} 条\n${data.resetAtText ? '将于 ' + data.resetAtText + ' 重置' : ''}\n升级 Team 可扩到 500 次/天`);
          break;
        }
      } catch {}

      setBatchRows(rows => rows.map(r => r.id === row.id ? { ...r, status: 'running' } : r));
      const result = await runOneBatchRow(row);
      setBatchRows(rows => rows.map(r => r.id === row.id ? result : r));
      setBatchProgress({ current: i + 1, total: initialRows.length });
    }

    setBatchRunning(false);
  };

  const handleBatchStop = () => {
    batchAbortRef.current = true;
  };

  const handleBatchExport = () => {
    const cat = CATEGORIES.find(c => c.id === category);
    const wb = XLSX.utils.book_new();

    // Sheet 1: 概览
    const overview: (string | number)[][] = [
      ['wenai · 新品上新 Pipeline · 批量产出'],
      ['品类', cat?.label || ''],
      ['生成时间', new Date().toLocaleString('zh-CN')],
      ['SKU 总数', batchRows.length],
      ['成功', batchRows.filter(r => r.status === 'done').length],
      ['失败', batchRows.filter(r => r.status === 'error').length],
      [],
      ['#', 'SKU 首行', '翻译长度', '文案长度', '合规长度', '状态'],
      ...batchRows.map((r, i) => [
        i + 1,
        r.skuPreview,
        r.results.translate.length,
        r.results.copywriting.length,
        r.results['ip-compliance'].length,
        r.status,
      ]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overview), '概览');

    // Sheet 2/3/4: 每步汇总一张表，行 = SKU
    const makeStepSheet = (step: StepId, title: string) => {
      const rows: string[][] = [['#', 'SKU 首行', '原始输入', title]];
      batchRows.forEach((r, i) => {
        rows.push([String(i + 1), r.skuPreview, r.fullInput, r.results[step] || '']);
      });
      const ws = XLSX.utils.aoa_to_sheet(rows);
      // 列宽
      ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 50 }, { wch: 80 }];
      XLSX.utils.book_append_sheet(wb, ws, title);
    };
    makeStepSheet('translate', '翻译');
    makeStepSheet('copywriting', '文案');
    makeStepSheet('ip-compliance', '合规');

    XLSX.writeFile(wb, `wenai-batch-${Date.now()}.xlsx`);
  };

  // Pipeline 03 已上线,原兴趣记录函数保留供 phase2Clicked state 引用合法性
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handlePhase2Interest = () => { setPhase2Clicked(true); };

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
      {/* HotClaw 三段式 · 顶部产品页结构 */}
      <div className="mb-6 border border-border-subtle rounded-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-bg-surface to-bg-raised border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-[0.15em] mb-1">
              PIPELINE · 01
            </div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
              新品上新流水线
            </h1>
            <p className="text-[12px] text-text-secondary mt-1">
              选品类 · 贴 1 条 SKU · 并行跑三件事 · 一键打包
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/docs#pipeline-01"
              className="text-[10px] font-mono text-text-tertiary border border-border-subtle rounded-md px-3 py-1.5 hover:text-accent hover:border-accent/40"
              title="查此 Pipeline 使用手册"
            >
              📚 手册
            </a>
            <a
              href="/enterprise"
              className="text-[10px] font-mono text-text-tertiary border border-dashed border-border-default rounded-md px-3 py-1.5 hover:text-accent hover:border-accent/40"
            >
              支持企业级定制 →
            </a>
          </div>
        </div>

        {/* 三段式内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
          {/* ① 客户痛点 */}
          <div className="p-5 bg-error/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">⚠️</span>
              <span className="text-[11px] font-mono text-error uppercase tracking-wider font-semibold">
                客户痛点
              </span>
            </div>
            <div className="space-y-2.5">
              <div className="border-l-2 border-error/50 pl-2.5">
                <div className="text-[12px] font-semibold text-text-primary">上新周期长</div>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                  一个 SKU 要分别用翻译、文案、合规三个工具，来回切换 30 分钟
                </p>
              </div>
              <div className="border-l-2 border-error/50 pl-2.5">
                <div className="text-[12px] font-semibold text-text-primary">品类调教缺失</div>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                  通用 AI 不懂 FCC、不懂 BPA-Free、不懂 CAT III，输出靠运营手改
                </p>
              </div>
            </div>
          </div>

          {/* ② 核心能力 */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">🧭</span>
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-semibold">
                核心能力
              </span>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <span className="text-accent text-[10px] mt-0.5">◆</span>
                <span className="text-[11px] text-text-secondary">并行 3 路 AI，总耗时 ≈ 45 秒</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent text-[10px] mt-0.5">◆</span>
                <span className="text-[11px] text-text-secondary">品类专属 prompt（5 大类注入）</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent text-[10px] mt-0.5">◆</span>
                <span className="text-[11px] text-text-secondary">USPTO 商标库实时扫描</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border-subtle space-y-1">
              <div className="text-[9px] font-mono text-success">✓ 流式输出，不等整页</div>
              <div className="text-[9px] font-mono text-success">✓ Markdown 一键下载</div>
              <div className="text-[9px] font-mono text-success">✓ 输入不落库</div>
            </div>
          </div>

          {/* ③ 典型工作流 */}
          <div className="p-5 bg-bg-raised/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">🔀</span>
              <span className="text-[11px] font-mono text-success uppercase tracking-wider font-semibold">
                TYPICAL WORKFLOW
              </span>
            </div>
            <div className="space-y-1.5">
              {['选品类（5 选 1）', '贴 1 条 SKU 信息', '并行跑 3 步', '一键打包 Markdown'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-accent/40 flex items-center justify-center text-[9px] font-mono text-accent flex-shrink-0 tabular-nums">
                    {i + 1}
                  </div>
                  <span className="text-[11px] text-text-secondary">{s}</span>
                  {i < 3 && <span className="text-[10px] text-accent/40 ml-auto">↓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo 引导 banner · /?demo=1 一键跑 */}
      {demoBanner && (
        <div className="mb-4 p-3 border border-success/40 bg-success/10 rounded-md flex items-center gap-3">
          <span className="text-success text-[14px]">⚡</span>
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-success">
              Demo 模式 · 已自动灌入 HOMELODY 收纳盒示例，正在跑 3 步流水线
            </div>
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
              下面三栏会实时流式输出 · 30-45 秒出齐
            </div>
          </div>
          <button
            onClick={() => setDemoBanner(false)}
            className="text-[10px] font-mono text-text-tertiary hover:text-success"
          >
            知道了
          </button>
        </div>
      )}

      {/* 模式切换 · 单 SKU / 批量 */}
      <div className="flex items-center gap-1 mb-4 p-1 border border-border-subtle rounded-md bg-bg-surface w-fit">
        <button
          onClick={() => setMode('single')}
          className={`px-4 py-1.5 rounded text-[11px] font-mono transition-all ${
            mode === 'single'
              ? 'bg-accent text-bg-root font-semibold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          单 SKU · 首次推荐
        </button>
        <button
          onClick={() => setMode('batch')}
          className={`px-4 py-1.5 rounded text-[11px] font-mono transition-all flex items-center gap-1.5 ${
            mode === 'batch'
              ? 'bg-accent text-bg-root font-semibold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          批量模式 · 最多 20 条
          <span className="px-1.5 py-0.5 bg-bg-root/20 rounded text-[8px]">NEW</span>
        </button>
      </div>

      {/* 批量模式 UI */}
      {mode === 'batch' && (
        <div className="mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
                Step 1 · 品类（整批共用）
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 py-2.5 border rounded-md transition-all ${
                      category === cat.id ? 'border-accent bg-accent/10 text-accent' : 'border-border-subtle text-text-secondary hover:border-accent/30'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-[9px] font-mono">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
                Step 2 · 粘贴多条 SKU（用 <code className="bg-bg-raised px-1">---</code> 分隔）
              </label>
              <textarea
                value={batchInput}
                onChange={e => setBatchInput(e.target.value)}
                placeholder={`SKU 1 的商品信息\n例：HOMELODY 收纳盒 BPA-Free...\n\n---\n\nSKU 2 的商品信息\n例：VICSEED 磁吸车载支架...\n\n---\n\nSKU 3 ...`}
                rows={8}
                className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-md text-[11px] text-text-primary placeholder:text-text-tertiary/60 focus:outline-none focus:border-accent/60 resize-none font-mono"
              />
              <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-text-tertiary">
                <span>{parseBatchInput(batchInput).length} 条 SKU 待处理 · 最多 20 条</span>
                <span>预计耗时 ≈ {parseBatchInput(batchInput).length * 45} 秒</span>
              </div>
            </div>
          </div>

          {/* 批量控制区 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
            <div className="text-[11px] text-text-secondary">
              {batchProgress.total > 0 && (
                <span className="font-mono">
                  进度 {batchProgress.current} / {batchProgress.total}
                </span>
              )}
              {batchRows.filter(r => r.status === 'done').length === batchRows.length && batchRows.length > 0 && (
                <span className="text-success ml-3">✓ 全部完成 · 导出 Excel 交付老板</span>
              )}
            </div>
            <div className="flex gap-2">
              {batchRunning && (
                <button onClick={handleBatchStop} className="px-3 py-2 border border-border-default text-[11px] font-mono text-text-secondary rounded-md hover:border-error/40 hover:text-error">
                  停止
                </button>
              )}
              {batchRows.some(r => r.status === 'done') && !batchRunning && (
                <button onClick={handleBatchExport} className="px-4 py-2 border border-accent/40 bg-accent/10 text-accent text-[12px] font-mono rounded-md hover:bg-accent/20">
                  ⬇ 导出 Excel（3 表 + 概览）
                </button>
              )}
              <button
                onClick={handleBatchStart}
                disabled={!category || batchRunning || parseBatchInput(batchInput).length === 0}
                className="px-5 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded-md hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {batchRunning ? '运行中...' : '开始批量流水线 →'}
              </button>
            </div>
          </div>

          {/* 批量进度表 */}
          {batchRows.length > 0 && (
            <div className="mt-4 border border-border-subtle rounded-md overflow-hidden">
              <div className="px-3 py-2 bg-bg-raised/50 border-b border-border-subtle flex items-center justify-between text-[10px] font-mono text-text-tertiary uppercase">
                <span>批量执行表</span>
                <span>{batchRows.filter(r => r.status === 'done').length} 成功 · {batchRows.filter(r => r.status === 'error').length} 失败</span>
              </div>
              <div className="divide-y divide-border-subtle max-h-[400px] overflow-y-auto">
                {batchRows.map((row, i) => (
                  <div key={row.id} className="px-3 py-2 flex items-center gap-3 text-[11px] hover:bg-bg-surface/50">
                    <span className="text-[9px] font-mono text-text-tertiary w-6 tabular-nums">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary truncate">{row.skuPreview}</div>
                      {row.error && <div className="text-[9px] text-error font-mono mt-0.5">{row.error}</div>}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      {row.status === 'pending' && <span className="text-[9px] font-mono text-text-tertiary/60">待处理</span>}
                      {row.status === 'running' && (
                        <span className="text-[9px] font-mono text-accent flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          进行中
                        </span>
                      )}
                      {row.status === 'done' && <span className="text-[9px] font-mono text-success">✓ 完成</span>}
                      {row.status === 'error' && (
                        <>
                          <span className="text-[9px] font-mono text-error">✗ 失败</span>
                          <button
                            onClick={() => handleRetryOne(row.id)}
                            disabled={batchRunning}
                            className="text-[9px] font-mono text-accent hover:underline disabled:opacity-40"
                            title="重试这一条"
                          >
                            ↻ 重试
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 单 SKU 模式（默认） */}
      {mode === 'single' && <>

      {/* 输入区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
        {/* 品类选择 */}
        <div className="lg:col-span-5">
          <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
            Step 1 · 选品类
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-1 py-2.5 border rounded-md transition-all ${
                  category === cat.id
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-subtle text-text-secondary hover:border-accent/30'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="text-[9px] font-mono">{cat.label}</span>
              </button>
            ))}
          </div>
          {category && (
            <p className="text-[9px] font-mono text-text-tertiary mt-2">
              已注入 {CATEGORIES.find(c => c.id === category)?.label} 品类 prompt 前缀
            </p>
          )}
        </div>

        {/* SKU 输入 */}
        <div className="lg:col-span-7">
          <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-2 block">
            Step 2 · 贴商品信息
          </label>
          <textarea
            value={skuInput}
            onChange={e => setSkuInput(e.target.value)}
            placeholder={
              category
                ? CATEGORIES.find(c => c.id === category)?.exampleSku
                : '请先选品类，输入会有对应示例'
            }
            rows={5}
            className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-md text-[12px] text-text-primary placeholder:text-text-tertiary/60 focus:outline-none focus:border-accent/60 resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] font-mono text-text-tertiary">
              {skuInput.length} / 建议 200-800 字
            </span>
            {category && CATEGORIES.find(c => c.id === category)?.exampleSku && (
              <button
                onClick={() => setSkuInput(CATEGORIES.find(c => c.id === category)!.exampleSku)}
                className="text-[9px] font-mono text-accent hover:underline"
              >
                塞入示例 SKU →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 启动按钮 */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-border-subtle">
        <div className="text-[11px] text-text-secondary">
          {!category && '① 先选一个品类'}
          {category && skuInput.trim().length < 10 && '② 粘贴商品信息（≥10 字）'}
          {canStart && <span className="text-accent">准备就绪 · 点击开始并行执行 3 步</span>}
          {isRunning && <span className="text-accent font-mono">流水线执行中...</span>}
          {allDone && <span className="text-success font-mono">✓ 三步全部完成，可下载</span>}
        </div>
        <div className="flex gap-2">
          {isRunning && (
            <button
              onClick={handleStopAll}
              className="px-3 py-2 border border-border-default text-[11px] font-mono text-text-secondary rounded-md hover:border-error/40 hover:text-error"
            >
              停止
            </button>
          )}
          {allDone && (
            <>
              <button
                onClick={handleExportExcel}
                className="px-3 py-2 border border-accent/40 bg-accent/10 text-accent text-[11px] font-mono rounded-md hover:bg-accent/20"
                title="3 个工作表 · 老板看得懂的格式"
              >
                ⬇ Excel
              </button>
              <button
                onClick={handleExport}
                className="px-3 py-2 border border-success/40 bg-success/10 text-success text-[11px] font-mono rounded-md hover:bg-success/20"
              >
                ⬇ Markdown
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="px-3 py-2 border border-accent/40 bg-accent/10 text-accent text-[11px] font-mono rounded-md hover:bg-accent/20 disabled:opacity-50"
                title="生成 7 天有效公开链接,发给老板/同事看"
              >
                {sharing ? '生成中...' : '🔗 分享给老板'}
              </button>
            </>
          )}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="px-5 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded-md hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Step 3 · 开始流水线 →
          </button>
        </div>
      </div>

      {/* 结果区 · 3 栏 AI 结果 + 2 栏下游 Pipeline 联动 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {STEPS.map(step => {
          const s = states[step.id];
          return (
            <div
              key={step.id}
              className="border border-border-subtle rounded-md bg-bg-surface flex flex-col"
              style={{ borderLeftColor: step.accent, borderLeftWidth: '2px' }}
            >
              <div className="px-3 py-2.5 border-b border-border-subtle flex items-center gap-2">
                <span className="text-base">{step.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-text-primary truncate font-[family-name:var(--font-outfit)]">
                    {step.label}
                  </div>
                  <div className="text-[9px] font-mono text-text-tertiary truncate">
                    {step.desc}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {s.status === 'idle' && (
                    <span className="text-[9px] font-mono text-text-tertiary">待启动</span>
                  )}
                  {s.status === 'running' && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <span className="text-[9px] font-mono text-accent">流式中</span>
                    </div>
                  )}
                  {s.status === 'done' && (
                    <span className="text-[9px] font-mono text-success">✓ 完成</span>
                  )}
                  {s.status === 'error' && (
                    <span className="text-[9px] font-mono text-error">✗ 失败</span>
                  )}
                </div>
              </div>
              <div className="flex-1 p-3 overflow-y-auto max-h-[600px] min-h-[240px]">
                {s.status === 'idle' && (
                  <div className="flex items-center justify-center h-full text-[10px] font-mono text-text-tertiary/50">
                    等待启动...
                  </div>
                )}
                {s.status === 'error' && (
                  <div className="text-[11px] text-error/80 font-mono">{s.error || '失败'}</div>
                )}
                {s.result && (
                  <div className="prose prose-invert prose-sm max-w-none text-[11px] text-text-secondary leading-[1.7] [&_table]:border-collapse [&_th]:border [&_th]:border-border-subtle [&_th]:px-1.5 [&_th]:py-1 [&_th]:bg-bg-raised [&_th]:text-[10px] [&_td]:border [&_td]:border-border-subtle [&_td]:px-1.5 [&_td]:py-1 [&_td]:text-[10px] [&_h2]:text-[12px] [&_h2]:text-text-primary [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-[11px] [&_h3]:text-text-primary [&_ul]:pl-3 [&_li]:mb-0.5">
                    <ReactMarkdown>{s.result}</ReactMarkdown>
                    {s.status === 'running' && (
                      <span className="inline-block w-1 h-3 bg-accent animate-pulse ml-0.5" />
                    )}
                  </div>
                )}
              </div>
              {s.status === 'done' && (
                <div className="px-3 py-2 border-t border-border-subtle flex justify-end gap-1.5">
                  <button
                    onClick={() => navigator.clipboard.writeText(s.result)}
                    className="text-[9px] font-mono text-text-tertiary hover:text-accent"
                  >
                    复制
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Pipeline 03 联动卡 · 把当前 SKU 一键带到生图 */}
        <a
          href={skuInput.trim().length >= 10 && category
            ? `/pipelines/product-image?from=listing&category=${encodeURIComponent(category)}&sku=${encodeURIComponent(skuInput.slice(0, 500))}`
            : '/pipelines/product-image'
          }
          className="border-2 border-dashed border-accent/40 bg-accent/5 rounded-md flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:border-accent/70 hover:bg-accent/10"
          style={{ minHeight: '320px' }}
        >
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-[11px] font-semibold text-text-primary mb-1">
            AI 电商主图
          </div>
          <div className="text-[9px] font-mono text-accent mb-3 uppercase tracking-wider">
            Pipeline · 03 · 通义万相
          </div>
          <div className="text-[10px] text-text-secondary text-center leading-relaxed mb-3 max-w-[160px]">
            {skuInput.trim().length >= 10
              ? '当前 SKU 一键带过去，直接选场景生 5 图'
              : '场景融合 · 5 张图（主/场景/细节/使用/对比）'}
          </div>
          <span className="text-[10px] font-mono text-accent">
            {skuInput.trim().length >= 10 ? '带 SKU 生图 →' : '进 Pipeline 03 →'}
          </span>
        </a>

        {/* Pipeline 02 联动卡 · 为这个新品找达人推广 */}
        <a
          href={skuInput.trim().length >= 10
            ? `/pipelines/influencer-outbound?from=listing&sku=${encodeURIComponent(skuInput.slice(0, 500))}`
            : '/pipelines/influencer-outbound'
          }
          className="border-2 border-dashed border-success/40 bg-success/5 rounded-md flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:border-success/70 hover:bg-success/10"
          style={{ minHeight: '320px' }}
        >
          <div className="text-2xl mb-2">📮</div>
          <div className="text-[11px] font-semibold text-text-primary mb-1">
            达人批量冷启
          </div>
          <div className="text-[9px] font-mono text-success mb-3 uppercase tracking-wider">
            Pipeline · 02
          </div>
          <div className="text-[10px] text-text-secondary text-center leading-relaxed mb-3 max-w-[160px]">
            {skuInput.trim().length >= 10
              ? '为这个新品找达人推广，品牌信息自动预填'
              : '贴达人名单 · 个性化邮件 · Excel 喂 Gmail YAMM'}
          </div>
          <span className="text-[10px] font-mono text-success">
            {skuInput.trim().length >= 10 ? '为新品找达人 →' : '进 Pipeline 02 →'}
          </span>
        </a>
      </div>

      {/* 引导看别人怎么用 */}
      <div className="mt-4 flex items-center justify-between px-3 py-2 text-[10px] font-mono text-text-tertiary border border-border-subtle/60 rounded-md bg-bg-surface/30">
        <span>H 代运营 80min → 45sec 的真实对比案例</span>
        <a href="/cases#homelody" className="text-accent hover:underline">看 Before/After →</a>
      </div>
      </>}
    </div>
  );
}

export default function NewListingPipelinePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-tertiary font-mono text-[12px]">加载中...</div>}>
      <NewListingPipelineInner />
    </Suspense>
  );
}
