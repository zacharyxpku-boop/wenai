/**
 * cc24h — Skill Governance
 *
 * Lifecycle: proposed → candidate → sandboxed → trial → approved → deprecated → disabled
 * Risk levels: L1 (read-only) → L2 (advisory) → L3 (restricted write) → L4 (high-risk exec)
 */

import { randomUUID } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import yaml from 'js-yaml';

// ── Constants ──────────────────────────────────────────────

export const RISK_LEVELS = {
  L1: { name: 'read-only', auto_approve: true, needs_test: false, needs_rollback: false },
  L2: { name: 'advisory', auto_approve: true, needs_test: false, needs_rollback: false },
  L3: { name: 'restricted-write', auto_approve: false, needs_test: true, needs_rollback: true },
  L4: { name: 'high-risk-exec', auto_approve: false, needs_test: true, needs_rollback: true },
};

export const SKILL_STATUSES = ['proposed', 'candidate', 'sandboxed', 'trial', 'approved', 'deprecated', 'disabled'];

const HIGH_RISK_ZONES = ['auth', 'payment', 'migration', 'secrets', 'deploy', 'database-schema', 'ci-cd'];

const VALID_TRANSITIONS = {
  proposed:    ['candidate', 'disabled'],
  candidate:   ['sandboxed', 'disabled'],
  sandboxed:   ['trial', 'candidate', 'disabled'],
  trial:       ['approved', 'sandboxed', 'disabled'],
  approved:    ['deprecated', 'disabled'],
  deprecated:  ['disabled', 'approved'],  // can re-approve
  disabled:    ['candidate'],             // can re-evaluate
};

// ── Schema ─────────────────────────────────────────────────

