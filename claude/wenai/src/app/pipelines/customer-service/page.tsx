'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { useMySkus } from '@/lib/use-my-skus';
import { ShareButton } from '@/components/ShareButton';
import { IndustryHint } from '@/components/IndustryHint';
import { buildCustomerServiceStandardPackRoute } from '@/lib/standard-pack-routing';

/**
 * 销售转化 Agent · /pipelines/customer-service
 *
 * 解 SKU 全周期最后一个洞 (痛点 #9): 卖出去之后呢? 客服+复购+留评+追单
 * 与 /modules/customer-service 不同: 这是 SKU 维度的客服, 不是单条消息回复
 *
 * 流程:
 *   1. 选 SKU (默认从 ?skuId= 读, 或 SKU 库选)
 *   2. 选意图类型 (退货/差评/砍价/物流/产品咨询/...)
 *   3. 贴客户原话 + 订单号(可选)
 *   4. AI 出 3 个版本回复 (保守/转化/共情) + 转化钩子 + 升单建议
 *   5. 复制 / 存为 SOP 模板
 */

type Intent = 'inquiry' | 'price' | 'hesitation' | 'complaint' | 'refund' | 'support' | 'shipping' | 'cross-sell';
type Lang = 'zh' | 'en' | 'es';

interface ServiceResult {
  intentDetected: string;
  emotion: string;
  urgency: 'P0' | 'P1' | 'P2';
  replies: {
    safe: { text: string; expected: string };
    convert: { text: string; expected: string };
    empathy: { text: string; expected: string };
  };
  hooks: { trigger: string; reply: string }[];
  upsells: { product: string; pitch: string }[];
  forbidden: string[];
}

function buildCustomerServiceResultSummary(result: ServiceResult): string {
  return [
    `intent: ${result.intentDetected}`,
    `emotion: ${result.emotion}`,
    `urgency: ${result.urgency}`,
    `safe reply: ${result.replies.safe.text.slice(0, 180)} / expected: ${result.replies.safe.expected}`,
    `convert reply: ${result.replies.convert.text.slice(0, 180)} / expected: ${result.replies.convert.expected}`,
    `empathy reply: ${result.replies.empathy.text.slice(0, 180)} / expected: ${result.replies.empathy.expected}`,
    `next-step hooks: ${result.hooks?.slice(0, 3).map(h => `${h.trigger} -> ${h.reply}`).join(' | ') || 'none'}`,
    `upsells: ${result.upsells?.slice(0, 3).map(u => `${u.product}: ${u.pitch}`).join(' | ') || 'none'}`,
    `forbidden: ${result.forbidden?.join(' | ') || 'none'}`,
  ].join('\n');
}

const INTENT_LABELS: Record<Intent, { txt: string; emoji: string; tip: string }> = {
  inquiry: { txt: '产品咨询', emoji: '❓', tip: '问尺寸/材质/对比/适用场景' },
  price: { txt: '价格异议', emoji: '💰', tip: '"能便宜吗" / "太贵了"' },
  hesitation: { txt: '购买犹豫', emoji: '🤔', tip: '"我再想想" / "考虑一下"' },
  complaint: { txt: '投诉差评', emoji: '😠', tip: '质量/物流/描述不符' },
  refund: { txt: '退货退款', emoji: '🔄', tip: '申请退款/退货' },
  support: { txt: '售后维修', emoji: '🔧', tip: '使用问题/坏了' },
  shipping: { txt: '物流催单', emoji: '📦', tip: '"什么时候到" / "物流卡了"' },
  'cross-sell': { txt: '主动追单', emoji: '🚀', tip: '老客复购/升单/连带' },
};

const LANG_LABELS: Record<Lang, string> = {
  zh: '🇨🇳 中文',
  en: '🇺🇸 English',
  es: '🇪🇸 Español',
};

