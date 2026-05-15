'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import * as XLSX from 'xlsx';
import { exportFilename } from '@/lib/export-filename';
import { buildInfluencerOutboundStandardPackRoute } from '@/lib/standard-pack-routing';

interface Influencer {
  id: string;
  name: string;
  platform: string;
  followers: string;
  niche: string;
  email?: string;
  status: 'pending' | 'running' | 'done' | 'error';
  subject?: string;
  body?: string;
  error?: string;
  expanded?: boolean;
}

interface ProductContext {
  brand: string;
  productName: string;
  price: string;
  usp: string;
  budget: string;
  cta: string;
}

const EMPTY_PRODUCT: ProductContext = {
  brand: '',
  productName: '',
  price: '',
  usp: '',
  budget: '',
  cta: '',
};

const TEMPLATE_PRODUCT: ProductContext = {
  brand: 'HOMELODY',
  productName: '可叠加密封收纳盒套装（6 件装）',
  price: '$32.99',
  usp: 'BPA-Free 食品级 PP · 四侧卡扣密封 · 可叠放省 40% 空间 · FDA+LFGB 认证 · Amazon 4.8★ 2300+ 评论',
  budget: '寄样 + 15% 佣金 + 视频通过后另付 $100-200 创意费',
  cta: '希望达人拍摄厨房/储物间整理场景，至少 1 条 Reels + 1 张 Carousel',
};

function buildInfluencerOutboundResultSummary(rows: Influencer[]): string {
  const done = rows.filter(row => row.status === 'done');
  const failed = rows.filter(row => row.status === 'error');
  const preview = done.slice(0, 6).map(row =>
    `${row.name} / ${row.platform} / ${row.followers} / subject: ${row.subject || '(missing)'}`,
  );

  return [
    `completed creators: ${done.length}`,
    `failed creators: ${failed.length}`,
    failed.length ? `error summary: ${failed.slice(0, 4).map(row => `${row.name}: ${row.error || 'unknown'}`).join(' | ')}` : 'error summary: none',
    preview.join('\n'),
    'acceptance checklist: creator-fit evidence, personalized subject, clear collaboration terms, mail-merge readiness, reply-rate review',
  ].join('\n');
}

// Parse tab-separated or pipe-separated rows: name | platform | followers | niche
function parseInfluencerInput(text: string): Influencer[] {
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  return lines.slice(0, 10).map((line, i) => {
    const parts = line.split(/\s*[|│\t]\s*/);
    return {
      id: `inf_${Date.now()}_${i}`,
      name: parts[0] || '',
      platform: parts[1] || 'Instagram',
      followers: parts[2] || '',
      niche: parts[3] || '',
      email: parts[4] || '',
      status: 'pending' as const,
    };
  }).filter(r => r.name);
}

