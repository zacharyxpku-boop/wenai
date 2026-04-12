---
name: night-run
description: "Workflow: Autonomous low-risk task execution for unattended overnight runs. Respects locks, worktrees, and risk policy."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<optional: specific focus area or 'all pending'>"
---

# Night Run

Unattended autonomous execution of low-risk tasks. Designed to run overnight without human supervision.

## Trigger Phrases
- "今晚自动推进"
- "夜间模式，跑低风险任务"
- "我去睡了，帮我继续"
- "无人值守跑一晚上"
- "把能自动做的都做了"
- "overnight run"
- "自动推进 pending 任务"

## Pre-Flight Check

Before starting night run, verify:
```bash
# 1. Check system health
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs doctor -p .

# 2. Check what's available
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs status -p .
```

Abort if:
- No backend available
- No pending tasks
- Git repo has uncommitted changes (dirty state)

## Task Selection Policy

ONLY execute tasks that meet ALL of:
- [x] status = pending or todo
- [x] risk_level = low or medium (NEVER high)
- [x] does NOT touch: auth, payment, migration, secrets, .env, database schema
- [x] files_touched has no conflict with running tasks
- [x] has clear done_definition
- [x] parallel_safe = true (or no conflicting locks)

SKIP and log reason for any task that:
- Has risk_level = high
- Touches restricted directories
- Has unresolved dependencies
- Requires user confirmation
- Would require new dependency installation

## Execution Loop

```
SESSION = night-worker-<timestamp>

1. Register: cc24h register -s $SESSION -r builder
2. Claim: cc24h claim -s $SESSION
3. If no task → done, write summary
4. If task risk > medium → skip, log reason, claim next
5. Execute task prompt
6. Verify (tests, build, lint)
7. Submit: cc24h submit -s $SESSION -t <id> --summary "..." --files "..." --tests <result>
8. If failed → quarantine task, DO NOT retry tonight, claim next
9. If passed → continue to step 2
```

## Safety Rails

### Every 3 tasks, checkpoint:
- Write progress update
- Check total files changed (if >20 files changed tonight → pause)
- Check for any test failures accumulating

### Automatic pause triggers:
- 3 consecutive task failures → stop night run
- Test suite goes from passing to failing → stop
- Build breaks → stop
- Any error touching restricted paths → stop immediately

### Never during night run:
- Install new dependencies
- Modify CI/CD config
- Change environment variables
- Delete files
- Force push
- Modify .cc24h/ system files
- Run database migrations

## End of Night Summary

When loop ends (no more tasks or pause triggered):

```
NIGHT RUN SUMMARY
  Started: <time>
  Ended: <time>
  Tasks completed: N
  Tasks skipped: N (with reasons)
  Tasks failed: N
  Files changed: <total>
  Tests: <all pass / N failures>
  Branches created: <list>

  COMPLETED:
  - <task-id>: <summary>

  SKIPPED:
  - <task-id>: <reason>

  FAILED:
  - <task-id>: <error summary>

  NEEDS MORNING REVIEW:
  - <list of items requiring human attention>
```

## Persistence
- Write night run summary to `.cc24h/worklogs/night-<date>.md`
- Update docs/progress.md
- Write handoff for each completed task
- All commits on separate branches (never commit to main)

## Morning Follow-Up
User should run next morning:
```bash
node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs review -p .
```
