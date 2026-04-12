---
name: dispatch
description: Register as a worker, claim a task, get prompt + worktree. The standard way for any execution session to start working.
user-invocable: true
allowed-tools: Bash, Read
argument-hint: "<role: builder|reviewer>"
---

# Dispatch

Register and claim a task from Commander in one step.

## Steps

1. Generate a session ID: `worker-<random 4 chars>`
2. Determine role from `$ARGUMENTS` (default: `builder`)
3. Run:
   ```bash
   node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs register -p . -s <session-id> -r <role>
   ```
4. Run:
   ```bash
   node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs claim -p . -s <session-id>
   ```
5. Read the returned prompt carefully
6. If a worktree path is returned, `cd` to that worktree
7. Execute the prompt exactly as specified
8. When done:
   ```bash
   node C:/Users/86136/Desktop/cc24h/bin/cc24h.mjs submit -p . -s <session-id> -t <task-id> \
     --summary "<what you did>" --files "<changed files>" --tests <pass|fail>
   ```
9. Run claim again to get the next task

## Rules
- Do NOT plan your own work — follow the prompt from Commander
- Do NOT modify files outside the prompt's scope
- Always submit results, even if the task failed (use --issues to explain)
