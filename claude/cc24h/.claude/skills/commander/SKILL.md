---
name: commander
description: Connect to cc24h Commander Core. Get task assignments, submit results, sync context.
---

# Commander Skill

You are connected to a Commander Core system. Follow this workflow:

## 1. Register (once)
```bash
node bin/cc24h.mjs register -p . -s <your-session-id> -r builder
```

## 2. Get Task
```bash
node bin/cc24h.mjs claim -p . -s <your-session-id>
```
This returns: task ID, priority, prompt, worktree path, branch, locked files.
Execute the prompt exactly as given.

## 3. Submit Result
```bash
node bin/cc24h.mjs submit -p . -s <your-session-id> -t <task-id> --summary "what I did" --files "a.ts,b.ts" --tests pass --issues "none"
```

## 4. Get Next
```bash
node bin/cc24h.mjs next -p . -s <your-session-id>
```

## Rules
- Do NOT re-plan the project — Commander does that
- Do NOT modify files outside your locked scope
- Always submit results when done
- If stuck: `node bin/cc24h.mjs request-review -p . -s <your-session-id>`
- To see everything: `node bin/cc24h.mjs context -p . -s <your-session-id>`