function ensureSchema(db) {
  db.db.run(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      purpose TEXT NOT NULL,
      category TEXT NOT NULL,
      risk_level TEXT NOT NULL DEFAULT 'L1',
      scope TEXT DEFAULT '[]',
      owner TEXT DEFAULT 'system',
      version TEXT DEFAULT '1.0.0',
      status TEXT NOT NULL DEFAULT 'proposed',
      allowed_tools TEXT DEFAULT '[]',
      forbidden_zones TEXT DEFAULT '[]',
      validation_checks TEXT DEFAULT '[]',
      rollback_strategy TEXT DEFAULT '',
      test_command TEXT DEFAULT '',
      applicable_when TEXT DEFAULT '',
      not_applicable_when TEXT DEFAULT '',
      adoption_score REAL DEFAULT 0.0,
      use_count INTEGER DEFAULT 0,
      success_count INTEGER DEFAULT 0,
      fail_count INTEGER DEFAULT 0,
      last_used_at TEXT,
      promoted_at TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS skill_audit (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      skill_version TEXT,
      session_id TEXT,
      task_id TEXT,
      action TEXT NOT NULL,
      result TEXT,
      files_changed TEXT DEFAULT '[]',
      risk_assessment TEXT DEFAULT '',
      failure_reason TEXT DEFAULT '',
      tokens_used INTEGER DEFAULT 0,
      duration_ms INTEGER DEFAULT 0,
      created_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);
    CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
    CREATE INDEX IF NOT EXISTS idx_skill_audit_skill ON skill_audit(skill_id);
    CREATE INDEX IF NOT EXISTS idx_skill_audit_session ON skill_audit(session_id);
  `);
}

// ── Skill Registry ─────────────────────────────────────────

export class SkillRegistry {
  constructor(db, stateDir) {
    this.db = db;
    this.skillsDir = join(stateDir, 'skills');
    mkdirSync(this.skillsDir, { recursive: true });
    ensureSchema(db);
  }

  /** Register a new skill — always starts as 'proposed' (or 'candidate' for L1/L2) */
  add(spec) {
    const now = new Date().toISOString();
    const risk = RISK_LEVELS[spec.risk_level || 'L1'];
    const initialStatus = risk.auto_approve && spec.skip_candidate ? 'approved' : 'proposed';

    const skill = {
      id: spec.id || spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: spec.name,
      purpose: spec.purpose || '',
      category: spec.category || 'general',
      risk_level: spec.risk_level || 'L1',
      scope: spec.scope || [],
      owner: spec.owner || 'system',
      version: spec.version || '1.0.0',
      status: initialStatus,
      allowed_tools: spec.allowed_tools || [],
      forbidden_zones: spec.forbidden_zones || HIGH_RISK_ZONES,
      validation_checks: spec.validation_checks || [],
      rollback_strategy: spec.rollback_strategy || '',
      test_command: spec.test_command || '',
      applicable_when: spec.applicable_when || '',
      not_applicable_when: spec.not_applicable_when || '',
      adoption_score: 0,
      use_count: 0,
      success_count: 0,
      fail_count: 0,
      created_at: now,
      updated_at: now,
    };

    this.db.insert('skills', skill);

    // Also write YAML file for human readability
    this._writeSkillFile(skill);

    return skill;
  }

  get(id) { return this.db.get('skills', id); }

  getAll(where = {}) { return this.db.query('skills', where, 'category, risk_level ASC'); }

  getByStatus(status) { return this.db.query('skills', { status }); }

  getByCategory(category) { return this.db.query('skills', { category }); }

  getApproved() { return this.db.query('skills', { status: 'approved' }); }

  /** Transition skill to new status with validation */
  transition(id, newStatus, reason = '') {
    const skill = this.get(id);
    if (!skill) throw new Error(`Skill not found: ${id}`);

    const valid = VALID_TRANSITIONS[skill.status];
    if (!valid || !valid.includes(newStatus)) {
      throw new Error(`Invalid transition: ${skill.status} → ${newStatus}. Valid: ${valid?.join(', ')}`);
    }

    // L3/L4 require test + rollback for promotion to trial/approved
    if (['trial', 'approved'].includes(newStatus) && ['L3', 'L4'].includes(skill.risk_level)) {
      if (!skill.test_command && !skill.validation_checks?.length) {
        throw new Error(`L3/L4 skill ${id} needs validation_checks or test_command before ${newStatus}`);
      }
      if (!skill.rollback_strategy) {
        throw new Error(`L3/L4 skill ${id} needs rollback_strategy before ${newStatus}`);
      }
    }

    const now = new Date().toISOString();
    const changes = { status: newStatus, updated_at: now };
    if (newStatus === 'approved') changes.promoted_at = now;

    this.db.update('skills', id, changes);
    this._writeSkillFile({ ...skill, ...changes });

    // Audit
    this.audit({
      skill_id: id,
      skill_version: skill.version,
      action: `transition:${skill.status}→${newStatus}`,
      result: 'ok',
      risk_assessment: reason,
    });

    return { ...skill, ...changes };
  }

  /** Quick promote through safe transitions */
  promote(id, reason = 'manual promotion') {
    const skill = this.get(id);
    if (!skill) throw new Error(`Skill not found: ${id}`);

    const chain = { proposed: 'candidate', candidate: 'sandboxed', sandboxed: 'trial', trial: 'approved' };
    const next = chain[skill.status];
    if (!next) throw new Error(`Cannot promote from ${skill.status}`);

    return this.transition(id, next, reason);
  }

  /** Disable a skill immediately */
  disable(id, reason = '') {
    return this.transition(id, 'disabled', reason);
  }

  /** Record a skill usage in the audit log */
  audit(entry) {
    this.db.insert('skill_audit', {
      id: randomUUID().slice(0, 8),
      skill_id: entry.skill_id,
      skill_version: entry.skill_version || '',
      session_id: entry.session_id || '',
      task_id: entry.task_id || '',
      action: entry.action,
      result: entry.result || 'unknown',
      files_changed: entry.files_changed || [],
      risk_assessment: entry.risk_assessment || '',
      failure_reason: entry.failure_reason || '',
      tokens_used: entry.tokens_used || 0,
      duration_ms: entry.duration_ms || 0,
      created_at: new Date().toISOString(),
    });
  }

  /** Update use counts after a skill execution */
  recordUsage(id, success, tokens = 0) {
    const skill = this.get(id);
    if (!skill) return;
    const changes = {
      use_count: (skill.use_count || 0) + 1,
      last_used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (success) {
      changes.success_count = (skill.success_count || 0) + 1;
    } else {
      changes.fail_count = (skill.fail_count || 0) + 1;
    }
    // Adoption score = success_rate * log(use_count+1)
    const total = changes.success_count || skill.success_count || 0;
    const fails = changes.fail_count || skill.fail_count || 0;
    const uses = total + fails;
    changes.adoption_score = uses > 0
      ? Math.round((total / uses) * Math.log2(uses + 1) * 100) / 100
      : 0;

    this.db.update('skills', id, changes);
  }

  /** Get audit log for a skill */
  getAuditLog(skillId = null, limit = 50) {
    if (skillId) {
      return this.db.query('skill_audit', { skill_id: skillId }, 'created_at DESC', limit);
    }
    return this.db.query('skill_audit', {}, 'created_at DESC', limit);
  }

  /** Write human-readable YAML file */
  _writeSkillFile(skill) {
    const dir = join(this.skillsDir, skill.category);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, `${skill.id}.yaml`);
    writeFileSync(file, yaml.dump(skill, { lineWidth: 120 }));
  }

  /** Stats summary */
  stats() {
    const all = this.getAll();
    const byStatus = {};
    const byRisk = {};
    const byCategory = {};
    for (const s of all) {
      byStatus[s.status] = (byStatus[s.status] || 0) + 1;
      byRisk[s.risk_level] = (byRisk[s.risk_level] || 0) + 1;
      byCategory[s.category] = (byCategory[s.category] || 0) + 1;
    }
    return { total: all.length, byStatus, byRisk, byCategory };
  }
}

// ── Risk Policy ────────────────────────────────────────────

export class RiskPolicy {
  constructor(stateDir) {
    this.policyFile = join(stateDir, 'risk-policy.yaml');
    this.policy = this._load();
  }

  _load() {
    if (existsSync(this.policyFile)) {
      return yaml.load(readFileSync(this.policyFile, 'utf-8'));
    }
    // Default policy
    const defaults = {
      version: '1.0.0',
      high_risk_zones: HIGH_RISK_ZONES,
      auto_approve_levels: ['L1', 'L2'],
      require_review_levels: ['L3', 'L4'],
      max_concurrent_trials: 2,
      max_fail_rate_before_disable: 0.5,
      min_uses_before_promotion: 3,
      directory_rules: [
        { pattern: 'src/auth/**', max_risk: 'L2', reason: 'auth is sensitive' },
        { pattern: 'src/payment/**', max_risk: 'L1', reason: 'payment: read-only only' },
        { pattern: 'migrations/**', max_risk: 'L1', reason: 'migrations: read-only only' },
        { pattern: '.env*', max_risk: 'L1', reason: 'secrets: read-only only' },
        { pattern: 'tests/**', max_risk: 'L4', reason: 'tests: allow all skill levels' },
        { pattern: 'docs/**', max_risk: 'L3', reason: 'docs: allow writes' },
      ],
      task_rules: [
        { tag: 'refactor', max_risk: 'L3', reason: 'limit refactor scope' },
        { tag: 'hotfix', max_risk: 'L2', reason: 'hotfixes need human review' },
      ],
    };
    mkdirSync(join(this.policyFile, '..'), { recursive: true });
    writeFileSync(this.policyFile, yaml.dump(defaults, { lineWidth: 120 }));
    return defaults;
  }

  /** Check if a skill is allowed for a given task context */
  check(skill, context = {}) {
    const { files = [], tags = [], directory = '' } = context;
    const issues = [];

    // Check risk zone
    for (const zone of this.policy.high_risk_zones || []) {
      if (files.some(f => f.includes(zone)) && ['L3', 'L4'].includes(skill.risk_level)) {
        issues.push(`Skill ${skill.id} (${skill.risk_level}) touches high-risk zone: ${zone}`);
      }
    }

    // Check directory rules
    for (const rule of this.policy.directory_rules || []) {
      const riskOrder = ['L1', 'L2', 'L3', 'L4'];
      const maxIdx = riskOrder.indexOf(rule.max_risk);
      const skillIdx = riskOrder.indexOf(skill.risk_level);
      if (skillIdx > maxIdx) {
        const pat = rule.pattern.replace('/**', '');
        if (files.some(f => f.includes(pat))) {
          issues.push(`${skill.id} (${skill.risk_level}) exceeds limit ${rule.max_risk} for ${rule.pattern}: ${rule.reason}`);
        }
      }
    }

    // Check task tag rules
    for (const rule of this.policy.task_rules || []) {
      if (tags.includes(rule.tag)) {
        const riskOrder = ['L1', 'L2', 'L3', 'L4'];
        if (riskOrder.indexOf(skill.risk_level) > riskOrder.indexOf(rule.max_risk)) {
          issues.push(`${skill.id} (${skill.risk_level}) exceeds limit for tag "${rule.tag}": ${rule.reason}`);
        }
      }
    }

    // Status check
    if (!['approved', 'trial'].includes(skill.status)) {
      issues.push(`Skill ${skill.id} status is "${skill.status}" — not approved for execution`);
    }

    return { allowed: issues.length === 0, issues };
  }

  /** Check if a skill should be auto-disabled based on fail rate */
  shouldDisable(skill) {
    const total = (skill.success_count || 0) + (skill.fail_count || 0);
    if (total < (this.policy.min_uses_before_promotion || 3)) return false;
    const failRate = (skill.fail_count || 0) / total;
    return failRate > (this.policy.max_fail_rate_before_disable || 0.5);
  }

  /** Check if a skill qualifies for promotion */
  canPromote(skill) {
    const total = (skill.success_count || 0) + (skill.fail_count || 0);
    const minUses = this.policy.min_uses_before_promotion || 3;
    if (total < minUses) return { ready: false, reason: `needs ${minUses - total} more uses` };
    const failRate = (skill.fail_count || 0) / total;
    if (failRate > 0.2) return { ready: false, reason: `fail rate ${(failRate * 100).toFixed(0)}% > 20%` };
    return { ready: true, reason: `${total} uses, ${(failRate * 100).toFixed(0)}% fail rate` };
  }

  get() { return this.policy; }
}

// ── Skill Evaluator ────────────────────────────────────────

export class SkillEvaluator {
  constructor(registry, riskPolicy) {
    this.registry = registry;
    this.policy = riskPolicy;
  }

  /** Evaluate all skills and return recommendations */
  evaluate() {
    const all = this.registry.getAll();
    const recommendations = {
      promote: [],
      disable: [],
      deprecate: [],
      needsAttention: [],
    };

    for (const skill of all) {
      // Auto-disable check
      if (this.policy.shouldDisable(skill) && skill.status !== 'disabled') {
        recommendations.disable.push({
          id: skill.id,
          reason: `High fail rate: ${skill.fail_count}/${skill.use_count} failures`,
          action: 'disable',
        });
        continue;
      }

      // Promotion check
      if (['candidate', 'sandboxed', 'trial'].includes(skill.status)) {
        const { ready, reason } = this.policy.canPromote(skill);
        if (ready) {
          recommendations.promote.push({ id: skill.id, from: skill.status, reason });
        } else {
          recommendations.needsAttention.push({ id: skill.id, status: skill.status, reason });
        }
      }

      // Staleness check (approved but unused for 30+ days)
      if (skill.status === 'approved' && skill.last_used_at) {
        const daysSinceUse = (Date.now() - new Date(skill.last_used_at).getTime()) / 86400000;
        if (daysSinceUse > 30) {
          recommendations.deprecate.push({
            id: skill.id,
            reason: `Not used in ${Math.round(daysSinceUse)} days`,
          });
        }
      }
    }

    return recommendations;
  }

  /** Generate a "weekly skill report" */
  weeklyReport() {
    const stats = this.registry.stats();
    const recs = this.evaluate();
    const recentAudit = this.registry.getAuditLog(null, 20);

    const lines = [
      '═══ Skill Governance Weekly Report ═══',
      '',
      `Total skills: ${stats.total}`,
      `By status: ${Object.entries(stats.byStatus).map(([k, v]) => `${k}=${v}`).join(' ')}`,
      `By risk:   ${Object.entries(stats.byRisk).map(([k, v]) => `${k}=${v}`).join(' ')}`,
      '',
    ];

    if (recs.promote.length) {
      lines.push('READY TO PROMOTE:');
      for (const r of recs.promote) lines.push(`  ${r.id}: ${r.from} → next (${r.reason})`);
      lines.push('');
    }
    if (recs.disable.length) {
      lines.push('SHOULD DISABLE:');
      for (const r of recs.disable) lines.push(`  ${r.id}: ${r.reason}`);
      lines.push('');
    }
    if (recs.deprecate.length) {
      lines.push('CONSIDER DEPRECATING:');
      for (const r of recs.deprecate) lines.push(`  ${r.id}: ${r.reason}`);
      lines.push('');
    }
    if (recs.needsAttention.length) {
      lines.push('NEEDS ATTENTION:');
      for (const r of recs.needsAttention) lines.push(`  ${r.id} (${r.status}): ${r.reason}`);
      lines.push('');
    }

    if (recentAudit.length) {
      lines.push(`RECENT ACTIVITY (last ${recentAudit.length}):`, '');
      for (const a of recentAudit.slice(0, 10)) {
        lines.push(`  ${a.created_at?.slice(0, 16)} ${a.action} ${a.skill_id} → ${a.result}`);
      }
    }

    return lines.join('\n');
  }
}

// ── Skill Sandbox ──────────────────────────────────────────

export class SkillSandbox {
  constructor(registry, riskPolicy) {
    this.registry = registry;
    this.policy = riskPolicy;
  }

  /** Run a skill in sandbox: only on low-risk tasks, with audit */
  async testRun(skillId, context = {}) {
    const skill = this.registry.get(skillId);
    if (!skill) throw new Error(`Skill not found: ${skillId}`);
    if (!['candidate', 'sandboxed'].includes(skill.status)) {
      throw new Error(`Skill ${skillId} is "${skill.status}" — must be candidate/sandboxed for testing`);
    }

    // Check policy
    const check = this.policy.check({ ...skill, status: 'trial' }, context);
    if (!check.allowed) {
      return { success: false, issues: check.issues, action: 'blocked by policy' };
    }

    // Move to sandboxed if still candidate
    if (skill.status === 'candidate') {
      this.registry.transition(skillId, 'sandboxed', 'entering sandbox test');
    }

    // Record test attempt
    this.registry.audit({
      skill_id: skillId,
      skill_version: skill.version,
      action: 'sandbox-test',
      result: 'started',
      session_id: context.session_id,
      task_id: context.task_id,
    });

    return { success: true, skill, message: `Skill ${skillId} ready for sandbox test` };
  }

  /** Record sandbox test result */
  recordResult(skillId, success, details = {}) {
    this.registry.recordUsage(skillId, success, details.tokens);
    this.registry.audit({
      skill_id: skillId,
      action: `sandbox-${success ? 'pass' : 'fail'}`,
      result: success ? 'pass' : 'fail',
      failure_reason: details.error || '',
      files_changed: details.files || [],
      tokens_used: details.tokens || 0,
      duration_ms: details.duration || 0,
    });

    return this.registry.get(skillId);
  }
}

// ── Seed: Priority Skills ──────────────────────────────────

export function seedPrioritySkills(registry) {
  const existing = registry.getAll();
  if (existing.length > 0) return []; // Already seeded

  const skills = [
    {
      id: 'codebase-understand',
      name: 'Codebase Understanding',
      purpose: 'Read and analyze project structure, dependencies, patterns, and conventions',
      category: 'analysis',
      risk_level: 'L1',
      allowed_tools: ['Read', 'Glob', 'Grep', 'Bash(git log)'],
      applicable_when: 'Starting a new task, onboarding to a project, reviewing architecture',
      not_applicable_when: 'Never restricted — always safe',
      validation_checks: ['outputs structured summary', 'identifies key files'],
      skip_candidate: true,
    },
    {
      id: 'task-decomposition',
      name: 'Task Decomposition & YAML Generation',
      purpose: 'Break high-level goals into atomic executable tasks with deps and priorities',
      category: 'planning',
      risk_level: 'L2',
      allowed_tools: ['Read', 'Glob', 'Grep', 'Write(tasks/*.yaml)'],
      applicable_when: 'Receiving a new goal or feature request from commander',
      not_applicable_when: 'Task already has a fine-grained plan',
      validation_checks: ['YAML is valid', 'each task has id/title/prompt/files_touched', 'deps form DAG'],
      skip_candidate: true,
    },
    {
      id: 'handoff-generation',
      name: 'Handoff Note Generation',
      purpose: 'Generate structured handoff notes for session relay',
      category: 'coordination',
      risk_level: 'L1',
      allowed_tools: ['Read', 'Write(.cc24h/handoffs/)'],
      applicable_when: 'Session ending, task blocked, switching agents',
      not_applicable_when: 'Single-shot tasks that complete in one session',
      validation_checks: ['covers: goal, completed, remaining, files, risks, next_steps'],
      skip_candidate: true,
    },
    {
      id: 'review-checklist',
      name: 'Code Review Checklist',
      purpose: 'Systematic review: correctness, security, style, tests, edge cases',
      category: 'review',
      risk_level: 'L1',
      allowed_tools: ['Read', 'Glob', 'Grep', 'Bash(git diff)'],
      applicable_when: 'Task enters review status, PR ready, pre-merge check',
      not_applicable_when: 'Draft/WIP code not yet ready for review',
      validation_checks: ['checklist has ≥5 items', 'covers security and edge cases'],
      skip_candidate: true,
    },
    {
      id: 'page-copy-review',
      name: 'Page & Copy Audit',
      purpose: 'Review pages for UX clarity, conversion, accessibility, and copy quality',
      category: 'review',
      risk_level: 'L2',
      allowed_tools: ['Read', 'Glob', 'Grep', 'Bash(curl)'],
      applicable_when: 'Landing page, marketing page, or user-facing copy changes',
      not_applicable_when: 'Internal tools, admin panels, API-only changes',
      validation_checks: ['checks CTA clarity', 'checks mobile readability', 'checks SEO basics'],
      skip_candidate: true,
    },
    {
      id: 'test-generation',
      name: 'Test Generation & Verification',
      purpose: 'Generate unit/integration tests for changed files and verify they pass',
      category: 'testing',
      risk_level: 'L3',
      allowed_tools: ['Read', 'Write(tests/)', 'Bash(npm test)', 'Bash(node --test)'],
      forbidden_zones: ['auth', 'payment', 'migration', 'secrets'],
      applicable_when: 'New code written, bug fix, refactor',
      not_applicable_when: 'Documentation-only changes',
      validation_checks: ['tests run without error', 'coverage of changed functions ≥1'],
      rollback_strategy: 'git checkout -- tests/',
      test_command: 'npm test --if-present || node --test tests/ 2>/dev/null || echo "no test runner"',
    },
    {
      id: 'risk-scan',
      name: 'Risk Scan & Pre-release Check',
      purpose: 'Scan for security issues, leaked secrets, broken deps, and deployment risks',
      category: 'security',
      risk_level: 'L1',
      allowed_tools: ['Read', 'Glob', 'Grep', 'Bash(npm audit)', 'Bash(git diff)'],
      applicable_when: 'Pre-merge, pre-deploy, nightly scan',
      not_applicable_when: 'Local dev iteration',
      validation_checks: ['no .env values in code', 'no TODO/FIXME in critical paths', 'deps audit clean'],
      skip_candidate: true,
    },
    // ── New: v0.3 skills ──
    {
      id: 'yaml-planner',
      name: 'YAML Planner',
      purpose: 'Generate and optimize execution-plan.yaml with dependency graphs, parallel safety, conflict detection, and risk assessment',
      category: 'planning',
      risk_level: 'L2',
      allowed_tools: ['Read', 'Glob', 'Grep', 'Write(tasks/*.yaml)', 'Bash(git log)'],
      applicable_when: 'After task-decomposition, when refining a plan, or when optimizing parallel strategy',
      not_applicable_when: 'Plan already finalized and approved',
      validation_checks: ['YAML valid', 'DAG has no cycles', 'every parallel_safe:false has reason', 'files_touched verified via Glob'],
      skip_candidate: true,
    },
    {
      id: 'progress-updater',
      name: 'Progress Updater',
      purpose: 'Update docs/progress.md, worklogs, and task status after work completion',
      category: 'coordination',
      risk_level: 'L2',
      allowed_tools: ['Read', 'Write(docs/progress.md)', 'Write(.cc24h/worklogs/)', 'Glob', 'Grep', 'Bash(git log)', 'Bash(git diff)'],
      applicable_when: 'After completing a task, at session end, after submit-result',
      not_applicable_when: 'No work has been done since last update',
      validation_checks: ['progress.md updated with timestamp', 'worklog entry created', 'no existing entries deleted'],
      skip_candidate: true,
    },
    {
      id: 'release-readiness',
      name: 'Release Readiness Check',
      purpose: 'Pre-release audit: build, tests, lint, security, deps, git hygiene, docs, config',
      category: 'security',
      risk_level: 'L1',
      allowed_tools: ['Read', 'Glob', 'Grep', 'Bash(npm run build)', 'Bash(npm test)', 'Bash(npm run lint)', 'Bash(npm audit)', 'Bash(git)'],
      applicable_when: 'Pre-merge, pre-deploy, milestone check, sprint end',
      not_applicable_when: 'Early development, prototype phase',
      validation_checks: ['all 8 checks executed', 'summary table output', 'blocking issues listed'],
      skip_candidate: true,
    },
  ];

  const results = [];
  for (const spec of skills) {
    results.push(registry.add(spec));
  }
  return results;
}
