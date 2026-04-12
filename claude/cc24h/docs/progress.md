# cc24h Progress

## Current Stage
Production-grade quality enforcement system — demo→production gap closing

## Last Updated
2026-03-23

## Latest Updates

- [2026-03-23] Commander default execution policy tightened: continue between rounds without re-asking for permission unless blocked by risk, environment, or an irreversible fork
- [2026-03-23] `.claude/agents/commander.md` and `CLAUDE.md` now both encode the same continuity rule so new sessions inherit it immediately

## Completed

### Phase 1: Foundation
- [2026-03] Project skeleton, CLI, database (SQLite via sql.js)
- [2026-03] TUI dashboard (blessed)
- [2026-03] Task queue, session manager, lock manager
- [2026-03] CLI backend (Claude CLI fallback)
- [2026-03] Git worktree isolation

### Phase 2: Commander Core
- [2026-03] Commander 4-phase pipeline (idea -> product def -> architecture -> design -> tasks)
- [2026-03] Session Bridge (register, claim, submit, next, context, request-review)
- [2026-03] Autonomous loop (claim -> spawn worker -> submit -> repeat)
- [2026-03] `go` command (plan + auto-execute in one shot)
- [2026-03] Auto worktree allocation on claim
- [2026-03] Decision logging, handoff persistence

### Phase 3: Skill Governance
- [2026-03] Skill registry with lifecycle state machine (7 states)
- [2026-03] Risk policy (L1-L4, directory rules, tag rules)
- [2026-03] Audit logging
- [2026-03] Auto-governance (fail rate disable, staleness deprecation)
- [2026-03] CLI: skill list/show/add/promote/disable/audit/report/check

### Phase 3.1: Skill Library Expansion (v0.3)
- [2026-03-19] NEW: yaml-planner — parallel safety analysis, conflict detection
- [2026-03-19] NEW: progress-updater — docs/progress.md + worklogs sync
- [2026-03-19] NEW: release-readiness — 8-point pre-release audit
- [2026-03-19] UPGRADED: task-decomposition — added Phase 3 conflict analysis
- [2026-03-19] UPGRADED: handoff-generation — richer format with resume instructions
- [2026-03-19] Total skills: 10 (9 approved, 1 proposed/L3)

### Phase 4: Commander Org System v1
- [2026-03-19] Consolidated agents: 11 scattered → 5 focused roles + 1 commander
- [2026-03-19] 破局官 (Product), 增长官 (Growth), 铁律官 (Architect), 快刀官 (Builder), 尺子官 (Reviewer)
- [2026-03-19] 4 classic workflows: repo-onboarding, idea-to-plan, build-feature, launch-readiness
- [2026-03-19] 7 new skills: commander-status, dispatch, repo-onboarding, idea-to-plan, build-feature, launch-readiness
- [2026-03-19] Total skills: 17 (SKILL.md files) + 10 registered in governance DB
- [2026-03-19] Updated CLAUDE.md with unified command reference and role table
- [2026-03-19] Created docs/agent-system.md — complete organizational framework reference

### Phase 5: Workflow Pack v1
- [2026-03-19] 8 production workflows: repo-onboarding, idea-to-plan, build-feature, bug-triage-hotfix, refactor-safely, launch-and-growth, night-run, review-and-recover
- [2026-03-19] All 8 workflows have SKILL.md with trigger phrases, role assignments, execution steps, risk gates
- [2026-03-19] Created docs/workflows.md — workflow definitions and quick reference
- [2026-03-19] Created docs/routing-policy.md — keyword detection, routing table, escalation rules, parallel matrix
- [2026-03-19] Upgraded existing 4 workflow skills with trigger phrases and default participants
- [2026-03-19] Total skills: 21 SKILL.md files
- [2026-03-19] Updated CLAUDE.md with complete skill/workflow inventory

### Phase 6: Application Skills Pack v1
- [2026-03-19] 10 application skills: market-research, competitor-teardown, customer-voice-synthesis, web-crawl-collect, page-structured-extract, audio-transcribe, video-transcribe, transcript-cleanup, research-to-brief, content-repurpose
- [2026-03-19] 8 L1 (read-only/advisory), 2 L2 (external fetch or local file processing)
- [2026-03-19] Created docs/application-skills.md — positioning, deps, risk controls
- [2026-03-19] Updated docs/routing-policy.md with 10 new keyword detection patterns
- [2026-03-19] Total skills: 31 SKILL.md files
- [2026-03-19] audio/video transcription designed as adapter pattern (ffmpeg + whisper) with graceful degradation

