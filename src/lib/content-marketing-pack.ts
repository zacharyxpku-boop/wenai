import { buildStandardPackRoute } from './standard-pack-routing';
import { getCategoryGuardrail } from './ecommerce-guardrails';

export interface ContentMarketingPackInput {
  category: string;
  sku: string;
  platform: 'tiktok' | 'instagram' | 'both';
  benchmarkLinks: string;
  brandVoice?: string;
  campaignGoal?: string;
}

export interface HookMatrixRow {
  angle: string;
  hook: string;
  firstFrame: string;
  proofNeeded: string;
  riskCheck: string;
}

export interface ContentMarketingPack {
  categoryLabel: string;
  platformLabel: string;
  hookMatrix: HookMatrixRow[];
  slideshowBrief: string[];
  reelBrief: string[];
  publishingReport: string[];
  redlines: string[];
  standardPackHref: string;
  markdown: string;
}

const PLATFORM_LABEL: Record<ContentMarketingPackInput['platform'], string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  both: 'TikTok + Instagram',
};

function hasBenchmark(input: ContentMarketingPackInput): boolean {
  return input.benchmarkLinks.trim().length >= 8;
}

export function buildContentMarketingPack(input: ContentMarketingPackInput): ContentMarketingPack {
  const playbook = getCategoryGuardrail(input.category);
  const platformLabel = PLATFORM_LABEL[input.platform];
  const benchmarkReady = hasBenchmark(input);
  const sku = input.sku.trim() || 'SKU not provided';
  const goal = input.campaignGoal?.trim() || 'validate hooks and content angles before scaling';

  const hookMatrix: HookMatrixRow[] = [
    {
      angle: 'Problem-first',
      hook: `Stop showing ${sku} as a product. Show the buyer problem in the first second.`,
      firstFrame: 'Messy before-state or high-friction usage moment.',
      proofNeeded: playbook.requiredProof[0] || 'SKU proof',
      riskCheck: playbook.reviewQuestions[0] || 'Human review required.',
    },
    {
      angle: 'Proof-first',
      hook: `The detail that makes this ${playbook.label} SKU believable is not the claim. It is the proof.`,
      firstFrame: 'Close-up proof shot, spec overlay, or side-by-side comparison.',
      proofNeeded: playbook.requiredProof[1] || 'Benchmark proof',
      riskCheck: playbook.reviewQuestions[1] || 'Avoid unsupported claims.',
    },
    {
      angle: 'Context-first',
      hook: `Put the SKU inside the exact use case the buyer already recognizes.`,
      firstFrame: 'Realistic context shot with one clear action.',
      proofNeeded: playbook.requiredProof[2] || 'Use-case proof',
      riskCheck: playbook.reviewQuestions[2] || 'Do not over-generalize.',
    },
    {
      angle: 'Objection-first',
      hook: `The buyer objection is the script. Answer it before the CTA.`,
      firstFrame: 'Text overlay naming one objection: fit, size, safety, compatibility, material, or price.',
      proofNeeded: 'FAQ, review quote, benchmark pattern, or customer-service issue.',
      riskCheck: playbook.forbiddenClaims[0] || 'No exaggerated promise.',
    },
  ];

  const slideshowBrief = [
    'Version A: problem-first five-frame slideshow. One variable only: opening pain.',
    'Version B: proof-first five-frame slideshow. One variable only: proof order.',
    'Version C: context-first five-frame slideshow. One variable only: usage scene.',
    'Name every version with SKU, platform, angle, date, and review owner.',
  ];

  const reelBrief = [
    `Opening 0-2s: ${hookMatrix[0].firstFrame}`,
    'Middle 3-8s: show one feature turning into one buyer benefit.',
    'Proof 9-13s: show material, compatibility, size, ingredient, fit, or benchmark-backed proof.',
    'CTA 14-18s: ask for one low-friction action, not a hard sell.',
  ];

  const publishingReport = [
    `Benchmark evidence: ${benchmarkReady ? 'ready for teardown' : 'missing, treat output as hypothesis only'}.`,
    `Campaign goal: ${goal}.`,
    'Publish only variants that have a review owner and redline check.',
    'Review after 7 days: hook retention, save/share/comment signal, SKU page click, and customer-service objections.',
    'Decision: expand winning hook, repair weak proof, or collect more benchmark evidence.',
  ];

  const redlines = [
    ...playbook.forbiddenClaims.slice(0, 4),
    'Do not copy competitor assets or captions verbatim.',
    'Do not treat synthetic examples as real user testimonials.',
  ];

  const markdown = [
    '# wenai Content Marketing Pack',
    '',
    `- Category: ${playbook.label}`,
    `- Platform: ${platformLabel}`,
    `- SKU: ${sku}`,
    `- Goal: ${goal}`,
    `- Benchmark state: ${benchmarkReady ? 'ready' : 'missing / hypothesis-only'}`,
    '',
    '## TikTok / Instagram hook matrix',
    ...hookMatrix.map(row => `- ${row.angle}: ${row.hook} / First frame: ${row.firstFrame} / Proof: ${row.proofNeeded} / Risk: ${row.riskCheck}`),
    '',
    '## Slideshow brief',
    ...slideshowBrief.map(item => `- ${item}`),
    '',
    '## Reel brief',
    ...reelBrief.map(item => `- ${item}`),
    '',
    '## Publishing report',
    ...publishingReport.map(item => `- ${item}`),
    '',
    '## Redlines',
    ...redlines.map(item => `- ${item}`),
  ].join('\n');

  const standardPackHref = buildStandardPackRoute({
    workflow: 'slideshow-batch',
    goal,
    brand: `${playbook.label} / ${platformLabel} / ${input.brandVoice || 'brand voice not provided'}`,
    sku,
    links: input.benchmarkLinks || 'benchmark missing; output must be treated as hypothesis only',
  });

  return {
    categoryLabel: playbook.label,
    platformLabel,
    hookMatrix,
    slideshowBrief,
    reelBrief,
    publishingReport,
    redlines,
    standardPackHref,
    markdown,
  };
}
