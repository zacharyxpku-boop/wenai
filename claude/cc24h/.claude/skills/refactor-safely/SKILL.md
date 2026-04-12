---
name: refactor-safely
description: "Workflow: Impact analysis → batch plan → incremental refactor with verification gates. Use when code needs restructuring without breaking things."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<what to refactor and why>"
---

# Refactor Safely

Controlled, incremental refactoring with verification at every step.

## Trigger Phrases
- "重构这个模块"
- "这块代码太乱了，整理一下"
- "把这个组件拆开"
- "迁移到新的 API"
- "统一代码风格"
- "这个架构要调整"
- "把 X 从 Y 里解耦"
- "想重构但不想搞炸"

## Anti-Pattern Prevention
This workflow exists to PREVENT:
- Big-bang refactors that break everything
- "While I'm here" scope creep
- Refactors without test coverage
- Refactors that cross module boundaries without planning

## Phase 1: 铁律官 — Impact Analysis

1. Read the target files/modules from `$ARGUMENTS`
2. Map dependencies:
   ```bash
   # Find all importers of the target
   grep -r "import.*from.*<target>" --include="*.{ts,tsx,js,jsx}" -l
   grep -r "require.*<target>" --include="*.{ts,tsx,js,jsx}" -l
   ```
3. Map what the target depends on
4. Identify test coverage: are there tests for this code?
5. Classify risk zones within the target:
   - Pure functions → safe to refactor
   - State management → medium risk
   - External API calls → high risk
   - Auth/payment/DB schema → STOP

Output impact analysis:
```
REFACTOR IMPACT ANALYSIS
Target: <files/modules>
Importers: <N files depend on this>
Test coverage: <yes/no/partial>
Risk zones: <list>
Estimated batches: <N>
Recommendation: <proceed / needs tests first / too risky>
```

## Phase 2: 铁律官 — Batch Plan

Split the refactor into batches where each batch:
- Changes ≤3 files
- Has a clear before/after
- Can be verified independently
- Can be reverted without affecting other batches

```
Batch 1: <what changes> → verify: <how>
Batch 2: <what changes> → verify: <how>
Batch 3: <what changes> → verify: <how>
```

Rules:
- If no tests exist for the target → Batch 0 is "add tests for current behavior"
- Max 5 batches per refactor session
- If >5 batches needed → split into multiple refactor-safely sessions

## Phase 3: 快刀官 — Execute Batches

For EACH batch:

1. Make the changes
2. Verify immediately:
   ```bash
   npm test --if-present 2>&1 | tail -20
   npm run build --if-present 2>&1 | tail -10
   ```
3. If verify FAILS → revert this batch, report, stop
4. If verify PASSES → commit:
   ```bash
   git add <changed files>
   git commit -m "refactor(<scope>): batch N - <what changed>"
   ```
5. Proceed to next batch

## Phase 4: 尺子官 — Final Check

After all batches:
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No new warnings
- [ ] Original functionality preserved
- [ ] Code is actually cleaner (not just different)
- [ ] No scope creep beyond original target

## Output
```
REFACTOR COMPLETE
Target: <what was refactored>
Batches: <N completed> / <N planned>
Files changed: <list>
Tests: <pass/fail>
Risk: <low/medium>
Reverted batches: <none or list>
```

## Hard Stops
- Target includes auth/payment/migration → ask user first
- No test coverage AND target has >3 importers → add tests first
- Batch fails verification → stop, report, don't continue
- Scope expanding beyond original target → stop, report

## Persistence
- Update docs/progress.md
- Update docs/architecture.md if module boundaries changed
- Write handoff if not all batches completed
