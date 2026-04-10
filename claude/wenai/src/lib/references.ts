import translateExamples from '@/data/references/translate-examples.json';
import reviewsExamples from '@/data/references/reviews-examples.json';
import customerServiceExamples from '@/data/references/customer-service-examples.json';
import copywritingExamples from '@/data/references/copywriting-examples.json';
import outreachExamples from '@/data/references/outreach-examples.json';
import competitorExamples from '@/data/references/competitor-examples.json';

const referenceMap: Record<string, unknown> = {
  translate: translateExamples,
  reviews: reviewsExamples,
  'customer-service': customerServiceExamples,
  copywriting: copywritingExamples,
  outreach: outreachExamples,
  competitor: competitorExamples,
};

export function getReferenceContext(moduleId: string): string {
  const ref = referenceMap[moduleId];
  if (!ref) return '';

  // Build a condensed reference string from examples
  const data = ref as { examples: unknown[]; [key: string]: unknown };
  if (!data.examples || data.examples.length === 0) return '';

  // Take first 2 examples as few-shot context
  const samples = data.examples.slice(0, 2);
  return `\n\n【参考案例（仅供风格参考，不要照抄）】\n${JSON.stringify(samples, null, 0).substring(0, 2000)}`;
}