### Phase 7: Application Skills Templates v2
- [2026-03-19] 12 new grouped skills in 5 categories:
  - research/: serp-landscape-scan, pricing-teardown, positioning-compare
  - crawl-extract/: site-map-crawl, faq-extractor, lead-list-builder
  - audio-video/: meeting-transcribe, meeting-action-extract, video-highlight-extract
  - content-ops/: content-calendar-draft
  - sales-support/: outreach-brief-builder, support-signal-summarizer
- [2026-03-19] All 12 follow unified SKILL.md template: Purpose, When/When-NOT, Inputs, Outputs, Execution, Risk, Deps, Validation, Fallback, Handoff
- [2026-03-19] Updated docs/application-skills.md with v2 map
- [2026-03-19] Updated docs/routing-policy.md with new keyword detection
- [2026-03-19] Total skills: 43 SKILL.md files (31 flat + 12 grouped)

### Phase 8: Rate Limit Resilience
- [2026-03-19] CLI backend: rate limit detection (429, quota, overloaded, capacity patterns)
- [2026-03-19] CLI backend: exponential backoff (30s → 60s → 120s → 240s → 300s cap)
- [2026-03-19] CLI backend: wait-time extraction from error messages
- [2026-03-19] CLI backend: shared rate limit state across all calls
- [2026-03-19] Autonomous loop: global pause on rate limit (stops all new dispatch)
- [2026-03-19] Autonomous loop: session parking (rate-limited tasks parked with full state)
- [2026-03-19] Autonomous loop: auto wake-up (parked sessions resume after cooldown)
- [2026-03-19] Autonomous loop: task re-queue (rate-limited tasks go back to 'todo')
- [2026-03-19] Autonomous loop: graduated cooldown (post-rate-limit dispatch slows down)
- [2026-03-19] End-of-run summary includes rate limit stats

### Phase 9: Critical Agent Patch
- [2026-03-19] NEW AGENT: 用户战场官 (yonghuzhanchang) — real user simulation with 8 persona subagents
- [2026-03-19] NEW AGENT: AI应用工程官 (aiyingyong) — LLM/Chatbot/Agent production engineering with 8 specialist subagents
- [2026-03-19] NEW WORKFLOW: user-reality-test — multi-persona product testing
- [2026-03-19] NEW WORKFLOW: chatbot-hardening — demo→production gap analysis and fix plan
- [2026-03-19] Updated routing-policy with 2 new route patterns + keyword detection
- [2026-03-19] Updated agent-system.md: 5 roles → 7 roles, 4 workflows → 10 workflows
- [2026-03-19] Updated launch-and-growth workflow: 用户战场官 added as pre-launch gate
- [2026-03-19] Total: 8 agents, 33+ skills, 10 workflows

### Phase 11: Demo to Production Intelligence Upgrade
- [2026-03-20] Created docs/cc-capability-audit.md — honest capability vs gap assessment
- [2026-03-20] Created docs/demo-to-production-blueprint.md — 6-gap resolution map with solution layers
- [2026-03-20] Created docs/design-system.md — meta design system template (how cc24h creates design systems)
- [2026-03-20] Created docs/screenshot-loop.md — visual feedback loop specification
- [2026-03-20] Created docs/reference-system.md — reference website pattern extraction methodology
- [2026-03-20] Created docs/production-readiness.md — 10-point production ship gate
- [2026-03-20] 7 NEW SKILLS: design-system-bootstrap, screenshot-loop, reference-extraction, mobile-qa, accessibility-audit, performance-audit, production-readiness-audit
- [2026-03-20] 4 NEW WORKFLOWS: design-system-bootstrap, screenshot-loop, reference-driven-design, production-readiness-audit
- [2026-03-20] Updated workflows.md: 8 → 14 workflows
- [2026-03-20] Updated routing-policy.md: +8 new route patterns, +7 keyword detection groups, +5 mandatory routing rules
- [2026-03-20] Updated CLAUDE.md: mandatory routing rules, 59 total skills
- [2026-03-20] Created tasks/demo-to-production-plan.yaml — 12 tasks in 3 waves
- [2026-03-20] Key enforcement: UI tasks MUST pass screenshot-loop, launches MUST pass production-readiness-audit, UI projects MUST start with design-system-bootstrap