// 8 类客服场景常见原话样本 · 一键贴
const QUICK_SAMPLES: Record<Intent, string> = {
  inquiry: '我是 165cm/55kg, 平时穿 M, 你这件连衣裙我穿 S 还是 M? 偏瘦版还是正码?',
  price: '这个价格能再便宜点吗 看 XX 牌同款只要 ¥99',
  hesitation: '看着不错 但我还是想再考虑一下',
  complaint: '收到货发现颜色和图片差很多 而且有线头 怎么处理',
  refund: '不喜欢 申请退货 麻烦处理一下',
  support: '用了三天突然不亮了 是不是质量问题',
  shipping: '下单 5 天了物流还在揽收 什么情况',
  'cross-sell': '上次买的连衣裙挺好 还有没有别的推荐',
};

export default function CustomerServicePage() {
  const activeSkuId = useActiveSkuId();
  const { skus: mySkus } = useMySkus(20);

  const [intent, setIntent] = useState<Intent>('inquiry');
  const [customerMsg, setCustomerMsg] = useState('');
  const [lang, setLang] = useState<Lang>('zh');
  const [orderId, setOrderId] = useState('');
  const [shopInfo, setShopInfo] = useState('');
  const [linkedSkuId, setLinkedSkuId] = useState<string | null>(null);

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ServiceResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [rawDebug, setRawDebug] = useState('');
  const intentLabel = INTENT_LABELS[intent].txt;
  const languageLabel = LANG_LABELS[lang];
  const standardPackHref = buildCustomerServiceStandardPackRoute({
    intentLabel,
    customerMessage: customerMsg,
    languageLabel,
    shopContext: shopInfo,
    orderContext: orderId,
  });
  const resultStandardPackHref = result
    ? buildCustomerServiceStandardPackRoute({
        intentLabel,
        customerMessage: customerMsg,
        languageLabel,
        shopContext: shopInfo,
        orderContext: orderId,
        resultSummary: buildCustomerServiceResultSummary(result),
      })
    : '';

  // 从 ?skuId= 进来时, 自动锁定该 SKU
  useEffect(() => {
    if (activeSkuId) setLinkedSkuId(activeSkuId);
  }, [activeSkuId]);

  // 锁定后自动填店铺信息上下文 (产品信息从 SKU 库读)
  useEffect(() => {
    if (linkedSkuId && mySkus.length > 0 && !shopInfo) {
      const sku = mySkus.find(s => s.id === linkedSkuId);
      if (sku) {
        setShopInfo(`产品: ${sku.name} (品类: ${sku.category}${sku.priceCny ? ', 价位 ' + sku.priceCny : ''}${sku.platform ? ', 平台 ' + sku.platform : ''})${sku.notes ? '。卖点: ' + sku.notes.slice(0, 150) : ''}`);
      }
    }
  }, [linkedSkuId, mySkus, shopInfo]);

  const buildPrompt = () => `
你是跨境电商销售转化 Agent, 客服+销售双核, 目标是推进成交不只是礼貌回复。

【店铺/产品信息】
${shopInfo || '未填'}

【订单号】${orderId || '未提供'}
【客户意图】${INTENT_LABELS[intent].txt}
【目标语言】${lang === 'zh' ? '中文' : lang === 'en' ? '英语' : '西班牙语'} (回复必须用这个语言)

【任务】严格按 JSON 输出, 不要 markdown 代码块:

{
  "intentDetected": "<识别到的具体意图, 一句话>",
  "emotion": "<客户情绪关键词, 例 焦虑/愤怒/犹豫/好奇/满意>",
  "urgency": "P0 | P1 | P2",
  "replies": {
    "safe": {
      "text": "<安全保守版回复, 直接发给客户的话术>",
      "expected": "<预期效果, 一句话>"
    },
    "convert": {
      "text": "<主动转化版, 推进成交>",
      "expected": "<预期效果>"
    },
    "empathy": {
      "text": "<高情商共情版, 适合差评投诉>",
      "expected": "<预期效果>"
    }
  },
  "hooks": [
    { "trigger": "<客户下一步可能说的话>", "reply": "<对应回复钩子>" },
    { "trigger": "...", "reply": "..." }
  ],
  "upsells": [
    { "product": "<关联商品>", "pitch": "<一句话销售文案>" }
  ],
  "forbidden": ["<这次绝对不能说的 3 句话>"]
}

【铁律】
- 海外市场 (TikTok Shop US/Shopee SEA等), 所有话术用目标市场语言
- 不承诺具体物流天数, 只给 "标准时效 + 查询链接"
- 不承诺具体退款到账时间, 只给 "收到货后 X 个工作日内处理"
- 给选择不给命令: 方案 A/B/C 让客户选, 心理上更易下单
- 数字胜过形容词

【客户原话】
${customerMsg}
`.trim();

  const handleRun = async () => {
    if (!customerMsg.trim()) {
      setError('先贴客户原话');
      return;
    }
    setRunning(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'customer-service',
          prompt: buildPrompt(),
          input: customerMsg,
          skuId: linkedSkuId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const raw: string = data.content || '';
      setRawDebug(raw);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('AI 输出非 JSON');
      const parsed = JSON.parse(m[0]) as ServiceResult;
      setResult(parsed);

      // SKU 关联时, 在 SKU 历史里加一条 module 记录 (轻量, 不阻塞)
      if (linkedSkuId) {
        fetch(`/api/user/sku-history?id=${linkedSkuId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modules: ['customer-service'] }),
        }).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setRunning(false);
    }
  };

  const copyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              CUSTOMER · 销售转化 Agent
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              SKU 全周期 · 最后一站
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            客服不是回复, 是推进成交
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <div className="mb-3"><IndustryHint /></div>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[820px]">
            把&quot;客户咨询&quot;变&quot;主动成交&quot;: 8 类典型意图自动识别, 三版回复(保守/转化/共情)直接发,
            <span className="text-accent">下一步话术钩子提前备好</span>,
            升单/挽留机会自动出。SKU 关联让客服互动反向沉淀到产品档案。
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6">
        {/* LEFT */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          {/* SKU 锁定 */}
          {mySkus.length > 0 && (
            <section className="border border-cat-content/30 bg-cat-content/5 rounded-lg p-3 space-y-2">
              <div className="text-[10px] font-mono text-cat-content uppercase tracking-wider">
                ① 关联 SKU (产品上下文自动注入)
              </div>
              <select
                value={linkedSkuId || ''}
                onChange={e => {
                  setLinkedSkuId(e.target.value || null);
                  setShopInfo(''); // 让下面 useEffect 重新填
                }}
                className="w-full px-2 py-1.5 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                <option value="">不关联 SKU</option>
                {mySkus.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.category} ({s.status})
                  </option>
                ))}
              </select>
              {linkedSkuId && (
                <Link
                  href={`/me/skus/${linkedSkuId}`}
                  className="text-[10px] font-mono text-cat-content underline hover:text-accent block"
                >
                  → 查看 SKU 档案
                </Link>
              )}
            </section>
          )}

          {/* 意图类型 */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              ② 客户意图类型
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(INTENT_LABELS) as Intent[]).map(k => {
                const meta = INTENT_LABELS[k];
                const active = intent === k;
                return (
                  <button
                    key={k}
                    onClick={() => setIntent(k)}
                    className={`text-left rounded p-2 transition-colors ${
                      active
                        ? 'bg-accent/15 border border-accent/50 text-text-primary'
                        : 'border border-border-subtle text-text-secondary hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <span>{meta.emoji}</span>
                      <span>{meta.txt}</span>
                    </div>
                    <div className="text-[9px] font-mono text-text-tertiary leading-tight mt-0.5">
                      {meta.tip}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 客户原话 */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                ③ 客户原话 *
              </div>
              <button
                onClick={() => setCustomerMsg(QUICK_SAMPLES[intent])}
                className="text-[9px] font-mono text-accent hover:underline"
              >
                贴个 {INTENT_LABELS[intent].emoji} {INTENT_LABELS[intent].txt} 样本 →
              </button>
            </div>
            <textarea
              value={customerMsg}
              onChange={e => setCustomerMsg(e.target.value)}
              placeholder={`贴客户原话 (例: ${QUICK_SAMPLES[intent].slice(0, 30)}...)`}
              rows={4}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none focus:border-accent/60 outline-none"
            />
          </section>

          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">
                ④ 回复语言
              </label>
              <select
                value={lang}
                onChange={e => setLang(e.target.value as Lang)}
                className="w-full px-2 py-1.5 bg-bg-surface border border-border-default rounded text-[12px]"
              >
                {Object.entries(LANG_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">
                ⑤ 订单号 (可选)
              </label>
              <input
                type="text"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="例: TB123456789"
                className="w-full px-3 py-1.5 bg-bg-surface border border-border-default rounded text-[12px]"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-secondary mb-1 block">
                ⑥ 店铺/产品上下文 (锁 SKU 时自动填)
              </label>
              <textarea
                value={shopInfo}
                onChange={e => setShopInfo(e.target.value)}
                placeholder="例: 跨境女装店, 客单 ¥199, 主营连衣裙, 7 天无理由"
                rows={3}
                className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[11px] resize-none"
              />
            </div>
          </section>

          <button
            onClick={handleRun}
            disabled={running || !customerMsg.trim()}
            className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40"
          >
            {running ? '生成中... (8-15 秒)' : `🤝 出三版回复 · ${INTENT_LABELS[intent].txt}`}
          </button>

          <Link
            href={standardPackHref}
            className={`block w-full py-3 text-center rounded-lg text-[12px] font-bold border transition-colors ${
              customerMsg.trim().length
                ? 'border-cat-content/40 text-cat-content hover:bg-cat-content/10'
                : 'border-border-subtle text-text-tertiary pointer-events-none opacity-50'
            }`}
          >
            生成客服 SOP 标品包
          </Link>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
              {rawDebug && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[10px]">看 AI 原文</summary>
                  <pre className="text-[10px] font-mono bg-bg-root border border-border-subtle rounded p-2 max-h-[200px] overflow-y-auto whitespace-pre-wrap mt-1">
                    {rawDebug}
                  </pre>
                </details>
              )}
            </div>
          )}
        </aside>

        {/* RIGHT */}
        <main className="space-y-4 min-h-[600px]">
          {!running && !result && <EmptyState />}

          {running && (
            <div className="border border-accent/40 bg-accent/5 rounded-lg p-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <div>
                <div className="text-[13px] font-semibold text-text-primary">在生成三版回复</div>
                <div className="text-[10px] font-mono text-text-tertiary mt-0.5">
                  意图识别 → 三版话术 → 转化钩子 → 升单建议
                </div>
              </div>
            </div>
          )}

          {!running && result && (
            <ResultView
              result={result}
              copyText={copyText}
              copied={copied}
              intent={intent}
              customerMsg={customerMsg}
              lang={lang}
              standardPackHref={resultStandardPackHref}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-dashed border-border-default rounded-lg p-8 text-center">
      <div className="text-4xl mb-2">🤝</div>
      <h3 className="text-[16px] font-bold text-text-primary mb-1">客服 ≠ 礼貌回复, 客服 = 推进成交</h3>
      <p className="text-[12px] text-text-tertiary mb-5">
        每条消息推进一步: 咨询 → 推荐 / 砍价 → 赠品 / 投诉 → 挽留
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
        <Tip emoji="🎯" title="意图自动识别" desc="8 类场景, 紧急度 + 情绪标签可视化" />
        <Tip emoji="📝" title="三版回复并列" desc="保守/转化/共情, 直接发给客户" />
        <Tip emoji="🪝" title="下一步钩子" desc="客户回什么, 立刻有备好的回复" />
      </div>
    </div>
  );
}

function Tip({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="border border-border-subtle rounded p-3 bg-bg-surface/30">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-[12px] font-semibold text-text-primary mb-1">{title}</div>
      <div className="text-[11px] text-text-tertiary leading-relaxed">{desc}</div>
    </div>
  );
}

function ResultView({
  result, copyText, copied, intent, customerMsg, lang, standardPackHref,
}: {
  result: ServiceResult;
  copyText: (k: string, text: string) => void;
  copied: string | null;
  intent: Intent;
  customerMsg: string;
  lang: Lang;
  standardPackHref: string;
}) {
  const buildShareMd = () => {
    const lines: string[] = [];
    lines.push(`# 销售转化客服回复 · ${INTENT_LABELS[intent].txt}`);
    lines.push('');
    lines.push(`> 客户原话: ${customerMsg.slice(0, 200)}`);
    lines.push('');
    lines.push(`**识别意图**: ${result.intentDetected}`);
    lines.push(`**客户情绪**: ${result.emotion} · **紧急度**: ${result.urgency}`);
    lines.push('');
    lines.push('## 三版回复');
    lines.push('');
    lines.push('### 🛡️ 保守版');
    lines.push(result.replies.safe.text);
    lines.push(`> ${result.replies.safe.expected}`);
    lines.push('');
    lines.push('### 🚀 转化版');
    lines.push(result.replies.convert.text);
    lines.push(`> ${result.replies.convert.expected}`);
    lines.push('');
    lines.push('### 💗 共情版');
    lines.push(result.replies.empathy.text);
    lines.push(`> ${result.replies.empathy.expected}`);
    lines.push('');
    if (result.hooks?.length) {
      lines.push('## 🪝 下一步钩子');
      result.hooks.forEach(h => {
        lines.push(`- 客户「${h.trigger}」 → 回: ${h.reply}`);
      });
      lines.push('');
    }
    if (result.upsells?.length) {
      lines.push('## 📈 升单建议');
      result.upsells.forEach(u => {
        lines.push(`- **${u.product}**: ${u.pitch}`);
      });
      lines.push('');
    }
    if (result.forbidden?.length) {
      lines.push('## 🚫 这次不能说');
      result.forbidden.forEach(f => lines.push(`- ${f}`));
      lines.push('');
    }
    lines.push('---');
    lines.push('*由 wenai 客服话术演示流程生成 · 准备真实 SKU 时, 请通过 /inquire 提交 POC 需求。*');
    return lines.join('\n');
  };

  const URGENCY_COLOR: Record<string, string> = {
    P0: 'text-error border-error/40 bg-error/10',
    P1: 'text-warning border-warning/40 bg-warning/10',
    P2: 'text-success border-success/40 bg-success/10',
  };
  void lang;
  return (
    <>
      {/* 分享按钮 */}
      <div className="flex justify-end">
        <Link
          href={standardPackHref}
          className="mr-2 text-[10px] font-mono px-2.5 py-1 rounded border border-cat-content/40 text-cat-content hover:bg-cat-content/10"
        >
          生成客服验收标品包
        </Link>
        <ShareButton
          buildPayload={() => ({
            moduleId: 'customer-service',
            title: `${INTENT_LABELS[intent].txt} · 三版客服回复 (${result.urgency})`,
            content: buildShareMd(),
            source: 'module' as const,
          })}
        />
      </div>
      {/* 顶部识别摘要 */}
      <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">识别意图</div>
          <div className="text-[13px] font-semibold text-text-primary leading-tight">
            {INTENT_LABELS[intent].emoji} {result.intentDetected}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">客户情绪</div>
          <div className="text-[13px] font-semibold text-text-primary">{result.emotion}</div>
        </div>
        <div>
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">紧急度</div>
          <span className={`text-[12px] font-mono font-bold border rounded px-2 py-0.5 ${URGENCY_COLOR[result.urgency] || ''}`}>
            {result.urgency}
          </span>
        </div>
      </section>

      {/* 三版回复 */}
      <section className="space-y-3">
        <div className="text-[12px] font-bold text-text-primary">三版回复 (直接复制发给客户)</div>
        <ReplyCard
          color="success"
          tag="🛡️ 保守版"
          desc="不冒进, 安全留住客户"
          text={result.replies.safe.text}
          expected={result.replies.safe.expected}
          copyKey="safe"
          copyText={copyText}
          copied={copied === 'safe'}
        />
        <ReplyCard
          color="accent"
          tag="🚀 转化版"
          desc="主动推单, 推进成交"
          text={result.replies.convert.text}
          expected={result.replies.convert.expected}
          copyKey="convert"
          copyText={copyText}
          copied={copied === 'convert'}
        />
        <ReplyCard
          color="cat-content"
          tag="💗 共情版"
          desc="高情商, 适合差评投诉"
          text={result.replies.empathy.text}
          expected={result.replies.empathy.expected}
          copyKey="empathy"
          copyText={copyText}
          copied={copied === 'empathy'}
        />
      </section>

      {/* 钩子 + 升单 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {result.hooks && result.hooks.length > 0 && (
          <section className="border border-warning/30 bg-warning/5 rounded-lg p-4">
            <div className="text-[10px] font-mono text-warning uppercase tracking-wider mb-2">
              🪝 下一步钩子 (客户再说什么, 立刻这样回)
            </div>
            <ul className="space-y-2 text-[11px]">
              {result.hooks.map((h, i) => (
                <li key={i} className="border-l-2 border-warning/40 pl-2.5 space-y-1">
                  <div className="text-text-tertiary italic">客户: 「{h.trigger}」</div>
                  <div className="text-text-primary">→ 回: {h.reply}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
        {result.upsells && result.upsells.length > 0 && (
          <section className="border border-cat-content/30 bg-cat-content/5 rounded-lg p-4">
            <div className="text-[10px] font-mono text-cat-content uppercase tracking-wider mb-2">
              📈 升单 / 追单机会
            </div>
            <ul className="space-y-2 text-[11px]">
              {result.upsells.map((u, i) => (
                <li key={i} className="border border-border-subtle rounded p-2 bg-bg-surface/30">
                  <div className="text-text-primary font-semibold">{u.product}</div>
                  <div className="text-text-tertiary leading-relaxed mt-0.5">{u.pitch}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 禁忌 */}
      {result.forbidden && result.forbidden.length > 0 && (
        <section className="border border-error/30 bg-error/5 rounded-lg p-4">
          <div className="text-[10px] font-mono text-error uppercase tracking-wider mb-2">
            🚫 这次绝对不能说
          </div>
          <ul className="space-y-1 text-[11px]">
            {result.forbidden.map((f, i) => (
              <li key={i} className="text-text-primary flex items-start gap-1.5">
                <span className="text-error/60">·</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function ReplyCard({
  color, tag, desc, text, expected, copyKey, copyText, copied,
}: {
  color: string;
  tag: string;
  desc: string;
  text: string;
  expected: string;
  copyKey: string;
  copyText: (k: string, text: string) => void;
  copied: boolean;
}) {
  return (
    <div className={`border border-${color}/30 bg-${color}/5 rounded-lg p-4 space-y-2`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className={`text-[12px] font-bold text-${color}`}>{tag}</div>
          <div className="text-[10px] font-mono text-text-tertiary">{desc}</div>
        </div>
        <button
          onClick={() => copyText(copyKey, text)}
          className={`text-[11px] font-mono px-3 py-1 rounded transition-colors ${
            copied
              ? 'bg-success/20 text-success'
              : `border border-${color}/40 text-${color} hover:bg-${color}/10`
          }`}
        >
          {copied ? '✓ 已复制' : '📋 复制'}
        </button>
      </div>
      <div className="bg-bg-root border border-border-subtle rounded p-3">
        <p className="text-[12px] text-text-primary leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      <div className="text-[10px] font-mono text-text-tertiary leading-relaxed">
        → {expected}
      </div>
    </div>
  );
}
