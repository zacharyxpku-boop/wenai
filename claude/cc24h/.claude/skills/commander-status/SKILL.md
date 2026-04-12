---
name: commander-status
description: Show Commander Core status — tasks, sessions, locks, decisions, review queue. Use as first thing in any new session.
user-invocable: true
allowed-tools: Bash, Read
---

# Commander Status

Show the current state of the Commander system.

## Steps

1. Run: `node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs status -p .`
2. Run: `node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs review -p .`
3. Read `docs/progress.md` if it exists
4. Read `tasks/execution-plan.yaml` if it exists (just the task IDs and statuses)

## Output

Present a concise dashboard:
```
STATUS
  Tasks:    X todo | Y running | Z review | W done | F failed
  Sessions: A active | B idle | C stale
  Locks:    N active

PROGRESS
  Stage: <current stage>
  Last: <most recent completed item>
  Next: <recommended next action>

REVIEW QUEUE
  <list tasks in review status, if any>

BLOCKERS
  <list blocked tasks, if any>
```

Keep it SHORT. No explanations. Just facts.
