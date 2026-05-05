import { getCategoryGuardrail } from './ecommerce-guardrails';

export interface BrandIqInput {
  category: string;
  brandName?: string;
  brandVoice?: string;
  forbiddenWords?: string;
  platforms?: string;
  owner?: string;
  benchmarkLinks?: string;
}

export interface BrandIqProfile {
  categoryLabel: string;
  brandName: string;
  voiceRules: string[];
  forbiddenClaims: string[];
  proofRequirements: string[];
  acceptanceThresholds: {
    reviewPassRate: number;
    benchmarkCoverage: number;
    maxRiskCount: number;
    ownerRequired: boolean;
  };
  workflowDefaults: string[];
  readinessScore: number;
  risks: string[];
  markdown: string;
}

function splitList(value?: string): string[] {
  return (value || '')
    .split(/[,;\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildBrandIqProfile(input: BrandIqInput): BrandIqProfile {
  const playbook = getCategoryGuardrail(input.category);
  const customForbidden = splitList(input.forbiddenWords);
  const voice = input.brandVoice?.trim() || 'clear, evidence-led, not exaggerated';
  const hasOwner = Boolean(input.owner?.trim());
  const hasBenchmarks = Boolean(input.benchmarkLinks?.trim());
  const hasPlatform = Boolean(input.platforms?.trim());

  const voiceRules = [
    `Use ${voice} language.`,
    'Lead with buyer problem, then proof, then product detail.',
    'Keep every benefit tied to a visible SKU fact, benchmark pattern, or review owner.',
    'Do not turn hypotheses into guarantees.',
  ];

  const forbiddenClaims = Array.from(new Set([
    ...playbook.forbiddenClaims,
    ...customForbidden,
    'guaranteed conversion',
    'platform-safe without review',
    'real customer quote without source',
  ]));

  const workflowDefaults = [
    'Launch Pack: SKU fields, image direction, listing copy, compliance redlines, customer-service FAQ.',
    'Growth Pack: TikTok/Instagram benchmark, hook matrix, slideshow/reel brief, 7-day publishing report.',
    'Review Pack: acceptance score, blockers, contract next step, owner, SLA due date.',
  ];

  const risks = [
    hasOwner ? '' : 'Review owner is missing.',
    hasBenchmarks ? '' : 'Benchmark links are missing; marketing output is hypothesis-only.',
    hasPlatform ? '' : 'Target platform is missing.',
    customForbidden.length > 0 ? '' : 'No custom brand forbidden words provided.',
  ].filter(Boolean);

  const readinessScore = clampScore(
    62 +
    (hasOwner ? 12 : 0) +
    (hasBenchmarks ? 10 : 0) +
    (hasPlatform ? 8 : 0) +
    (customForbidden.length > 0 ? 8 : 0),
  );

  const markdown = [
    '# wenai Brand IQ Profile',
    '',
    `- Brand: ${input.brandName?.trim() || 'Unnamed brand'}`,
    `- Category: ${playbook.label}`,
    `- Platforms: ${input.platforms?.trim() || 'not provided'}`,
    `- Review owner: ${input.owner?.trim() || 'not assigned'}`,
    `- Readiness: ${readinessScore}/100`,
    '',
    '## Voice rules',
    ...voiceRules.map(item => `- ${item}`),
    '',
    '## Forbidden claims',
    ...forbiddenClaims.map(item => `- ${item}`),
    '',
    '## Required proof',
    ...playbook.requiredProof.map(item => `- ${item}`),
    '',
    '## Acceptance thresholds',
    `- Review pass rate >= ${playbook.acceptanceThresholds.reviewPassRate}%`,
    `- Benchmark coverage >= ${playbook.acceptanceThresholds.benchmarkCoverage}%`,
    `- Max unresolved risks <= ${playbook.acceptanceThresholds.maxRiskCount}`,
    '',
    '## Default workflows',
    ...workflowDefaults.map(item => `- ${item}`),
    '',
    '## Current risks',
    ...(risks.length > 0 ? risks.map(item => `- ${item}`) : ['- No critical Brand IQ setup risk.']),
  ].join('\n');

  return {
    categoryLabel: playbook.label,
    brandName: input.brandName?.trim() || 'Unnamed brand',
    voiceRules,
    forbiddenClaims,
    proofRequirements: playbook.requiredProof,
    acceptanceThresholds: playbook.acceptanceThresholds,
    workflowDefaults,
    readinessScore,
    risks,
    markdown,
  };
}
