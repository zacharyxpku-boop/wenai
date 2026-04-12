---
name: task-decomposition
description: Break a high-level goal into atomic executable tasks with dependency analysis, file conflict detection, and parallel safety. Use when receiving a new feature request or goal.
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash
argument-hint: "<goal>"
---

# Task Decomposition

Break `$ARGUMENTS` into atomic, executable tasks.

## Phase 1: Understand Current State

1. Read `CLAUDE.md`, `docs/progress.md`, `docs/architecture.md`
2. Glob `src/**` to map directory structure
3. Read `tasks/*.yaml` to know what's already planned or done
4. Run `git log --oneline -5` to see recent changes

## Phase 2: Decompose

1. Identify what needs to change to achieve the goal
2. Split into smallest independently-executable tasks
3. Each task = one session can complete it in one shot
4. Max 10 tasks per decomposition

## Phase 3: Dependency & Conflict Analysis

For each task pair (A, B):
- If B reads files that A creates/modifies → `B.depends_on: [A.id]`
- If A and B both modify the same file → mark `parallel_safe: false` on both, explain why
- If A modifies a config that B reads → A before B

Run this check:
```
For task X, Grep: files_touched against all other tasks' files_touched
If overlap found → add parallel_reason explaining the conflict
```

## Phase 4: Output

Write to `tasks/decomposed-<timestamp>.yaml`:

```yaml
tasks:
  - id: kebab-case-id
    title: Short description
    prompt: |
      ## Context
      Project uses <stack>. Key file: <reference>.
      Already done: <prior work>.

      ## Task
      1. Read <specific files>
      2. Implement <specific change>
      3. Follow patterns in <reference file>
      4. Do NOT modify <protected files near work area>

      ## Verify
      - <specific verification step>

      ## Commit
      git add <files> && git commit -m "feat(<id>): <desc>"
    priority: 1-10
    agent_role: implementer|reviewer|tester
    depends_on: []
    files_touched: [exact/file/paths.ts]
    parallel_safe: true|false
    parallel_reason: "No file overlap" | "Both modify src/api/auth.ts"
    risk_level: low|medium|high
    done_definition: "What must be true when this task is done"
```

## Rules

- Every `prompt` must name SPECIFIC files, not vague areas
- Every `files_touched` must be verified via Glob — don't guess paths
- `depends_on` must form a DAG (no cycles)
- Final task should be a `reviewer` role that checks all prior work
- If two tasks MUST share a file, mark both `parallel_safe: false` and add reason
- Prompts must include "Do NOT modify" clauses for nearby protected files
- Don't create tasks for work already done (check progress.md)