### Phase 11.1: Commander Continuity Fixes
- [2026-03-23] Reconciled hook task state with actual wired hooks in `.claude/settings.json` and `tasks/commander-improvement-plan.yaml`
- [2026-03-23] Fixed `.cc24h/hooks/verify-completion.mjs` for Windows and non-git directories so completion summaries no longer emit false-positive changed files
- [2026-03-23] Added `src/runtime-audit.mjs` and integrated it into `cc24h sync` so stale-session recovery now also audits completed task artifacts against explicit prompt expectations
- [2026-03-23] Recovered the historical `test-review` chain into a consistent state: `reviewer-1` marked stale, `test-review` returned to `todo`, and false-done predecessors (`test-hello`, `test-readme`) automatically reopened with audit-backed error reasons
- [2026-03-23] Added `src/cli-lock.mjs` and wired a project-level CLI mutex into `bin/cc24h.mjs`, so parallel `cc24h` commands now serialize per project instead of clobbering `.cc24h/state.db`
- [2026-03-23] Added `tests/cli-lock.test.mjs` to verify lock acquire/release, contention timeout, and stale-lock reclamation behavior

### Phase 10: gstack Integration
- [2026-03-19] Installed gstack v0.9.0 (Garry Tan's Claude Code skill pack) as independent dev team
- [2026-03-19] 21 new skills: office-hours, plan-ceo-review, plan-eng-review, plan-design-review, design-consultation, design-review, review, investigate, qa, qa-only, ship, document-release, retro, browse, setup-browser-cookies, codex, careful, freeze, guard, unfreeze, gstack-upgrade
- [2026-03-19] Commander categorization: gstack mapped as external team with role-level routing
- [2026-03-19] Updated routing-policy.md with gstack dispatch rules and keyword detection
- [2026-03-19] Updated agent-system.md: 7 roles + 1 external team, skill inventory 17+21=38
- [2026-03-19] gstack positioned as "browser QA + PR workflow + design system" complement to existing roles
- [2026-03-19] Key capability: persistent headless Chromium (~100ms/cmd) for real browser testing
- [2026-03-19] Total: 8 agents + 1 external team, 52+ skills, 10 workflows

### Phase 12: Commercialization Council Reorg
- [2026-03-26] Merged "商业分析与市场研究团队", "成品化团队", "用户与增长验证团队" into unified Commercialization Council (商业化成品增长委员会)
- [2026-03-26] 10 council roles: 战略官, 市场研究官, 定价与变现官, 成品化总工, AI应用工程官, 真实用户模拟官, 增长验证官, 用户洞察官, 案例与信任官, 交叉质疑官(Red Team)
- [2026-03-26] 5-step protocol: Commander task-type identification → role selection → independent judgment → cross-challenge debate → Commander final verdict
- [2026-03-26] 6 task types: new-product-judgment, single-product-commercialization, demo-to-product-diagnosis, pre-launch-review, growth-optimization, portfolio-strategy
- [2026-03-26] Red Team mandatory for GO/NO-GO decisions, money commitments, easy consensus, and user's own creations
- [2026-03-26] NEW WORKFLOW: commercialization-council-review (WF15)
- [2026-03-26] Updated routing-policy.md: council routing table, keyword detection, mandatory Red Team rules, council vs existing WF overlap matrix
- [2026-03-26] Created tasks/council-reorg-plan.yaml
- [2026-03-26] Commander verdict format enforced: unified conclusion, core contradiction, priority problem, confirmed/unverified, next best action
- [2026-03-26] Total: 8 execution agents + 1 external team + 10 council roles, 15 workflows

### Phase 13: Automated AI Marketing Team
- [2026-03-26] 10 NEW AGENTS (marketing team): mkt-campaign-director, mkt-audience-insight, mkt-channel-launch, mkt-content-strategy, mkt-conversion-copy, mkt-creative-asset, mkt-referral-campaign, mkt-growth-ops, mkt-analyst, mkt-red-team
- [2026-03-26] 9 NEW SKILLS (marketing pipelines): campaign-brief-generator, content-angle-generator, multi-channel-content-pack, asset-brief-pack, private-launch-pack, referral-campaign-pack, seo-content-matrix, qa-comment-reply-pack, marketing-retro-pack
- [2026-03-26] NEW DOC: docs/marketing-ops.md — team architecture, 10 roles, 5-step decision protocol, Council relationship, product-stage adaptation, automation boundary matrix
- [2026-03-26] NEW DOC: docs/marketing-workflows.md — 9 marketing workflow definitions with triggers, roles, steps, outputs, dependency map
- [2026-03-26] Updated docs/routing-policy.md — marketing team routing table, keyword detection for 9 workflows, Council-to-Marketing handoff protocol, Marketing-to-Council escalation rules, Red Team mandatory triggers
- [2026-03-26] NEW TASK PLAN: tasks/marketing-ops-system-plan.yaml — 5 waves, 16 tasks from foundation to first execution
- [2026-03-26] Marketing team is product-agnostic: adapts strategy by product stage (P0 conversion, P1 trust-building, P2/P3 signal collection)
- [2026-03-26] Automation boundary enforced: content generation full-auto, platform publish manual-confirm, private domain semi-auto
- [2026-03-26] 5-step internal protocol: Commander/Council input → independent judgment → cross-challenge → Campaign Director synthesis → Commander verdict
- [2026-03-26] Total: 18 execution agents + 1 external team + 10 council roles, 15 workflows + 9 marketing workflows (24 total)

## In Progress
- test-generation skill needs sandbox validation before promotion (L3)
- v2 skills need registration in skill governance DB
- ffmpeg + whisper not yet verified on current machine
- meeting-transcribe in sandbox status (requires external deps)
- gstack browse binary needs `bun run build` (requires bun runtime)
- gstack browser cookies setup not yet tested on Windows
- [2026-03-23] Portfolio session audit completed across `studypal`, `market-predictor`, `ai-crew`, `miralife`, `cc24h`; current guidance is low-disturbance execution only, with `cc24h` continuity cleanup prioritized over new broad rollout
- [2026-03-23] Raw `cc24h` CLI commands now serialize per project via `.cc24h/cli-lock`; remaining persistence risk is limited to out-of-band writers that bypass the CLI mutex entirely

## Decisions
- [2026-03-19] L1/L2 skills auto-promote to approved; L3/L4 require sandbox + trial
- [2026-03-19] yaml-planner is separate from task-decomposition: decomposition breaks goals into tasks, planner optimizes the execution plan
- [2026-03-19] release-readiness is read-only (L1) — reports but never modifies
- [2026-03-19] Consolidated from 11 agents to 5+1: fewer roles = clearer boundaries = less coordination overhead
- [2026-03-19] Skills > Agents > Teams — prefer single-skill invocation over multi-agent coordination
- [2026-03-19] Agent names use original Chinese terms (破局官/增长官/铁律官/快刀官/尺子官) for distinctiveness

## Decisions
- [2026-03-20] Production quality enforcement is mandatory, not optional — screenshot-loop, production-readiness-audit are gates, not suggestions
- [2026-03-20] Design system must be created BEFORE coding, not retrofitted — design-system-bootstrap is first step for any UI project
- [2026-03-20] Reference extraction is pattern learning, not copying — we extract proportions/rhythm/hierarchy, not specific visual elements
- [2026-03-20] 7 new production-grade skills are all L1-L2 (read-only or docs-only) — low risk, high enforcement value
- [2026-03-20] gstack browse is the browser engine for screenshot-loop, mobile-qa, accessibility-audit — no need for separate browser integration
- [2026-03-19] L1/L2 skills auto-promote to approved; L3/L4 require sandbox + trial
- [2026-03-19] yaml-planner is separate from task-decomposition: decomposition breaks goals into tasks, planner optimizes the execution plan
- [2026-03-19] release-readiness is read-only (L1) — reports but never modifies
- [2026-03-19] Consolidated from 11 agents to 5+1: fewer roles = clearer boundaries = less coordination overhead
- [2026-03-19] Skills > Agents > Teams — prefer single-skill invocation over multi-agent coordination
- [2026-03-19] Agent names use original Chinese terms (破局官/增长官/铁律官/快刀官/尺子官) for distinctiveness

## Next Best Action
Validate the upgrade: pick a real project and run the full pipeline:
1. `/design-system-bootstrap` — create design system
2. `/idea-to-plan "your idea"` — plan with reference extraction
3. `/build-feature` — build with screenshot-loop gates
4. `/production-readiness-audit` — 10-point ship gate
