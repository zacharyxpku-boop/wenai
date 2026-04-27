/**
 * Hook 预估打分 · MOAT-12 跑前算账
 *
 * 移植自 clico-clean MOAT-07, 但数据源换成 wenai 自己的 cross-org-benchmark
 * 商家粘 hook 文案 + 选 category 即可拿一个 0-100 分 + 预估区间, 不调 LLM 不烧钱
 *
 * 三块组成:
 *   1. 文本质量分 — 启发式规则 (问号 / 数字 / 第二人称 / 强动词 / 避空话)
 *   2. 类目基线分 — 该 category 在 wenai cross-org CTR 桶里中位数 + 样本量信心
 *   3. 类型加成 — 痛点开场 / 数字开场 / 反差开场 各自 weight
 *
 * 数学决定式 · 同样 input 永远同样 output · 商家可以反推
 *
 * 商业意义:
 *   - 跑大批 SKU 主图 / 标题前先粘 hook 算分, 低分的省下 ¥X 不浪费
 *   - 这是 clico 的预生成杀器在 wenai 里的对应位置
 */

import { getBenchSnapshot } from './cross-org-benchmark';

export type HookKind = 'pain' | 'number' | 'contrast' | 'question' | 'story' | 'unknown';

export interface HookScoreInput {
  hookLine: string;
  category?: string;     // 类目 (用于 baseline 拉取)
  hookKind?: HookKind;
}

export interface HookScoreResult {
  score: number;                       // 0-100
  tier: 'low' | 'mid' | 'high';
  textScore: number;                   // 0-1 文本质量
  baselineScore: number;               // 0-1 基线匹配
  confidence: number;                  // 0-1 整体置信
  matchedSamples: number;              // 类目命中样本数
  reasons: string[];                   // 给前端展示, 2-5 条
  predictedCtrFloor: number | null;    // 预估 CTR 下限 % (median × 0.6)
  predictedCtrCeiling: number | null;  // 预估 CTR 上限 % (median × 1.6)
  medianBenchmarkCtr: number | null;
}

/**
 * 文本质量启发式规则集 · 命中 +weight
 * 来源: clico 12 条 seed 观察 + wenai 既有 ecom-prompts 经验
 */
const TEXT_RULES: Array<{ key: string; test: (s: string) => boolean; weight: number; reason: string }> = [
  {
    key: 'has_question',
    test: s => /[?？]/.test(s),
    weight: 0.16,
    reason: '问句开场 · 把观众从滑屏拉到停留',
  },
  {
    key: 'has_number',
    test: s => /\d/.test(s),
    weight: 0.14,
    reason: '含具体数字 · 比形容词触发停留率高',
  },
  {
    key: 'second_person',
    test: s => /(你|your\b|you\b)/i.test(s),
    weight: 0.12,
    reason: '直接喊「你」· 对话式比陈述式留存高',
  },
  {
    key: 'good_length',
    test: s => {
      const n = s.trim().length;
      return n >= 8 && n <= 40;
    },
    weight: 0.12,
    reason: 'hook 长度 8-40 字 · 太短信息量不够, 太长 3 秒说不完',
  },
  {
    key: 'strong_verb',
    test: s => /(停下|别再|直接|终于|彻底|试试|猜|打赌|没想到|竟然|真没想到|来不及)/.test(s),
    weight: 0.10,
    reason: '用了情绪动词 · 减少「AI 机器人文案」的塑料感',
  },
  {
    key: 'specific_locale',
    test: s => /(北美|美东|美西|东南亚|欧洲|小红书|TikTok|抖音|视频号|7 天|30 天|一周|一个月|3 天)/.test(s),
    weight: 0.10,
    reason: '提具体场景/时间 · 观众代入感强',
  },
  {
    key: 'no_ai_fluff',
    test: s => !/(高效|赋能|智能|一站式|精准|打造|解锁|揭秘|震惊|不容错过|颠覆|引爆|赋能)/.test(s),
    weight: 0.14,
    reason: '没有 AI 空话词 · 越像普通人说话表现越好',
  },
  {
    key: 'not_clickbait',
    test: s => !/(必看|速看|警告|紧急|限时|秒杀|疯抢)/.test(s),
    weight: 0.06,
    reason: '没有过度标题党 · 平台风控不易压',
  },
  {
    key: 'has_emotion',
    test: s => /(后悔|心疼|爽|气|爱|烦|累|贵|亏|赚|偷偷|默默)/.test(s),
    weight: 0.06,
    reason: '带情绪词 · 共鸣是停留的根',
  },
];

