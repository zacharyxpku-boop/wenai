import { readFileSync } from 'fs';
import { join } from 'path';
import translateExamples from '@/data/references/translate-examples.json';
import reviewsExamples from '@/data/references/reviews-examples.json';
import customerServiceExamples from '@/data/references/customer-service-examples.json';
import copywritingExamples from '@/data/references/copywriting-examples.json';
import outreachExamples from '@/data/references/outreach-examples.json';
import competitorExamples from '@/data/references/competitor-examples.json';
import contentExamples from '@/data/references/content-examples.json';
import livestreamExamples from '@/data/references/livestream-examples.json';
import selectionExamples from '@/data/references/selection-examples.json';
import operationsExamples from '@/data/references/operations-examples.json';
import leadsExamples from '@/data/references/leads-examples.json';
import ipComplianceExamples from '@/data/references/ip-compliance-examples.json';
import videoExamples from '@/data/references/video-examples.json';
import imagesExamples from '@/data/references/images-examples.json';
import privateDomainExamples from '@/data/references/private-domain-examples.json';
import dataInsightsExamples from '@/data/references/data-insights-examples.json';
import adOptimizerExamples from '@/data/references/ad-optimizer-examples.json';

const referenceMap: Record<string, unknown> = {
  translate: translateExamples,
  reviews: reviewsExamples,
  'customer-service': customerServiceExamples,
  copywriting: copywritingExamples,
  outreach: outreachExamples,
  competitor: competitorExamples,
  content: contentExamples,
  livestream: livestreamExamples,
  selection: selectionExamples,
  operations: operationsExamples,
  leads: leadsExamples,
  'ip-compliance': ipComplianceExamples,
  'ocr-translate': translateExamples,
  video: videoExamples,
  images: imagesExamples,
  'private-domain': privateDomainExamples,
  'data-insights': dataInsightsExamples,
  'ad-optimizer': adOptimizerExamples,
};

// Industry benchmarks (lazy-loaded)
let benchmarkData: Record<string, unknown> | null = null;

function getBenchmarks(): Record<string, unknown> | null {
  if (benchmarkData !== undefined && benchmarkData !== null) return benchmarkData;
  try {
    const path = join(process.cwd(), 'src/data/industry-benchmarks.json');
    benchmarkData = JSON.parse(readFileSync(path, 'utf-8'));
    return benchmarkData;
  } catch {
    benchmarkData = null;
    return null;
  }
}

// Modules that benefit from industry context
const BENCHMARK_MODULES = new Set([
  'competitor', 'selection', 'operations', 'copywriting', 'reviews', 'leads',
]);

export function getReferenceContext(moduleId: string, userInput?: string): string {
  const ref = referenceMap[moduleId];
  if (!ref) return '';

  const data = ref as { examples: unknown[]; [key: string]: unknown };
  if (!data.examples || data.examples.length === 0) return '';

  // Select 3 examples (random rotation for diversity across calls)
  const exampleCount = Math.min(3, data.examples.length);
  const startIdx = data.examples.length > 3
    ? Math.floor(Math.random() * (data.examples.length - exampleCount))
    : 0;
  const samples = data.examples.slice(startIdx, startIdx + exampleCount);

  const rules = (data.rules || data.principles || data.output_rules || []) as string[];
  const rulesStr = rules.length > 0
    ? `\n\n【输出规则】\n${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
    : '';

  let context = `\n\n【参考案例（仅供风格参考，不要照抄）】\n${JSON.stringify(samples, null, 0).substring(0, 3000)}${rulesStr}`;

  // Inject relevant industry benchmarks for intelligence modules
  if (BENCHMARK_MODULES.has(moduleId)) {
    const benchmarks = getBenchmarks();
    if (benchmarks) {
      const categories = benchmarks.categories as Record<string, unknown> | undefined;
      if (categories) {
        // Try to match user input to a category
        const catKeywords: Record<string, string[]> = {
          electronics: ['电子', '耳机', '充电', '蓝牙', 'bluetooth', 'earbuds', 'charger', 'phone', '手机'],
          home: ['家居', '厨房', '收纳', 'home', 'kitchen', 'storage'],
          beauty: ['美妆', '护肤', '化妆', 'beauty', 'skincare', 'cosmetic'],
          sports: ['运动', '户外', '健身', 'sport', 'outdoor', 'fitness'],
          fashion: ['服装', '鞋', '包', 'fashion', 'clothing', 'shoes'],
          pet: ['宠物', 'pet', 'dog', 'cat'],
          toys: ['玩具', '儿童', 'toy', 'kids'],
          auto: ['汽车', '车载', 'car', 'auto', 'vehicle'],
        };

        const inputLower = (userInput || '').toLowerCase();
        let matchedCat: string | null = null;
        for (const [cat, keywords] of Object.entries(catKeywords)) {
          if (keywords.some(kw => inputLower.includes(kw))) {
            matchedCat = cat;
            break;
          }
        }

        if (matchedCat && categories[matchedCat]) {
          const catData = categories[matchedCat] as Record<string, unknown>;
          context += `\n\n【行业基准数据 - ${matchedCat}】\n${JSON.stringify(catData, null, 0).substring(0, 1200)}`;
        }
      }
    }
  }

  return context;
}
