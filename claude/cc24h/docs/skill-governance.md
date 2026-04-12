# Skill Governance

## Overview

cc24h treats Claude Code skills as **managed assets** with lifecycle, risk levels, audit, and policy controls. New skills don't go straight to production — they graduate through a controlled pipeline.

## Risk Levels

| Level | Name | Auto-approve | Needs Test | Needs Rollback |
|-------|------|-------------|-----------|----------------|
| L1 | Read-only | Yes | No | No |
| L2 | Advisory | Yes | No | No |
| L3 | Restricted write | No | Yes | Yes |
| L4 | High-risk exec | No | Yes | Yes |

## Lifecycle

```
proposed → candidate → sandboxed → trial → approved
                                              ↓
                                         deprecated → disabled
```

- **proposed**: just registered, not usable
- **candidate**: reviewed, ready for sandbox testing
- **sandboxed**: being tested on low-risk tasks
- **trial**: running in production with monitoring
- **approved**: fully available
- **deprecated**: scheduled for removal
- **disabled**: immediately stopped

## High-Risk Zones (auto-blocked for L3/L4)

- auth, payment, migration, secrets, deploy, database-schema, ci-cd

## Commands

```bash
cc24h skill list                    # All skills
cc24h skill list --status approved  # Filter by status
cc24h skill list --risk L3          # Filter by risk
cc24h skill show <id>               # Full detail
cc24h skill add <id>                # Add new (starts as proposed)
cc24h skill promote <id>            # Move to next lifecycle stage
cc24h skill disable <id>            # Emergency stop
cc24h skill audit                   # Full audit log
cc24h skill audit <id>              # Audit for specific skill
cc24h skill report                  # Weekly governance report
cc24h skill check <id>              # Policy check + promotion readiness
```

## Skills Registry (10)

| ID | Risk | Category | Purpose | Status |
|----|------|----------|---------|--------|
| codebase-understand | L1 | analysis | Read & analyze project structure | approved |
| task-decomposition | L2 | planning | Break goals into atomic tasks with conflict detection | approved |
| yaml-planner | L2 | planning | Generate execution-plan.yaml with parallel safety analysis | approved |
| handoff-generation | L1 | coordination | Generate structured handoff for session relay | approved |
| progress-updater | L2 | coordination | Update progress.md, worklogs, task status | approved |
| review-checklist | L1 | review | Systematic code review | approved |
| page-copy-review | L2 | review | UX, conversion, accessibility audit | approved |
| test-generation | L3 | testing | Generate & run tests | proposed (needs sandbox) |
| risk-scan | L1 | security | Security, secrets, deps audit | approved |
| release-readiness | L1 | security | Pre-release audit (8 checks) | approved |

### New in v0.3

- **yaml-planner**: Goes beyond task-decomposition. Produces production-grade YAML with `parallel_safe`, `parallel_reason`, `risk_level`, `risk_reason`, worktree strategy, and review checklists. Use after rough decomposition to refine.
- **progress-updater**: Keeps `docs/progress.md` and `.cc24h/worklogs/` in sync with actual work. Append-only — never deletes history.
- **release-readiness**: 8-point pre-release checklist (build, test, lint, security, deps, git, docs, config). Read-only — reports but never modifies code.

### Upgraded in v0.3

- **task-decomposition**: Now includes Phase 3 (Dependency & Conflict Analysis) — checks file overlap between tasks, outputs `parallel_safe` and `parallel_reason`.
- **handoff-generation**: Expanded output format with decision context, parallel safety assessment, and resume instructions.

## Adding a New Skill

```bash
# 1. Add as proposed
cc24h skill add my-new-skill --category analysis --risk L2

# 2. Edit the YAML
# .cc24h/skills/analysis/my-new-skill.yaml

# 3. Promote through stages
cc24h skill promote my-new-skill   # → candidate
cc24h skill promote my-new-skill   # → sandboxed
# (use it on low-risk tasks, verify it works)
cc24h skill promote my-new-skill   # → trial
# (monitor in production)
cc24h skill promote my-new-skill   # → approved
```

## Auto-governance

- Skills with >50% fail rate are flagged for disable
- Skills unused for 30+ days are flagged for deprecation
- L3/L4 skills require test_command + rollback_strategy before trial/approved
- `skill report` shows weekly recommendations

## Risk Policy

See `docs/risk-policy.md` and `.cc24h/risk-policy.yaml` for directory-level and tag-level rules.
