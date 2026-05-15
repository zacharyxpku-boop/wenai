'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IndustryHint } from '@/components/IndustryHint';
import { buildIntentMiningStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * 反向意图扩客 · 跳出固有客群标签
 *
 * 方法论参考:
 *  - 阿里妈妈 LMA3 / AI 万相: 美甲师 → 电子锁 (动态意图匹配)
 *  - 美津浓案例: 溯溪鞋 → 城市机能风穿搭族 (跨场景翻译)
 *  - OPPO Find N6: 折叠屏 → 滑雪不关机 / 车机互联 (新意图发现)
 *
 * 输入: 产品描述 + 当前已知客群
 * 输出: 5-8 个非显然高潜人群 + 动机洞察 + 卖点翻译 + 触达渠道 + 示例文案
 *
 * 后端复用 /api/ai (DeepSeek/qwen),不需要新建 API
 */

interface IntentSegment {
  name: string;        // 人群标签
  insight: string;     // 为什么这个人群会买
  translation: string; // 卖点翻译
  channels: string[];  // 触达渠道
  copyExample: string; // 一句示例文案
  searchQueries: string[]; // 模拟该人群的搜索词
}

interface MiningResult {
  productSummary: string;
  defaultSegments: string[]; // AI 识别出的"显然"客群
  newSegments: IntentSegment[]; // 反向挖出的新客群
}

const EXAMPLES = [
  {
    title: '智能电子锁',
    product: '智能电子锁,指纹+密码+手机 NFC 三合一开锁,支持远程开门,适配防盗门,售价 ¥899',
    known: '装修业主、新房入住、租房年轻人',
  },
  {
    title: '加湿器',
    product: '床头静音加湿器,3L 容量,USB 供电,带 LED 小夜灯,适合办公桌/卧室,售价 ¥129',
    known: '北方冬季用户、敏感肌、办公室白领',
  },
  {
    title: '溯溪鞋',
    product: '户外溯溪鞋,水陆两栖,排水防滑,EVA 中底缓震,夏季款,售价 ¥299',
    known: '徒步爱好者、户外运动玩家',
  },
];

function buildIntentMiningResultSummary(result: MiningResult): string {
  const segmentSummary = result.newSegments
    .slice(0, 6)
    .map((segment, index) => {
      const channels = segment.channels.slice(0, 3).join(', ');
      const queries = segment.searchQueries.slice(0, 3).join(', ');
      return `${index + 1}. ${segment.name} / insight: ${segment.insight} / angle: ${segment.translation} / channels: ${channels} / queries: ${queries}`;
    })
    .join('\n');

  return [
    `product summary: ${result.productSummary}`,
    result.defaultSegments.length ? `default segments avoided: ${result.defaultSegments.join(', ')}` : '',
    `new audience segments:\n${segmentSummary}`,
  ].filter(Boolean).join('\n\n');
}

export default function IntentMiningPage() {
  const [product, setProduct] = useState('');
  const [knownSegments, setKnownSegments] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MiningResult | null>(null);
  const [error, setError] = useState('');
  const [rawDebug, setRawDebug] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const standardPackHref = buildIntentMiningStandardPackRoute({
    product,
    knownSegments,
  });
  const resultStandardPackHref = result
    ? buildIntentMiningStandardPackRoute({
        product,
        knownSegments,
        resultSummary: buildIntentMiningResultSummary(result),
      })
    : '';

  const loadExample = (idx: number) => {
    const e = EXAMPLES[idx];
    setProduct(e.product);
    setKnownSegments(e.known);
    setError('');
    setResult(null);
  };

  const buildPrompt = () => `
你是一个深耕中国电商 10 年的人群洞察专家,熟悉阿里妈妈 LMA3 大模型的"动态意图匹配"方法论。

【任务】
跳出"产品功能 → 显然客群"的固化标签思维,基于产品的真实使用场景和用户隐性动机,挖掘 5-8 个非显然但高转化潜力的目标人群。

【经典案例参考】
- 智能电子锁 → 美甲师(指甲长不方便拿钥匙)
- 折叠屏手机 → 滑雪爱好者(-20℃ 不关机) / 新能源车主(车机互联)
- 溯溪鞋 → 都市机能风穿搭族(城市逃离感) / 春季运动装备党(山系 OOTD)
- 加湿器 → 主播(嗓子保湿) / 多肉植物玩家(湿度需求)

【输出严格 JSON】
{
  "productSummary": "一句话总结产品核心价值",
  "defaultSegments": ["客户已知客群1", "已知客群2"],
  "newSegments": [
    {
      "name": "<非显然客群名,8-15 字,场景化>",
      "insight": "<为什么这个人群会买,挖出隐性动机,30-60 字>",
      "translation": "<把产品功能翻译成这个人群听得懂的话,30 字内>",
      "channels": ["<触达渠道1>", "<触达渠道2>"],
      "copyExample": "<一句示例小红书/抖音文案,30 字内,带画面感>",
      "searchQueries": ["<这个人群在淘宝/拼多多上会搜的词1>", "<词2>", "<词3>"]
    }
  ]
}

【硬要求】
1. newSegments 必须 5-8 个,且要明显跳出 defaultSegments 的标签思路
2. 每个 segment 的 insight 必须挖到"使用场景"或"隐性焦虑/欲望",不能只是人口属性
3. searchQueries 是真实电商/社媒平台用户会输入的口语化关键词
4. 直接输出 JSON,不要任何 markdown 代码块标记,不要解释

【产品】
${product}

【已知客群(避开这些重复)】
${knownSegments || '无'}
`.trim();

  const handleMine = async () => {
    if (product.trim().length < 20) {
      setError('产品描述太短,至少 20 字 (含品类/卖点/价格)');
      return;
    }
    setRunning(true);
    setError('');
    setResult(null);
    setRawDebug('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'intent-mining',
          prompt: buildPrompt(),
          input: product, // 留作 reference context lookup
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      const raw = data.content || '';
      setRawDebug(raw);

      // 容错解析 (AI 可能输出有前后赘述)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('结果格式暂时不可用，请重试或导出当前输入交给团队处理');
      const parsed = JSON.parse(jsonMatch[0]) as MiningResult;
      if (!parsed.newSegments || parsed.newSegments.length === 0) {
        throw new Error('AI 未返回新客群,试试丰富产品描述');
      }
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '挖掘失败');
    } finally {
      setRunning(false);
    }
  };

  const exportMarkdown = () => {
    if (!result) return;
    const md = [
      `# 反向意图扩客报告`,
      ``,
      `**产品**: ${result.productSummary}`,
      ``,
      `**已知客群**: ${result.defaultSegments.join(' · ')}`,
      ``,
      `## 新挖掘的 ${result.newSegments.length} 个高潜人群`,
      ``,
      ...result.newSegments.flatMap((s, i) => [
        `### ${i + 1}. ${s.name}`,
        ``,
        `**洞察**: ${s.insight}`,
        ``,
        `**卖点翻译**: ${s.translation}`,
        ``,
        `**触达渠道**: ${s.channels.join(' / ')}`,
        ``,
        `**示例文案**:`,
        `> ${s.copyExample}`,
        ``,
        `**搜索词**: ${s.searchQueries.map(q => `\`${q}\``).join(' · ')}`,
        ``,
      ]),
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-intent-mining-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1100px] mx-auto px-6 py-8">
          <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-2">
            INTENT MINING · 反向意图扩客
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            跳出固有客群,挖出&quot;美甲师→电子锁&quot;
          </h1>
          <div className="mb-3"><IndustryHint /></div>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[760px]">
            阿里妈妈 LMA3 / AI 万相同款方法论。
            产品描述丢进来,DeepSeek 跳出&quot;装修业主&quot;这种显然标签,
            <span className="text-accent">挖出 5-8 个非显然但高转化的新人群</span>,带卖点翻译 + 触达渠道 + 示例文案 + 搜索词清单。
          </p>

          {/* 案例快捷按钮 */}
          <div className="flex gap-2 mt-5 flex-wrap">
            <span className="text-[10px] font-mono text-text-tertiary self-center mr-1">案例:</span>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => loadExample(i)}
                className="text-[11px] font-mono px-3 py-1.5 border border-border-subtle rounded text-text-secondary hover:border-accent/40 hover:text-accent"
              >
                {e.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">
        {/* Inputs */}
        <section className="border border-border-subtle rounded-lg p-5 bg-bg-surface/30 space-y-4">
          <div>
            <label className="text-[11px] font-mono text-text-secondary mb-1.5 block">
              ① 产品描述 <span className="text-error">*</span>
              <span className="text-text-tertiary ml-2">含品类 / 核心卖点 / 价格档位</span>
            </label>
            <textarea
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="例: 智能电子锁,指纹+密码+手机 NFC 三合一开锁,支持远程开门,适配防盗门,售价 ¥899"
              rows={4}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none focus:border-accent/60 outline-none"
            />
            <div className="text-[10px] font-mono text-text-tertiary mt-1">
              {product.length}/500
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-text-secondary mb-1.5 block">
              ② 已知/默认客群 (可选)
              <span className="text-text-tertiary ml-2">告诉 AI 别再返回这些</span>
            </label>
            <input
              type="text"
              value={knownSegments}
              onChange={e => setKnownSegments(e.target.value)}
              placeholder="例: 装修业主、租房年轻人"
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] focus:border-accent/60 outline-none"
            />
          </div>

          <button
            onClick={handleMine}
            disabled={running || product.trim().length < 20}
            className="w-full py-3 bg-accent text-bg-root rounded-lg text-[13px] font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {running ? '挖掘中... (8-15 秒)' : '🔍 挖掘 5-8 个非显然客群'}
          </button>

          <Link
            href={standardPackHref}
            className="block w-full text-center py-2.5 border border-accent/35 text-accent rounded-lg text-[12px] font-mono hover:bg-accent/10"
          >
            生成人群洞察 SOP 标品包 →
          </Link>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
              {rawDebug && (
                <button onClick={() => setShowRaw(s => !s)} className="ml-2 underline">
                  {showRaw ? '隐藏' : '查看'} AI 原始输出
                </button>
              )}
              {showRaw && rawDebug && (
                <pre className="text-[10px] font-mono mt-2 bg-bg-root border border-border-subtle rounded p-2 max-h-[200px] overflow-y-auto whitespace-pre-wrap text-text-secondary">
                  {rawDebug}
                </pre>
              )}
            </div>
          )}
        </section>

        {/* Result */}
        {result && (
          <>
            <section className="border border-accent/30 bg-accent/5 rounded-lg p-4">
              <div className="text-[10px] font-mono text-accent uppercase tracking-wider mb-1">
                产品总结
              </div>
              <p className="text-[13px] text-text-primary mb-3">{result.productSummary}</p>
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1">
                显然客群 (AI 识别 · 已避开)
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.defaultSegments.map((s, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 border border-border-subtle rounded text-text-tertiary line-through">
                    {s}
                  </span>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[14px] font-bold text-text-primary">
                  挖出 {result.newSegments.length} 个新客群
                </div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  按转化潜力排序 · 越靠前越值得测试
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {resultStandardPackHref && (
                  <Link
                    href={resultStandardPackHref}
                    className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
                  >
                    生成内容测试验收标品包
                  </Link>
                )}
                <button
                  onClick={exportMarkdown}
                  className="text-[11px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-3 py-1.5"
                >
                  ⬇ 导出 Markdown
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.newSegments.map((seg, i) => (
                <div key={i} className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 hover:border-accent/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-accent">#{i + 1}</span>
                      <h3 className="text-[14px] font-bold text-text-primary">{seg.name}</h3>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-[12px]">
                    <div>
                      <span className="text-[10px] font-mono text-text-tertiary uppercase">动机洞察</span>
                      <p className="text-text-secondary leading-relaxed mt-0.5">{seg.insight}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-text-tertiary uppercase">卖点翻译</span>
                      <p className="text-accent leading-relaxed mt-0.5 font-medium">{seg.translation}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-text-tertiary uppercase">触达渠道</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {seg.channels.map((c, ci) => (
                          <span key={ci} className="text-[10px] font-mono px-1.5 py-0.5 bg-bg-raised rounded text-text-secondary">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-text-tertiary uppercase">示例文案</span>
                      <blockquote className="border-l-2 border-accent/40 pl-2 mt-0.5 text-text-primary italic">
                        {seg.copyExample}
                      </blockquote>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-text-tertiary uppercase">搜索词</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {seg.searchQueries.map((q, qi) => (
                          <code key={qi} className="text-[10px] font-mono px-1.5 py-0.5 bg-bg-root border border-border-subtle rounded text-text-secondary">
                            {q}
                          </code>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Workflow next-step */}
            <div className="border border-accent/30 bg-accent/5 rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[12px] text-text-secondary">
                <span className="text-accent font-semibold">下一步 →</span>
                {' '}挑 1-2 个高潜人群,去 AI 影棚按它们的语境出图,再去新品上新生成 listing
              </div>
              <div className="flex gap-2">
                <Link
                  href="/pipelines/ai-photoshoot"
                  className="text-[11px] font-mono px-3 py-1.5 bg-accent text-bg-root rounded hover:bg-accent-hover"
                >
                  🎬 去 AI 影棚 →
                </Link>
                <Link
                  href="/pipelines/new-listing"
                  className="text-[11px] font-mono px-3 py-1.5 border border-border-default text-text-primary rounded hover:border-accent/40"
                >
                  📋 去新品上新 →
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!result && !running && (
          <div className="border border-dashed border-border-default rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-[15px] font-bold text-text-primary mb-1">先试一个案例</h3>
            <p className="text-[12px] text-text-tertiary mb-4">点上方&quot;智能电子锁/加湿器/溯溪鞋&quot;任一,看 AI 怎么挖出非显然客群</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              <div className="border border-border-subtle rounded p-3 bg-bg-surface/30">
                <div className="text-[12px] font-semibold text-text-primary mb-1">🔐 电子锁</div>
                <div className="text-[11px] text-text-tertiary leading-relaxed">默认想到装修业主,AI 可能挖出: 美甲师 / 健身房常客 / 抱娃宝妈</div>
              </div>
              <div className="border border-border-subtle rounded p-3 bg-bg-surface/30">
                <div className="text-[12px] font-semibold text-text-primary mb-1">💧 加湿器</div>
                <div className="text-[11px] text-text-tertiary leading-relaxed">默认想到北方冬季,AI 可能挖出: 主播 / 多肉玩家 / 鼻炎患者 / 咖啡爱好者</div>
              </div>
              <div className="border border-border-subtle rounded p-3 bg-bg-surface/30">
                <div className="text-[12px] font-semibold text-text-primary mb-1">👟 溯溪鞋</div>
                <div className="text-[11px] text-text-tertiary leading-relaxed">默认想到户外玩家,AI 可能挖出: 城市机能风穿搭党 / 海边旅游党 / 父母遛娃</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-[1100px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          其他模块
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/ai-photoshoot" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            🎬 AI 影棚 (7 模式) →
          </Link>
          <Link href="/pipelines/new-listing" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            📋 新品上新 →
          </Link>
          <Link href="/pipelines/influencer-outbound" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            📨 达人外联 →
          </Link>
          <Link href="/inquire?from=intent-mining" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            企业批量定制 →
          </Link>
        </div>
      </div>
    </div>
  );
}
