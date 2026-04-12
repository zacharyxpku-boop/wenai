# Workflow Pack v2

15 production workflows for Commander auto-routing (8 original + 6 production-grade + 1 council).

## Quick Reference

| # | Workflow | When | Lead Role | Auto/Manual |
|---|---------|------|-----------|-------------|
| 1 | repo-onboarding | New project | 铁律官 | Auto |
| 2 | idea-to-plan | Rough idea → plan | 破局官 | Auto |
| 3 | build-feature | Implement tasks | 快刀官 | Auto + review |
| 4 | bug-triage-hotfix | Something broken | 铁律官→快刀官 | Auto (P2+), confirm (P0) |
| 5 | refactor-safely | Restructure code | 铁律官→快刀官 | Auto + verify gates |
| 6 | launch-and-growth | Ship + grow | 增长官 | Confirm before ship |
| 7 | night-run | Overnight auto | Commander | Auto, low-risk only |
| 8 | review-and-recover | Collect + decide | 尺子官 | Auto + merge confirm |
| 9 | user-reality-test | Test from user perspective | 用户战场官 | Auto |
| 10 | chatbot-hardening | AI product readiness | AI应用工程官 | Auto + review |
| 11 | design-system-bootstrap | Before UI coding | 增长官→铁律官 | Auto |
| 12 | screenshot-loop | After UI changes | 快刀官 + browse | Auto (mandatory for UI) |
| 13 | reference-driven-design | During idea-to-plan | 增长官 | Auto |
| 14 | production-readiness-audit | Before launch | 尺子官 (all) | Confirm before ship |
| 15 | commercialization-council-review | Commercial judgment | Council (Commander selects) | Commander verdict |

## Workflow Definitions

### 1. repo-onboarding
- **Use case**: First time touching a project, or after long absence
- **Input**: Project directory
- **Output**: docs/architecture.md, docs/progress.md, stage judgment
- **Steps**: Detect stack → Map structure → Find risk areas → Judge stage → Write docs
- **Parallel**: No (sequential analysis)
- **Review gate**: No (read-only)
- **Risk gate**: No
- **Persistence**: architecture.md, progress.md

### 2. idea-to-plan
- **Use case**: User has a vague idea, needs structured plan
- **Input**: One sentence to one paragraph describing the idea
- **Output**: design-spec.md, architecture.md, execution-plan.yaml
- **Steps**: Define product → Design pages → Plan architecture → Generate YAML tasks
- **Parallel**: Phases 2+3 can overlap if independent
- **Review gate**: Commander reviews plan before enqueue
- **Risk gate**: No (planning only)
- **Persistence**: design-spec.md, architecture.md, go-to-market.md, execution-plan.yaml

### 3. build-feature
- **Use case**: Tasks are ready, need implementation
- **Input**: Pending tasks in queue
- **Output**: Code changes, commits, test results
- **Steps**: Claim → Execute in worktree → Verify → Submit → Review → Next
- **Parallel**: Yes, if files_touched don't overlap
- **Review gate**: Yes, after every task
- **Risk gate**: High-risk files require user confirm
- **Persistence**: progress.md, handoffs, worklogs

### 4. bug-triage-hotfix
- **Use case**: Something is broken, needs diagnosis and fix
- **Input**: Bug description or error message
- **Output**: Triage report, minimal fix, verification
- **Steps**: Triage (severity + root cause) → Minimal fix → Verify → Review
- **Parallel**: No (focused single-bug flow)
- **Review gate**: Yes for P0/P1
- **Risk gate**: Auth/payment bugs → user confirm before fix
- **Persistence**: progress.md, handoff if P0/P1

### 5. refactor-safely
- **Use case**: Code needs restructuring without breaking
- **Input**: Target module/files and reason
- **Output**: Incremental commits, each verified
- **Steps**: Impact analysis → Batch plan → Execute batch → Verify → Next batch → Final check
- **Parallel**: No (sequential batches with verification)
- **Review gate**: Yes, final check
- **Risk gate**: No tests = add tests first; auth/payment = stop
- **Persistence**: architecture.md (if boundaries changed), progress.md

