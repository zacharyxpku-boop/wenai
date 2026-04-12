---
name: yaml-planner
description: Generate and optimize cc24h task YAML with dependency analysis, parallel safety checks, conflict detection, and risk assessment. Use after task-decomposition or when refining an existing plan.
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash
argument-hint: "<goal or path to rough plan>"
---

# YAML Planner

Produce or refine a production-grade `execution-plan.yaml` for `$ARGUMENTS`.

## Context Loading

1. Read `CLAUDE.md` for project conventions
2. Read `docs/architecture.md` for module boundaries
3. Read `docs/progress.md` for what's already done
4. Read existing `tasks/*.yaml` to avoid duplicate work
5. Glob `src/**` to understand directory structure and file ownership

## Analysis Steps

1. **Dependency Graph**: For each task, determine which tasks MUST complete first
   - Data dependencies (task B reads output of task A)
   - Schema dependencies (migration before code using new schema)
   - Shared state (config changes before consumers)

2. **Parallel Safety Check**: For each pair of tasks without hard deps:
   - Compare `files_touched` lists — if overlap > 0, mark `parallel_safe: false`
   - Check directory-level overlap (two tasks both modifying `src/api/`)
   - If only one writes and others read, mark the writer as blocking

3. **Risk Assessment**: For each task:
   - `low`: only adds new files or modifies tests
   - `medium`: modifies existing logic, adds deps
   - `high`: touches auth, payment, migration, config, CI, or > 5 files

4. **Worktree Strategy**: Decide per-task:
   - `parallel_safe: true` + git repo → recommend independent worktree
   - `parallel_safe: false` → must serialize or reassign to reduce overlap

## Output Format

Write to `tasks/execution-plan.yaml`:

```yaml
meta:
  goal: "<original goal>"
  generated_at: "<ISO timestamp>"
  total_tasks: N
  parallelizable: M
  estimated_sessions: X

tasks:
  - id: kebab-case
    title: One-line title
    goal: What this achieves
    prompt: |
      ## Context
      Current project uses <stack>. See <key files>.
      Progress: <what's done>.

      ## Task
      1. Read <files>
      2. Implement <what>
      3. Follow patterns in <reference file>
      4. Do NOT modify <protected files>

      ## Verification
      - <how to verify>

      ## Commit
      git add <files> && git commit -m "feat(<id>): <desc>"
    owner_role: implementer|reviewer|tester
    priority: 1-10
    depends_on: []
    files_touched: [exact/paths]
    parallel_safe: true|false
    parallel_reason: "No overlap with other tasks" | "Shares src/api/auth.ts with task-X"
    risk_level: low|medium|high
    risk_reason: "Only adds new test files"
    worktree: independent|shared
    review_checklist:
      - Check A
      - Check B
    done_definition: "Tests pass, no lint errors, commit clean"
    deliverables: [files created or modified]
```

## Quality Rules

- Every `prompt` must name specific files, not vague descriptions
- Every `files_touched` must be verified against actual project structure (Glob it)
- Every `depends_on` must form a valid DAG (no cycles)
- Every `parallel_safe: false` must have a `parallel_reason` explaining why
- Every `risk_level: high` must have a `risk_reason`
- Prompts must include "Do NOT modify" for protected files near the work area
- Max 12 tasks per plan. If more needed, split into workstreams
- Final task should always be a `reviewer` that checks all prior work

## Anti-Patterns to Avoid

- Don't create tasks with vague prompts like "implement the feature"
- Don't mark everything `parallel_safe: true` — actually check file overlap
- Don't set all priorities to 1 — spread them to reflect real ordering
- Don't forget to check existing `docs/progress.md` for already-done work