const HOOK_KIND_BONUS: Record<HookKind, number> = {
  pain:     0.06,  // 痛点开场最稳
  number:   0.05,
  contrast: 0.05,
  question: 0.04,
  story:    0.03,
  unknown:  0,
};

/**
 * 同步打分 · 不依赖 Redis, 给单测和客户端预览用
 *
 * baselineMedian / baselineCount 由调用方传 (从 cross-org-benchmark 拉)
 */
export function scoreHookSync(
  input: HookScoreInput,
  baselineMedianCtr: number | null,
  baselineCount: number,
): HookScoreResult {
  const text = input.hookLine.trim();

  // 1. 文本质量
  const matchedReasons: string[] = [];
  let textScore = 0;
  for (const rule of TEXT_RULES) {
    if (rule.test(text)) {
      textScore += rule.weight;
      matchedReasons.push(rule.reason);
    }
  }
  textScore = Math.min(1, textScore);

  // 2. 基线分 · 命中样本越多越稳, 数学是 logistic-like
  // count=0  → 0.40 (没数据, 给个全行业默认地板)
  // count=10 → 0.60
  // count=30 → 0.75
  // count=100+ → 0.90
  let baselineScore = 0.40;
  if (baselineCount >= 100) baselineScore = 0.90;
  else if (baselineCount >= 30) baselineScore = 0.75;
  else if (baselineCount >= 10) baselineScore = 0.60;
  else if (baselineCount >= 5) baselineScore = 0.50;

  // 3. 类型加成
  const kindBonus = input.hookKind ? HOOK_KIND_BONUS[input.hookKind] : 0;

  // 4. 综合分: text 35% + baseline 55% + kindBonus 0-6%
  const raw = textScore * 0.35 + baselineScore * 0.55 + kindBonus;
  const score = Math.round(Math.max(0, Math.min(1, raw)) * 100);

  // 5. 置信度: 文本规则命中数 + 类目样本量
  const textConf = Math.min(1, matchedReasons.length / 5);
  const sampleConf = Math.min(1, baselineCount / 30);
  const confidence = Number(((textConf * 0.4 + sampleConf * 0.6)).toFixed(2));

  // 6. 预测 CTR 区间 · median 有数据才给
  const floor = baselineMedianCtr !== null ? +(baselineMedianCtr * 0.6).toFixed(2) : null;
  const ceiling = baselineMedianCtr !== null ? +(baselineMedianCtr * 1.6).toFixed(2) : null;

  // 7. 拼 reasons (top 3 文本 + 1 baseline)
  const baselineReason = baselineCount === 0
    ? '该类目还没数据 · 先跑几条 SKU 数据回填能让分更准'
    : baselineCount < 10
      ? `命中 ${baselineCount} 个同类目样本 (样本太少, 仅供参考)`
      : `命中 ${baselineCount} 个同类目样本, 中位 CTR ${baselineMedianCtr?.toFixed(2) ?? '—'}%`;

  const reasons = [...matchedReasons.slice(0, 3), baselineReason];

  return {
    score,
    tier: scoreTier(score),
    textScore: +textScore.toFixed(2),
    baselineScore: +baselineScore.toFixed(2),
    confidence,
    matchedSamples: baselineCount,
    reasons,
    predictedCtrFloor: floor,
    predictedCtrCeiling: ceiling,
    medianBenchmarkCtr: baselineMedianCtr,
  };
}

/** 异步: 自动从 cross-org-benchmark 拉 baseline 再打分 */
export async function scoreHook(input: HookScoreInput): Promise<HookScoreResult> {
  let median: number | null = null;
  let count = 0;
  if (input.category) {
    try {
      const snap = await getBenchSnapshot('ctr', input.category);
      median = snap.p50;
      count = snap.count;
    } catch { /* skip */ }
  }
  return scoreHookSync(input, median, count);
}

export function scoreTier(score: number): 'low' | 'mid' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}