### 6. launch-and-growth
- **Use case**: Features done, preparing to ship
- **Input**: Current project state
- **Output**: Launch readiness report, GTM plan, go/no-go
- **Steps**: Technical checks → Page/copy audit → Risk assessment → Go/no-go
- **Parallel**: All 3 checks can run simultaneously
- **Review gate**: Commander makes final ship decision
- **Risk gate**: User must confirm "ship"
- **Persistence**: go-to-market.md, progress.md

### 7. night-run
- **Use case**: Overnight unattended execution
- **Input**: Pending low-risk tasks
- **Output**: Completed tasks, night summary
- **Steps**: Filter low-risk → Claim → Execute → Verify → Submit → Repeat → Summary
- **Parallel**: Yes (max-parallel from config)
- **Review gate**: Morning review next day
- **Risk gate**: Only low/medium risk; 3 failures = stop
- **Persistence**: night summary in worklogs, progress.md, handoffs

### 8. review-and-recover
- **Use case**: Collect results, make decisions, clean up
- **Input**: Current state (done/failed/stale tasks)
- **Output**: Review verdicts, merge candidates, recovery plan
- **Steps**: Collect status → Review each → Analyze failures → Recover stale → List merge candidates → Plan next
- **Parallel**: Reviews can run in parallel
- **Review gate**: Merge requires user confirm
- **Risk gate**: Never auto-merge to main
- **Persistence**: progress.md, decisions

### 9. user-reality-test
- **Use case**: Test product from real user perspective with 8 personas
- **Input**: Accessible URL or running dev server
- **Output**: Friction log, confusion log, launch blockers
- **Steps**: Select personas → Simulate tasks → Record friction → Output blockers → Generate fix tasks
- **Parallel**: Different personas can test simultaneously
- **Review gate**: Launch blockers become P0/P1 tasks
- **Risk gate**: Personas with BLOCK can halt launch
- **Persistence**: docs/testing/user-reality-<date>.md, fix task list

### 10. chatbot-hardening
- **Use case**: AI/Chatbot/Agent product needs production-readiness assessment
- **Input**: Project path or AI module to assess
- **Output**: 8-dimension gap analysis, hardening plan, fix tasks
- **Steps**: Scan AI modules → Gap analysis → Hardening plan → Generate tasks
- **Parallel**: No (sequential assessment)
- **Review gate**: 铁律官 reviews architecture changes; 尺子官 gates implementation
- **Risk gate**: Prompt changes require review
- **Persistence**: docs/ai-engineering/<product>-hardening.md, tasks/chatbot-hardening-plan.yaml

### 11. design-system-bootstrap
- **Use case**: Starting any UI project — create design system BEFORE coding
- **Input**: Brand description, product concept, optional reference URLs
- **Output**: docs/design-system.md with colors, typography, spacing, components, animations, a11y
- **Steps**: Brand discovery → Reference extraction (optional) → Token generation → Component spec → Validation
- **Parallel**: No (sequential, each phase feeds next)
- **Review gate**: Design system reviewed before builders start
- **Risk gate**: No (docs only)
- **Persistence**: target project's docs/design-system.md

### 12. screenshot-loop
- **Use case**: After any UI change — visual feedback and verification
- **Input**: URL of page to screenshot
- **Output**: Screenshots at 3 viewports, analysis report, pass/fail
- **Steps**: Screenshot (mobile/tablet/desktop) → Analyze against design system → Fix issues → Re-screenshot → Verify
- **Parallel**: No (iterative fix-verify loop, max 3 iterations)
- **Review gate**: Must PASS before UI task submit
- **Risk gate**: BLOCK if 3 iterations fail
- **Persistence**: Screenshots in /tmp, analysis inline

