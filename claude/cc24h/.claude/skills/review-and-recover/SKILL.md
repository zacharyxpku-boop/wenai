---
name: review-and-recover
description: "Workflow: Collect execution results → review → decide done/retry/quarantine → recover stale sessions → plan next step."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash
argument-hint: "<optional: specific session or task to review>"
---

# Review & Recover

Unified result collection, quality gate, failure recovery, and next-step planning.

## Trigger Phrases
- "帮我收口一下"
- "看看执行结果怎么样"
- "有哪些任务失败了"
- "恢复挂掉的 session"
- "总结一下当前进度"
- "决定哪些可以合并"
- "清理一下过期的锁"
- "晨间 review"
- "这次结果能不能通过"

## Phase 1: 状态收集

```bash
# Get full status
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs status -p .

# Get review summary
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs review -p .

# Sync (clean expired locks, detect stale)
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs sync -p .
```

Read:
- docs/progress.md
- Recent files in .cc24h/worklogs/
- Recent files in .cc24h/handoffs/

## Phase 2: 尺子官 — Review Queue

For each task in `review` or `done` status:

### Code Review (if code was changed)
```bash
# See what changed
git log --oneline -10
git diff main...<branch> --stat
```

Apply review checklist:
- [ ] Implements what was asked (matches done_definition)
- [ ] No unrelated changes
- [ ] No security issues (secrets, SQL injection, XSS)
- [ ] Tests pass
- [ ] Build passes
- [ ] Code style matches project

### Verdict per task:
- **PASS** → mark done, candidate for merge
- **NEEDS-FIX** → create follow-up task, assign to builder
- **QUARANTINE** → park the task, log reason, release locks

Output per task:
```
[TASK-ID] VERDICT: PASS/NEEDS-FIX/QUARANTINE
  Files: <list>
  Issues: <none or list>
  Action: <merge / rework / park>
```

## Phase 3: 铁律官 — Failure Analysis

For each `failed` task:

1. Read the task log / worker output
2. Classify failure:
   - **Transient**: timeout, rate limit, network → can retry
   - **Bug in prompt**: unclear instructions → rewrite prompt, retry
   - **Real blocker**: dependency missing, auth expired → escalate
   - **Scope too large**: task tried to do too much → split and retry
3. Decide:
   - Retry (with backoff)
   - Rewrite prompt and retry
   - Split into smaller tasks
   - Quarantine (needs human)

## Phase 4: Stale Session Recovery

```bash
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs sync -p .
```

For each stale session:
- Release its locks
- If task was in progress → reset to pending
- If task was partially done → check git for partial commits
- Write recovery note to handoff

## Phase 5: Merge Candidates

List all branches ready to merge:
```bash
git branch | grep cc24h/
```

For each PASS verdict:
- Check for conflicts with main
- If clean → recommend merge
- If conflicts → report, don't auto-merge

```
MERGE CANDIDATES:
  cc24h/task-a → clean, recommend merge
  cc24h/task-b → conflicts with task-a, merge task-a first
  cc24h/task-c → NEEDS-FIX, not ready
```

## Phase 6: Next Step Planning

Based on review results, recommend:
1. What to merge now
2. What to retry
3. What to queue for next session
4. What needs human attention
5. What the next highest-priority work is

Update docs/progress.md with:
- Review results
- Decisions made
- Next best action

## Output Summary

```
REVIEW & RECOVER SUMMARY

  Reviewed: N tasks
  Passed: N → ready to merge
  Needs fix: N → follow-up tasks created
  Quarantined: N → parked
  Failed analyzed: N → M retriable, K need human
  Stale recovered: N sessions

  MERGE NOW:
  - cc24h/<branch> (task-id)

  RETRY:
  - task-id: <reason for retry>

  NEEDS HUMAN:
  - task-id: <why>

  NEXT PRIORITY:
  - <what to do next>
```

## Risk Gates
- Never auto-merge to main without explicit user approval
- Quarantined tasks release all locks
- Stale session recovery never discards commits
