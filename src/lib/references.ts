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
};

export function getReferenceContext(moduleId: string): string {
  const ref = referenceMap[moduleId];
  if (!ref) return '';

  // Build a condensed reference string from examples
  const data = ref as { examples: unknown[]; [key: string]: unknown };
  if (!data.examples || data.examples.length === 0) return '';

  // Take first 2 examples as few-shot context
  const samples = data.examples.slice(0, 2);
  const rules = (data.rules || data.principles || data.output_rules || []) as string[];
  const rulesStr = rules.length > 0 ? `\n\n【输出规则】\n${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}` : '';
  return `\n\n【参考案例（仅供风格参考，不要照抄）】\n${JSON.stringify(samples, null, 0).substring(0, 1800)}${rulesStr}`;
}