### 13. reference-driven-design
- **Use case**: During idea-to-plan Phase 2 — extract design patterns from reference sites
- **Input**: 2-3 reference website URLs or product category
- **Output**: docs/reference-analysis.md with extracted patterns and engineering constraints
- **Steps**: Select references → Browse + extract CSS/layout → Document patterns → Translate to constraints → Feed into design-system
- **Parallel**: Multiple reference sites can be analyzed simultaneously
- **Review gate**: No (analysis only)
- **Risk gate**: No
- **Persistence**: target project's docs/reference-analysis.md

### 15. commercialization-council-review
- **Use case**: Commercial judgment — should we build/ship/price/grow a product?
- **Input**: Product name + task type (new-product-judgment | single-product-commercialization | demo-to-product-diagnosis | pre-launch-review | growth-optimization | portfolio-strategy)
- **Output**: Council verdict with unified conclusion, core contradiction, priority problem, confirmed/unverified split, next best action
- **Steps**:
  1. Commander identifies task type and selects 4-6 council roles
  2. Each role produces independent assessment (no cross-pollination)
  3. Cross-challenge round: structured adversarial pairs debate
  4. Red Team delivers final challenge to strongest consensus
  5. Commander renders final verdict (no balanced summaries allowed)
- **Parallel**: Step 2 (independent assessments) runs all roles in parallel; Steps 3-5 are sequential
- **Review gate**: Commander final verdict is the gate — produces CONFIRMED vs UNVERIFIED split
- **Risk gate**: If Red Team identifies an unaddressed fatal flaw, verdict is BLOCKED until resolved
- **Persistence**: docs/council-verdicts/<product>-<date>.md

#### Task Type → Role Selection Matrix

| Task Type | Mandatory Roles | Optional Roles |
|---|---|---|
| new-product-judgment | 战略官, 市场研究官, 用户洞察官, 定价官, Red Team | AI工程官 (if AI product) |
| single-product-commercialization | 定价官, 增长验证官, 案例官, 用户洞察官 | Red Team, 成品化总工 |
| demo-to-product-diagnosis | 成品化总工, 真实用户模拟官, Red Team | AI工程官 (if AI product), 增长验证官 |
| pre-launch-review | ALL 10 roles | — |
| growth-optimization | 增长验证官, 用户洞察官, 真实用户模拟官, 案例官 | Red Team |
| portfolio-strategy | 战略官, 市场研究官, 定价官, Red Team | 成品化总工 |

#### Cross-Challenge Pairs (Step 3)

| Challenger | Target | Focus |
|---|---|---|
| 市场研究官 → 战略官 | Is the market big enough for this strategy? |
| 用户洞察官 → 定价官 | Will users actually pay this? |
| 真实用户模拟官 → 增长验证官 | Will users complete this funnel? |
| 成品化总工 → 战略官 | Can we actually build what strategy requires? |
| Red Team → ALL | What has no evidence? What breaks first? |

#### Commander Verdict Format (Step 5)

Must include ALL of:
1. **Unified Conclusion** — one clear statement, no hedging
2. **Core Contradiction** — single biggest unresolved tension
3. **Priority Problem** — the ONE thing to solve first
4. **Confirmed vs Unverified** — what's proven vs what needs real-world validation
5. **Next Best Action** — exactly ONE concrete action

Forbidden: "各有道理", "需要综合考虑", pros-and-cons without decision, deferring when data suffices.

### 14. production-readiness-audit
- **Use case**: Before launch — complete quality gate
- **Input**: Project URL or path
- **Output**: 10-point production readiness report, go/no-go verdict
- **Steps**: Screenshot loop → Mobile QA → A11y audit → Perf audit → Architecture check → Chatbot hardening (if applicable) → User reality test → Compile report → Generate fix tasks if needed
- **Parallel**: Technical audits (screenshot, mobile, a11y, perf, architecture) run simultaneously; user reality test runs after
- **Review gate**: Commander makes final ship decision based on report
- **Risk gate**: NOT READY verdict blocks launch
- **Persistence**: target project's docs/production-readiness-report.md
