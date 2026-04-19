'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * ROI 计算器 · 说服新访客 "wenai 一个月能省多少钱"
 * 纯客户端 state,无 API 调用
 *
 * 输入 : 日均新品 SKU 数 + 日均达人触达数
 * 输出 : 每月节省的人力成本 vs Team ¥499/月 = ROI 倍数
 */

interface Calc {
  skuPerDay: number;
  influencerPerDay: number;
  salary: number; // 每月运营人力成本 ¥ 参考义乌 ~5000
}

const DEFAULTS: Calc = { skuPerDay: 20, influencerPerDay: 20, salary: 5000 };

// 每 SKU 手工耗时分钟 (基于 H 代运营案例)
const MIN_PER_SKU = 80;
// 每达人手工耗时分钟 (基于 M 工厂案例 200min/10人)
const MIN_PER_INFLUENCER = 20;
// 每月工作日
const WORK_DAYS = 22;
// 每月工作分钟数 (8 小时/天 * 60)
const MIN_PER_MONTH = WORK_DAYS * 8 * 60;

const TEAM_PRICE = 499;

export default function ROICalculator() {
  const [calc, setCalc] = useState<Calc>(DEFAULTS);
  const [expanded, setExpanded] = useState(false);

  const monthlyMinutes = (calc.skuPerDay * MIN_PER_SKU + calc.influencerPerDay * MIN_PER_INFLUENCER) * WORK_DAYS;
  const personMonths = monthlyMinutes / MIN_PER_MONTH;
  const monthlySavings = Math.round(personMonths * calc.salary);
  const roiMultiple = monthlySavings > 0 ? Math.round(monthlySavings / TEAM_PRICE) : 0;

  return (
    <div className="mt-6 border border-border-subtle rounded-md bg-bg-surface/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-bg-surface transition-colors text-left"
      >
        <div className="w-8 h-8 border border-accent/30 rounded-md flex items-center justify-center text-accent text-[14px] flex-shrink-0">
          📊
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-text-primary">
            ROI 计算器 · 算你公司能省多少
          </div>
          <div className="text-[10px] font-mono text-text-tertiary">
            输入日均 SKU 和达人量,秒算每月人力节省 vs Team ¥499
          </div>
        </div>
        <span className="text-[11px] font-mono text-accent flex-shrink-0">
          {expanded ? '收起 ▲' : '展开 ▼'}
        </span>
      </button>

      {expanded && (
        <div className="p-4 pt-0 border-t border-border-subtle">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 mt-4">
            <div>
              <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block mb-1.5">
                日均新品 SKU
              </label>
              <input
                type="number"
                value={calc.skuPerDay}
                onChange={e => setCalc({ ...calc, skuPerDay: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 bg-bg-raised border border-border-default rounded text-[12px] font-mono"
                min="0"
              />
              <div className="text-[9px] font-mono text-text-tertiary/70 mt-0.5">每 SKU 手工 80 分钟</div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block mb-1.5">
                日均达人触达
              </label>
              <input
                type="number"
                value={calc.influencerPerDay}
                onChange={e => setCalc({ ...calc, influencerPerDay: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 bg-bg-raised border border-border-default rounded text-[12px] font-mono"
                min="0"
              />
              <div className="text-[9px] font-mono text-text-tertiary/70 mt-0.5">每达人手工 20 分钟</div>
            </div>
            <div>
              <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block mb-1.5">
                运营月薪 (¥)
              </label>
              <input
                type="number"
                value={calc.salary}
                onChange={e => setCalc({ ...calc, salary: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-2.5 py-1.5 bg-bg-raised border border-border-default rounded text-[12px] font-mono"
                min="0"
                step="500"
              />
              <div className="text-[9px] font-mono text-text-tertiary/70 mt-0.5">义乌参考 ¥3-5k</div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="p-3 border border-border-subtle rounded bg-bg-raised/50">
              <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1">每月工时节省</div>
              <div className="text-[16px] font-bold text-text-primary tabular-nums">
                {Math.round(monthlyMinutes / 60)} <span className="text-[10px] font-mono text-text-tertiary">小时</span>
              </div>
            </div>
            <div className="p-3 border border-border-subtle rounded bg-bg-raised/50">
              <div className="text-[9px] font-mono text-text-tertiary uppercase mb-1">折算人月</div>
              <div className="text-[16px] font-bold text-text-primary tabular-nums">
                {personMonths.toFixed(1)} <span className="text-[10px] font-mono text-text-tertiary">人月</span>
              </div>
            </div>
            <div className="p-3 border border-success/40 bg-success/5 rounded">
              <div className="text-[9px] font-mono text-success uppercase mb-1">每月节省 ¥</div>
              <div className="text-[16px] font-bold text-success tabular-nums">
                {monthlySavings.toLocaleString('zh-CN')}
              </div>
            </div>
            <div className="p-3 border border-accent/40 bg-accent/10 rounded">
              <div className="text-[9px] font-mono text-accent uppercase mb-1">ROI 倍数</div>
              <div className="text-[16px] font-bold text-accent tabular-nums">
                {roiMultiple > 0 ? `${roiMultiple}×` : '—'}
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="text-[11px] text-text-secondary leading-relaxed mb-3">
            {roiMultiple >= 50 ? (
              <><strong className="text-accent">极高 ROI</strong>. Team ¥499/月 仅占节省的 {(100 / roiMultiple).toFixed(1)}%,
              上 Enterprise 本地部署可能更合适 → <Link href="/enterprise" className="text-accent underline">看企业方案</Link></>
            ) : roiMultiple >= 10 ? (
              <><strong className="text-success">强 ROI</strong>. Team ¥499/月 仅占节省的 {(100 / roiMultiple).toFixed(1)}%,立刻签约。</>
            ) : roiMultiple >= 2 ? (
              <><strong className="text-text-primary">正 ROI</strong>. Team 覆盖成本的 {roiMultiple} 倍,建议 Free 跑一周再定。</>
            ) : (
              <><strong className="text-text-tertiary">规模偏小</strong>. 日均 SKU/达人加起来不够,Free 档 (¥0 · 10 次 Pipeline/天) 就够用。</>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-hover text-bg-root text-[11px] font-semibold rounded"
            >
              {roiMultiple >= 10 ? '订阅 Team →' : '看详细定价'}
            </Link>
            <Link
              href="/invite?code=demo"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border-default text-[11px] font-mono text-text-primary hover:border-accent/40 rounded"
            >
              免费试 7 天
            </Link>
            <Link
              href="/cases"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border-default text-[11px] font-mono text-text-primary hover:border-accent/40 rounded"
            >
              看 4 个案例
            </Link>
          </div>

          <div className="mt-3 pt-3 border-t border-border-subtle text-[9px] font-mono text-text-tertiary/70 leading-relaxed">
            基准: 每 SKU 80 min 含翻译+文案+合规 (H 代运营案例实测). 每达人 20 min 含筛选+个性化邮件 (M 工厂案例).
            每月 22 工作日 × 8 小时 = {MIN_PER_MONTH / 60} 小时/人月.
          </div>
        </div>
      )}
    </div>
  );
}
