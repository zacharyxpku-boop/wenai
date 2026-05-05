export type PlanId = 'free' | 'team' | 'enterprise';

export interface PlanEntitlement {
  id: PlanId;
  label: string;
  dailyCostCapCents: number;
  moduleLimits: Record<string, number>;
}

const DEFAULT_MODULE_LIMITS: Record<string, number> = {
  default: 50,
  translate: 100,
  reviews: 80,
  copywriting: 80,
  outreach: 60,
  'ip-compliance': 60,
  'pipeline:new-listing': 10,
  'pipeline:influencer-outbound': 10,
  'pipeline:product-image': 5,
  pipeline: 10,
  share: 30,
  inquiry: 5,
  'openai-image': 10,
  'intent-mining': 30,
  'video-gen': 8,
  'video-teardown': 15,
  'product-discovery': 20,
  'ab-test': 25,
  'data-insights': 30,
  'batch-launch': 8,
};

const PLAN_ENTITLEMENTS: Record<PlanId, PlanEntitlement> = {
  free: {
    id: 'free',
    label: 'Demo',
    dailyCostCapCents: 5000,
    moduleLimits: {
      ...DEFAULT_MODULE_LIMITS,
      'openai-image': 3,
      'video-gen': 1,
      'batch-launch': 2,
    },
  },
  team: {
    id: 'team',
    label: 'Team POC',
    dailyCostCapCents: 50000,
    moduleLimits: {
      ...DEFAULT_MODULE_LIMITS,
      'openai-image': 50,
      'video-gen': 20,
      'batch-launch': 20,
      'pipeline:product-image': 30,
    },
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    dailyCostCapCents: 200000,
    moduleLimits: {
      ...DEFAULT_MODULE_LIMITS,
      default: 500,
      'openai-image': 200,
      'video-gen': 80,
      'batch-launch': 100,
      'pipeline:product-image': 120,
    },
  },
};

export function normalizePlanId(plan?: string | null): PlanId {
  if (plan === 'team' || plan === 'enterprise') return plan;
  return 'free';
}

export function getPlanEntitlement(plan?: string | null): PlanEntitlement {
  return PLAN_ENTITLEMENTS[normalizePlanId(plan)];
}

export function getModuleLimitForPlan(moduleId: string, plan?: string | null): number {
  const entitlement = getPlanEntitlement(plan);
  return entitlement.moduleLimits[moduleId] ?? entitlement.moduleLimits.default;
}

export function inferPlanFromUser(role?: string | null): PlanId {
  if (role === 'admin') return 'enterprise';
  if (role === 'editor') return 'team';
  return 'free';
}
