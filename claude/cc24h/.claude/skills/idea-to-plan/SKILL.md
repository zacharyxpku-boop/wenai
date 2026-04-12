---
name: idea-to-plan
description: "Workflow: Take a rough idea through product definition → architecture → design → executable task YAML."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash
argument-hint: "<your rough idea>"
---

# Idea to Plan Workflow

Transform `$ARGUMENTS` into a production-ready execution plan.

## Trigger Phrases
- "我有个想法"
- "把这个想法变成计划"
- "做一个 XX 网站/应用/工具"
- "帮我规划这个项目"
- "这个需求怎么拆"
- "从零开始做 XX"
- "plan this idea"
- "想做个新项目"

## Default Participants
- 破局官 (lead): product definition, MVP scope
- 增长官: page strategy, GTM, CTA
- 铁律官: tech architecture, parallel strategy
- Commander: synthesize into YAML

## Phase 1: 破局官 — Product Definition

1. Read `docs/progress.md` and `docs/architecture.md` (if exist)
2. Answer these questions:
   - What is this really? (product type)
   - Who is it for? (user persona, 1-2 sentences)
   - Why would anyone use it? (value proposition, 1 sentence)
   - What's the MVP? (minimum to validate the idea)
   - What should NOT be in MVP? (explicitly list)
   - What's the success metric?
3. Write findings to `docs/progress.md` (append, don't overwrite)

## Phase 2: 增长官 — Page & Market Strategy

1. Define page structure (what pages, what order)
2. First page framework:
   - Hero section (headline + subhead + CTA)
   - 3 key benefits
   - How it works (3 steps)
   - Social proof / trust signals
   - Final CTA
3. GTM sketch: who → where → what message → what action
4. Write to `docs/design-spec.md`

## Phase 3: 铁律官 — Technical Architecture

1. Read current codebase structure
2. Choose tech stack (with tradeoff reasoning)
3. Define directory structure
4. Define module boundaries
5. Identify what can be reused
6. Identify risk areas
7. Define parallel strategy (which tasks can run simultaneously)
8. Write to `docs/architecture.md`

## Phase 4: Commander — Task Generation

1. Read outputs from Phases 1-3
2. Generate `tasks/execution-plan.yaml` with:
   - 6-12 atomic tasks
   - Clear prompts (20-40 lines each, file-specific)
   - Dependency analysis (depends_on)
   - File conflict analysis (files_touched, parallel_safe)
   - Risk levels
   - Done definitions
3. First task = project setup / scaffolding
4. Last task = reviewer checks all prior work

## Output

- `docs/progress.md` (updated)
- `docs/design-spec.md` (created/updated)
- `docs/architecture.md` (created/updated)
- `tasks/execution-plan.yaml` (created)
- Summary: "Generated N tasks, M parallelizable. Run `cc24h enqueue tasks/execution-plan.yaml` to start."