function InfluencerOutboundInner() {
  const params = useSearchParams();
  const [product, setProduct] = useState<ProductContext>(EMPTY_PRODUCT);
  const [rawInput, setRawInput] = useState('');
  const [rows, setRows] = useState<Influencer[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [handoff, setHandoff] = useState('');
  const abortRef = useRef(false);

  // 从 Pipeline 01 带 SKU 跳过来,或 ?demo=1 直接开跑
  useEffect(() => {
    const fromListing = params.get('from') === 'listing';
    const skuFromListing = params.get('sku');
    const isDemo = params.get('demo') === '1';

    if (fromListing && skuFromListing) {
      const lines = skuFromListing.split('\n').map(s => s.trim()).filter(Boolean);
      const firstLine = lines[0] || '';
      const rest = lines.slice(1).join(' ').trim();
      setProduct({
        brand: '',
        productName: firstLine.slice(0, 100),
        price: '',
        usp: rest || firstLine,
        budget: '寄样 + 15% 佣金',
        cta: '希望拍摄产品使用场景，至少 1 条短视频 + 1 张静态图',
      });
      setHandoff('已从上新流程带入产品信息，补全品牌名、价格和预算即可');
    } else if (isDemo) {
      // Demo 路径: 灌入完整示例并自动触发 (限 3 条达人省 token)
      setProduct(TEMPLATE_PRODUCT);
      setRawInput(`@homestorage_sara | Instagram | 48K | 家居收纳 Reels | sara@example.com
@kitchen.tara | Instagram | 120K | 厨房整理 | hi@tara.com
@organize.mike | TikTok | 320K | 断舍离教程 | mike@gmail.com`);
      setHandoff('演示模式 · 已灌入 HOMELODY 示例 + 3 位家居达人，自动生成个性化邮件');
      setTimeout(() => {
        const parsed = parseInfluencerInput(`@homestorage_sara | Instagram | 48K | 家居收纳 Reels | sara@example.com
@kitchen.tara | Instagram | 120K | 厨房整理 | hi@tara.com
@organize.mike | TikTok | 320K | 断舍离教程 | mike@gmail.com`);
        void runDemoBatch(parsed, TEMPLATE_PRODUCT);
      }, 250);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // demo 专用 runBatch (绕过用户手动点启动)
  const runDemoBatch = async (parsed: Influencer[], prod: ProductContext) => {
    abortRef.current = false;
    setRows(parsed);
    setRunning(true);
    setProgress({ current: 0, total: parsed.length });

    for (let i = 0; i < parsed.length; i++) {
      if (abortRef.current) break;
      const row = parsed[i];
      // demo 不查配额,直接跑 (配额检查走正常路径)
      setRows(rs => rs.map(r => r.id === row.id ? { ...r, status: 'running' } : r));
      const result = await runOneDemo(row, prod);
      setRows(rs => rs.map(r => r.id === row.id ? result : r));
      setProgress({ current: i + 1, total: parsed.length });
    }
    setRunning(false);
  };

  const runOneDemo = async (inf: Influencer, prod: ProductContext): Promise<Influencer> => {
    try {
      const body = `【达人画像】
- 账号：${inf.name}
- 平台：${inf.platform}
- 粉丝量：${inf.followers}
- 内容赛道：${inf.niche}

【我方品牌】
- 品牌：${prod.brand}
- 产品：${prod.productName}
- 价格：${prod.price}
- 核心卖点：${prod.usp}

【合作条件】
- 预算：${prod.budget}
- 目标：${prod.cta}

请按输出要求为这位达人写 1 封最合适的邮件。`;
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: PIPELINE_PROMPT, input: body, moduleId: 'outreach', fromPipeline: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const parsed = parseEmailResponse(data.content || '');
      return { ...inf, status: 'done', body: parsed.body, subject: parsed.subject };
    } catch (err) {
      return { ...inf, status: 'error', error: err instanceof Error ? err.message : '未知错误' };
    }
  };

  const readyToRun = product.brand && product.productName && rows.length > 0 && !running;

  // Pipeline 02 专用 prompt · 不复用通用 outreach 模块（后者输出 3 封混排，不利于 Mail Merge）
  // 本 Pipeline 每位达人只出 1 封最优版本，硬约束 Subject/Body 两段格式
  const PIPELINE_PROMPT = `你是跨境电商达人 BD 顾问，擅长写高回复率的冷启邮件。

输出要求（严格）：
1. 只输出 1 封最适合该达人的邮件（不是 3 版）
2. 格式必须严格遵循：
   第一行：Subject: <不超过 70 字，英文；含对方频道内容线索 + 具体吸引点>
   空一行
   第二行起：邮件正文（英文，150-250 词，第一段必须提到对方频道/视频的具体内容证明真的看过）
3. 结尾附一行 "Suggested CTA: <具体动作>"，如 "Suggested CTA: DM me your shipping address for a free unit"

判断策略（根据达人画像选最优调性）：
- 粉丝 < 50K → 共情版（平等协作感，提 commission + free sample）
- 粉丝 50K-200K → 主动版（品牌价值观匹配，提 creative freedom + 固定 fee）
- 粉丝 > 200K → 数据版（品牌背书 / 媒体资产，提 campaign context + performance bonus）
- TikTok 偏活泼 / YouTube 偏深度 / Instagram 偏视觉

禁忌：
- 不要出现 "Dear Creator"、"Dear Influencer" 这种机械称呼
- 不要编造对方没有的视频内容，只基于提供的 niche 合理推测
- 不要用 "wide audience", "huge reach", "great content" 这类空洞词`;

  const buildInput = (inf: Influencer): string => {
    return `【达人画像】
- 账号：${inf.name}
- 平台：${inf.platform}
- 粉丝量：${inf.followers || '未提供'}
- 内容赛道：${inf.niche || '未提供'}
${inf.email ? `- 邮箱：${inf.email}` : ''}

【我方品牌】
- 品牌：${product.brand}
- 产品：${product.productName}
- 价格：${product.price}
- 核心卖点：${product.usp}

【合作条件】
- 预算：${product.budget}
- 目标：${product.cta}

请按输出要求为这位达人写 1 封最合适的邮件。`;
  };

  // 严格解析：第一行 Subject / 空行 / 之后 Body
  const parseEmailResponse = (raw: string): { subject: string; body: string } => {
    const cleaned = raw.trim();
    const firstLineMatch = cleaned.match(/^[\s]*Subject[:：]\s*(.+?)(?:\n|$)/i);
    if (firstLineMatch) {
      const subject = firstLineMatch[1].trim().slice(0, 120);
      const body = cleaned.substring(firstLineMatch[0].length).trim();
      return { subject, body };
    }
    // 回退：第一行作为 subject
    const lines = cleaned.split('\n').filter(Boolean);
    return {
      subject: lines[0]?.slice(0, 120) || `Collaboration | ${product.brand}`,
      body: lines.slice(1).join('\n').trim() || cleaned,
    };
  };

  const runOne = async (inf: Influencer): Promise<Influencer> => {
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: PIPELINE_PROMPT,
          input: buildInput(inf),
          moduleId: 'outreach',
          fromPipeline: true,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data.content || '';
      const parsed = parseEmailResponse(raw);
      return {
        ...inf,
        status: 'done' as const,
        body: parsed.body,
        subject: parsed.subject,
      };
    } catch (err) {
      return { ...inf, status: 'error' as const, error: err instanceof Error ? err.message : '未知错误' };
    }
  };

  const handleStart = async () => {
    const parsed = parseInfluencerInput(rawInput);
    if (parsed.length === 0) return alert('至少贴 1 条达人（每行一条，字段用 | 分隔）');

    abortRef.current = false;
    setRows(parsed);
    setRunning(true);
    setProgress({ current: 0, total: parsed.length });

    for (let i = 0; i < parsed.length; i++) {
      if (abortRef.current) break;
      const row = parsed[i];

      // 每位达人独立预占 1 次配额
      try {
        const check = await fetch('/api/ratelimit/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'pipeline:influencer-outbound' }),
        });
        if (!check.ok) {
          const data = await check.json().catch(() => ({}));
          alert(`第 ${i + 1} 位达人前触发配额上限\n已完成 ${i} 条\n${data.resetAtText ? '将于 ' + data.resetAtText + ' 重置' : ''}\n准备跑真实批次请提交 10 SKU POC 需求`);
          break;
        }
      } catch {}

      setRows(rs => rs.map(r => r.id === row.id ? { ...r, status: 'running' } : r));
      const result = await runOne(row);
      setRows(rs => rs.map(r => r.id === row.id ? result : r));
      setProgress({ current: i + 1, total: parsed.length });
    }
    setRunning(false);
  };

  const handleStop = () => {
    abortRef.current = true;
  };

  // 单条重试失败达人
  const handleRetryOne = async (rowId: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row || running) return;
    try {
      const check = await fetch('/api/ratelimit/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'pipeline:influencer-outbound' }),
      });
      if (!check.ok) {
        const d = await check.json().catch(() => ({}));
        alert(`配额不足无法重试\n${d.resetAtText || ''}`);
        return;
      }
    } catch {}

    setRows(rs => rs.map(r => r.id === rowId ? { ...r, status: 'running', error: undefined } : r));
    const result = await runOne(row);
    setRows(rs => rs.map(r => r.id === rowId ? result : r));
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    const header = ['#', '达人', '平台', '粉丝', '赛道', '邮箱', 'Subject', 'Body'];
    const rowsExcel: (string | number)[][] = [header];
    rows.forEach((r, i) => {
      rowsExcel.push([
        i + 1,
        r.name,
        r.platform,
        r.followers,
        r.niche,
        r.email || '',
        r.subject || '',
        r.body || '',
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(rowsExcel);
    ws['!cols'] = [
      { wch: 4 }, { wch: 20 }, { wch: 12 }, { wch: 10 },
      { wch: 20 }, { wch: 25 }, { wch: 50 }, { wch: 100 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Mail Merge');

    // 品牌信息 sheet
    const meta = [
      ['品牌', product.brand],
      ['产品', product.productName],
      ['价格', product.price],
      ['卖点', product.usp],
      ['预算', product.budget],
      ['目标', product.cta],
      ['生成时间', new Date().toLocaleString('zh-CN')],
      [],
      ['用法说明'],
      ['1. 打开 Gmail → 扩展 → Yet Another Mail Merge (YAMM) / Mailmeteor'],
      ['2. 上传此 Excel / 粘贴 Mail Merge 表'],
      ['3. 邮箱列使用"邮箱"列；Subject/Body 分别映射'],
      ['4. 建议首日发 20-50 封，监控回复率'],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(meta), '品牌信息');

    XLSX.writeFile(wb, exportFilename('达人冷启', `${product.brand || '品牌'}-${rows.length}位`, 'xlsx'));
  };

  const handleCopyTemplate = () => {
    setProduct(TEMPLATE_PRODUCT);
  };

  // 分享到公开只读链接
  const [sharing, setSharing] = useState(false);
  const handleShare = async () => {
    const doneRows = rows.filter(r => r.status === 'done');
    if (doneRows.length === 0) return;
    setSharing(true);
    try {
      const md = `## 达人外联批量产出 · ${product.brand || product.productName}

- 产品: ${product.productName} (${product.price})
- 卖点: ${product.usp}
- 预算: ${product.budget}
- 合作目标: ${product.cta}

---

${doneRows.map((r, i) => `### ${i + 1}. ${r.name} · ${r.platform} · ${r.followers}

赛道：${r.niche}
${r.email ? `邮箱：${r.email}` : ''}

**Subject:** ${r.subject || ''}

${r.body || ''}
`).join('\n---\n\n')}`;

      const title = `${product.brand || product.productName} × ${doneRows.length} 位达人冷启邮件`;
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: 'pipeline-02', source: 'pipeline-02', title, content: md }),
      });
      const data = await res.json();
      if (!res.ok || !data.id) throw new Error(data.error || '分享失败');
      const fullUrl = `${window.location.origin}/share/${data.id}`;
      const nav = navigator as Navigator & { share?: (data: { title: string; url: string }) => Promise<void> };
      if (typeof nav.share === 'function') {
        try { await nav.share({ title: 'wenai · 达人冷启邮件批量产出', url: fullUrl }); return; } catch {}
      }
      await nav.clipboard.writeText(fullUrl);
      alert('链接已复制到剪贴板\n' + fullUrl + '\n\n7 天有效,可发给主管看成果');
    } catch (err) {
      alert('分享失败: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSharing(false);
    }
  };

  const handleSampleInfluencers = () => {
    setRawInput(`@homestorage_sara | Instagram | 48K | 家居收纳 Reels | sara@example.com
@kitchen.tara | Instagram | 120K | 厨房整理 | hi@tara.com
@organize.mike | TikTok | 320K | 断舍离教程 | mike.collab@gmail.com
PantryPerfection | YouTube | 85K | 家居生活 vlog | contact@pantryperfection.co
@minimalist_home | Instagram | 210K | 极简家居美学 | press@minimalhome.com`);
  };

  const doneCount = rows.filter(r => r.status === 'done').length;
  const standardPackHref = buildInfluencerOutboundStandardPackRoute({
    brand: product.brand,
    productName: product.productName,
    price: product.price,
    usp: product.usp,
    budget: product.budget,
    cta: product.cta,
    influencerInput: rawInput,
  });
  const resultStandardPackHref = buildInfluencerOutboundStandardPackRoute({
    brand: product.brand,
    productName: product.productName,
    price: product.price,
    usp: product.usp,
    budget: product.budget,
    cta: product.cta,
    influencerInput: rows.map(row => `${row.name} | ${row.platform} | ${row.followers} | ${row.niche}`).join('\n') || rawInput,
    resultSummary: buildInfluencerOutboundResultSummary(rows),
  });

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6">
      {/* 交接提示 · 从上新流水线带入 */}
      {handoff && (
        <div className="mb-4 p-3 border border-accent/40 bg-accent/10 rounded-md flex items-center gap-3">
          <span className="text-accent text-[14px]">↳</span>
          <div className="flex-1">
            <div className="text-[11px] font-semibold text-accent">{handoff}</div>
            <div className="text-[10px] font-mono text-text-tertiary mt-0.5">从上新资料直接进入达人触达</div>
          </div>
          <button
            onClick={() => { setHandoff(''); setProduct(EMPTY_PRODUCT); }}
            className="text-[10px] font-mono text-text-tertiary hover:text-accent"
          >
            清空重填
          </button>
        </div>
      )}

      {/* 三段式头 */}
      <div className="mb-6 border border-border-subtle rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-bg-surface to-bg-raised border-b border-border-subtle flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-accent uppercase tracking-[0.15em] mb-1">
              PIPELINE · 02
            </div>
            <h1 className="text-[20px] lg:text-[24px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
              达人批量冷启
            </h1>
            <p className="text-[12px] text-text-secondary mt-1">
              贴一批达人 · 生成个性化邮件 · Excel 直接喂 Gmail Mail Merge
            </p>
          </div>
          <div className="flex gap-2">
            <a href="/docs#pipeline-02" className="text-[10px] font-mono text-text-tertiary border border-border-subtle rounded-md px-3 py-1.5 hover:text-accent hover:border-accent/40">
              📚 手册
            </a>
            <a href="/enterprise" className="text-[10px] font-mono text-text-tertiary border border-dashed border-border-default rounded-md px-3 py-1.5 hover:text-accent hover:border-accent/40">
              支持企业级定制 →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border-subtle">
          <div className="p-5 bg-error/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">⚠️</span>
              <span className="text-[11px] font-mono text-error uppercase tracking-wider font-semibold">客户痛点</span>
            </div>
            <div className="space-y-2.5">
              <div className="border-l-2 border-error/50 pl-2.5">
                <div className="text-[12px] font-semibold text-text-primary">群发邮件秒被标垃圾</div>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                  同一模板发 100 个达人，Gmail / 达人邮箱反垃圾机制直接 block
                </p>
              </div>
              <div className="border-l-2 border-error/50 pl-2.5">
                <div className="text-[12px] font-semibold text-text-primary">人工一封一改太慢</div>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">
                  一位媒介手写 10 封个性化邮件要 2 小时，100 个达人得排 2 天
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">🧭</span>
              <span className="text-[11px] font-mono text-accent uppercase tracking-wider font-semibold">核心能力</span>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2"><span className="text-accent text-[10px] mt-0.5">◆</span><span className="text-[11px] text-text-secondary">每条达人独立个性化 · 称呼频道特点</span></div>
              <div className="flex items-start gap-2"><span className="text-accent text-[10px] mt-0.5">◆</span><span className="text-[11px] text-text-secondary">3 版本 A/B（安全 / 主动 / 共情）</span></div>
              <div className="flex items-start gap-2"><span className="text-accent text-[10px] mt-0.5">◆</span><span className="text-[11px] text-text-secondary">Excel 列可直接映射到 Gmail YAMM</span></div>
            </div>
            <div className="pt-2 border-t border-border-subtle space-y-1">
              <div className="text-[9px] font-mono text-success">✓ 串行跑 · 不触发平台反垃圾</div>
              <div className="text-[9px] font-mono text-success">✓ 最多 10 条 / 次</div>
              <div className="text-[9px] font-mono text-success">✓ 不落库 · 邮箱隐私保全</div>
            </div>
          </div>

          <div className="p-5 bg-bg-raised/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px]">🔀</span>
              <span className="text-[11px] font-mono text-success uppercase tracking-wider font-semibold">TYPICAL WORKFLOW</span>
            </div>
            <div className="space-y-1.5">
              {['填品牌 / 产品 / 预算', '贴达人名单（每行一条）', '串行生成邮件', '导出 Excel 喂 Mail Merge'].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-accent/40 flex items-center justify-center text-[9px] font-mono text-accent flex-shrink-0 tabular-nums">{i + 1}</div>
                  <span className="text-[11px] text-text-secondary">{s}</span>
                  {i < 3 && <span className="text-[10px] text-accent/40 ml-auto">↓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 品牌信息 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
            Step 1 · 品牌与合作信息（整批共用）
          </label>
          <button onClick={handleCopyTemplate} className="text-[9px] font-mono text-accent hover:underline">
            塞入示例（HOMELODY 收纳盒）→
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-4 border border-border-subtle rounded-md">
          <div>
            <label className="text-[9px] font-mono text-text-tertiary mb-1 block">品牌名 *</label>
            <input type="text" value={product.brand} onChange={e => setProduct({ ...product, brand: e.target.value })} className="w-full px-2.5 py-2 bg-bg-surface border border-border-default rounded text-[12px]" placeholder="HOMELODY" />
          </div>
          <div>
            <label className="text-[9px] font-mono text-text-tertiary mb-1 block">产品 *</label>
            <input type="text" value={product.productName} onChange={e => setProduct({ ...product, productName: e.target.value })} className="w-full px-2.5 py-2 bg-bg-surface border border-border-default rounded text-[12px]" placeholder="可叠加密封收纳盒套装" />
          </div>
          <div>
            <label className="text-[9px] font-mono text-text-tertiary mb-1 block">价格</label>
            <input type="text" value={product.price} onChange={e => setProduct({ ...product, price: e.target.value })} className="w-full px-2.5 py-2 bg-bg-surface border border-border-default rounded text-[12px]" placeholder="$32.99" />
          </div>
          <div>
            <label className="text-[9px] font-mono text-text-tertiary mb-1 block">预算</label>
            <input type="text" value={product.budget} onChange={e => setProduct({ ...product, budget: e.target.value })} className="w-full px-2.5 py-2 bg-bg-surface border border-border-default rounded text-[12px]" placeholder="寄样 + 15% 佣金" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[9px] font-mono text-text-tertiary mb-1 block">核心卖点</label>
            <textarea value={product.usp} onChange={e => setProduct({ ...product, usp: e.target.value })} rows={2} className="w-full px-2.5 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none" placeholder="BPA-Free 食品级 PP · 四侧卡扣密封 · Amazon 4.8★ 2300+ 评论" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[9px] font-mono text-text-tertiary mb-1 block">合作目标</label>
            <input type="text" value={product.cta} onChange={e => setProduct({ ...product, cta: e.target.value })} className="w-full px-2.5 py-2 bg-bg-surface border border-border-default rounded text-[12px]" placeholder="1 条 Reels + 1 张 Carousel" />
          </div>
        </div>
      </div>

      {/* 达人名单 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
            Step 2 · 达人名单（每行 1 条 · 最多 10 条 · 用 <code className="bg-bg-raised px-1">|</code> 分隔字段）
          </label>
          <button onClick={handleSampleInfluencers} className="text-[9px] font-mono text-accent hover:underline">
            塞入 5 条示例达人 →
          </button>
        </div>
        <textarea
          value={rawInput}
          onChange={e => setRawInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && readyToRun) {
              e.preventDefault();
              handleStart();
            }
          }}
          placeholder={`格式：名字 | 平台 | 粉丝量 | 赛道 | 邮箱(可选)\n\n@homestorage_sara | Instagram | 48K | 家居收纳 | sara@example.com\n@kitchen.tara | Instagram | 120K | 厨房整理 | hi@tara.com\n@organize.mike | TikTok | 320K | 断舍离 | mike@gmail.com`}
          rows={7}
          className="w-full px-3 py-2.5 bg-bg-surface border border-border-default rounded-md text-[11px] text-text-primary placeholder:text-text-tertiary/60 focus:outline-none focus:border-accent/60 resize-none font-mono"
        />
        <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-text-tertiary">
          <span>{parseInfluencerInput(rawInput).length} 位达人 · 上限 10</span>
          <span>预计 ≈ {parseInfluencerInput(rawInput).length * 20} 秒</span>
        </div>
      </div>

      {/* 控制区 */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-border-subtle">
        <div className="text-[11px] text-text-secondary">
          {!product.brand && '① 填品牌信息'}
          {product.brand && parseInfluencerInput(rawInput).length === 0 && '② 贴达人名单'}
          {readyToRun && <span className="text-accent">准备就绪 · 串行生成</span>}
          {running && (
            <span className="text-accent font-mono">生成中 {progress.current} / {progress.total}...</span>
          )}
          {rows.length > 0 && doneCount === rows.length && !running && (
            <span className="text-success font-mono">✓ {doneCount} 条完成 · 可导出 Excel</span>
          )}
        </div>
        <div className="flex gap-2">
          {running && <button onClick={handleStop} className="px-3 py-2 border border-border-default text-[11px] font-mono text-text-secondary rounded-md hover:border-error/40 hover:text-error">停止</button>}
          {doneCount > 0 && !running && (
            <>
              <a
                href={resultStandardPackHref}
                className="px-3 py-2 border border-cat-content/40 bg-cat-content/10 text-cat-content text-[11px] font-mono rounded-md hover:bg-cat-content/20"
              >
                生成达人验收标品包
              </a>
              <button onClick={handleExport} className="px-4 py-2 border border-accent/40 bg-accent/10 text-accent text-[12px] font-mono rounded-md hover:bg-accent/20">
                ⬇ Excel（Mail Merge）
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="px-3 py-2 border border-accent/40 bg-accent/10 text-accent text-[11px] font-mono rounded-md hover:bg-accent/20 disabled:opacity-50"
                title="生成 7 天有效公开链接发主管"
              >
                {sharing ? '生成中...' : '🔗 分享主管'}
              </button>
            </>
          )}
          <a
            href={standardPackHref}
            className={`px-3 py-2 border text-[11px] font-mono rounded-md transition-colors ${
              product.productName.trim() && rawInput.trim()
                ? 'border-cat-content/40 text-cat-content hover:bg-cat-content/10'
                : 'border-border-subtle text-text-tertiary pointer-events-none opacity-50'
            }`}
          >
            生成达人外联 SOP 标品包
          </a>
          <button
            onClick={handleStart}
            disabled={!readyToRun}
            className="px-5 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded-md hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Step 3 · 开始生成 →
          </button>
        </div>
      </div>

      {/* 结果表 */}
      {rows.length > 0 && (
        <div className="border border-border-subtle rounded-md overflow-hidden">
          <div className="px-3 py-2 bg-bg-raised/50 border-b border-border-subtle text-[10px] font-mono text-text-tertiary uppercase flex items-center justify-between">
            <span>生成结果</span>
            <span>{doneCount} 成功 · {rows.filter(r => r.status === 'error').length} 失败</span>
          </div>
          <div className="divide-y divide-border-subtle">
            {rows.map((r, i) => (
              <div key={r.id}>
                <div className="px-3 py-2 flex items-center gap-3 text-[11px] hover:bg-bg-surface/50 cursor-pointer"
                  onClick={() => setRows(rs => rs.map(x => x.id === r.id ? { ...x, expanded: !x.expanded } : x))}
                >
                  <span className="text-[9px] font-mono text-text-tertiary w-6 tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="text-text-primary font-semibold truncate max-w-[180px]">{r.name}</span>
                    <span className="text-[10px] text-text-tertiary font-mono">{r.platform}</span>
                    <span className="text-[10px] text-text-tertiary font-mono">{r.followers}</span>
                    <span className="text-[10px] text-text-secondary truncate hidden md:inline">{r.niche}</span>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-1.5 justify-end">
                    {r.status === 'pending' && <span className="text-[9px] font-mono text-text-tertiary/60">待处理</span>}
                    {r.status === 'running' && (
                      <span className="text-[9px] font-mono text-accent flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />进行中
                      </span>
                    )}
                    {r.status === 'done' && <span className="text-[9px] font-mono text-success">✓ 完成</span>}
                    {r.status === 'error' && (
                      <>
                        <span className="text-[9px] font-mono text-error">✗ 失败</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRetryOne(r.id); }}
                          disabled={running}
                          className="text-[9px] font-mono text-accent hover:underline disabled:opacity-40"
                          title="重试这条"
                        >
                          ↻
                        </button>
                      </>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-text-tertiary">{r.expanded ? '▲' : '▼'}</span>
                </div>
                {r.expanded && r.body && (
                  <div className="px-3 py-3 bg-bg-surface/30 border-t border-border-subtle">
                    {r.subject && (
                      <div className="mb-2">
                        <span className="text-[9px] font-mono text-text-tertiary uppercase">Subject</span>
                        <div className="text-[12px] text-text-primary font-semibold mt-0.5">{r.subject}</div>
                      </div>
                    )}
                    <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1">Body</div>
                    <div className="prose prose-invert prose-sm max-w-none text-[11px] text-text-secondary leading-[1.7]">
                      <ReactMarkdown>{r.body}</ReactMarkdown>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border-subtle flex justify-end gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(`Subject: ${r.subject}\n\n${r.body}`)}
                        className="text-[9px] font-mono text-text-tertiary hover:text-accent"
                      >
                        复制整封
                      </button>
                    </div>
                  </div>
                )}
                {r.expanded && r.error && (
                  <div className="px-3 py-2 bg-error/5 border-t border-border-subtle text-[10px] font-mono text-error">
                    {r.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 案例引导 */}
      <div className="mt-4 flex items-center justify-between px-3 py-2 text-[10px] font-mono text-text-tertiary border border-border-subtle/60 rounded-md bg-bg-surface/30">
        <span>M 工厂 · 回复率 4% → 11% · 8× 达人日均触达</span>
        <Link href="/cases/micro-audio" className="text-accent hover:underline">看 Before/After →</Link>
      </div>
    </div>
  );
}

export default function InfluencerOutboundPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-text-tertiary font-mono text-[12px]">加载中...</div>}>
      <InfluencerOutboundInner />
    </Suspense>
  );
}
