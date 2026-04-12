---
name: bug-triage-hotfix
description: "Workflow: Diagnose bug → assess severity → minimal fix → verify → review. Use when something is broken."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<bug description or error message>"
---

# Bug Triage & Hotfix

Systematic bug diagnosis and minimal-risk repair.

## Trigger Phrases
- "这段代码有 bug"
- "这个功能不工作了"
- "报错了，帮我看看"
- "线上出问题了"
- "帮我修这个 bug"
- "这个测试一直挂"
- "页面显示异常"
- "接口返回错误"

## Phase 1: 铁律官 — Triage

1. Reproduce: understand the symptom from `$ARGUMENTS`
2. Read error logs, stack traces, or described behavior
3. Locate the likely source files using Grep/Glob
4. Classify severity:
   - **P0-Critical**: Service down, data loss, security breach → hotfix immediately
   - **P1-Major**: Core feature broken, blocking users → fix within this session
   - **P2-Minor**: Edge case, cosmetic, workaround exists → can queue
   - **P3-Low**: Enhancement disguised as bug → redirect to idea-to-plan
5. Assess blast radius: which files/modules are affected
6. Determine: is this a hotfix (minimal change) or needs deeper investigation?

Output triage summary:
```
BUG TRIAGE: <one-line description>
Severity: P0/P1/P2/P3
Source: <file(s)>
Blast radius: <low/medium/high>
Root cause: <hypothesis>
Fix strategy: <minimal change description>
Risk: <what could go wrong with the fix>
```

## Phase 2: 快刀官 — Hotfix

1. Read the source file(s) identified in triage
2. Implement the MINIMAL fix — do not refactor, do not "improve while we're here"
3. Rules:
   - Fix ONE thing
   - Don't change unrelated code
   - Don't add new dependencies
   - If the fix touches auth/payment/migration → STOP and ask user
4. Write a focused test for the bug (if test framework exists):
   ```
   - Test that reproduces the original bug (should fail without fix)
   - Test that passes with the fix
   ```

## Phase 3: Verify

```bash
npm test --if-present 2>&1 | tail -20
npm run build --if-present 2>&1 | tail -10
npm run lint --if-present 2>&1 | tail -10
```

If any fail: assess whether failure is from the fix or pre-existing.

## Phase 4: 尺子官 — Review Gate

Before committing, self-check:
- [ ] Fix matches the triage diagnosis
- [ ] No unrelated changes
- [ ] No new security risks
- [ ] Tests pass (or explained why not)
- [ ] Severity matches the fix scope (P0 = fast & minimal, P2 = can be more careful)

## Phase 5: Commit & Report

```bash
git add <only changed files>
git commit -m "fix(<scope>): <what was broken and why>"
```

Output:
```
FIX APPLIED
  Bug: <description>
  Severity: <P0-P3>
  Files changed: <list>
  Tests: <pass/fail/none>
  Risk: <low/medium/high>
  Recommendation: <merge now / needs review / needs more investigation>
```

## Risk Gates
- P0 in auth/payment/secrets → STOP, ask user
- Fix changes >5 files → escalate to refactor-safely
- Fix introduces new dependency → STOP, ask user
- Tests fail after fix → report, don't force

## Persistence
- Update docs/progress.md with bug fix entry
- If P0/P1: write handoff note
