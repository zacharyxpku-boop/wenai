---
name: gstack-auto-qa
description: "Automatically invoke gstack browse/QA within screenshot-loop and production-readiness-audit workflows. Bridges gstack's browser capabilities into the quality pipeline."
---

# gstack Auto-QA Integration

## Purpose
Wire gstack's powerful browser-based QA into Commander's quality pipeline so it triggers automatically instead of requiring manual invocation.

## When Auto-Triggered
1. **screenshot-loop workflow** — After each UI edit, auto-invoke gstack browse for visual verification
2. **production-readiness-audit** — Full QA pass using gstack /qa
3. **user-reality-test** — Use gstack browse for persona simulation
4. **mobile-qa** — Use gstack browse with mobile viewport

## Execution

### Within screenshot-loop:
```bash
# 1. Start dev server if not running
npm run dev &

# 2. Use agent-browser (primary) or gstack browse (fallback)
npx agent-browser session:start --url http://localhost:3000

# 3. Take snapshots at 3 viewports
# Desktop (1280x800)
npx agent-browser page:snapshot --viewport 1280x800
# Tablet (768x1024)
npx agent-browser page:snapshot --viewport 768x1024
# Mobile (375x812)
npx agent-browser page:snapshot --viewport 375x812

# 4. Compare against design-system.md constraints
# 5. Log issues to .cc24h/audits/screenshot-<timestamp>.yaml
```

### Within production-readiness-audit:
```bash
# Full QA sweep using gstack
/qa <target-url>

# Or using playwright test suite
/test-all <target-url>
```

### Within user-reality-test:
```bash
# Per-persona browser session
npx agent-browser session:start --url <target-url>
# Execute persona task list
# Record friction at each step
```

## Fallback Chain
If `agent-browser` is not available:
1. Try `gstack /browse`
2. Try `preview_*` tools (Claude Code built-in)
3. Fall back to manual screenshot + analysis

## Output
Each invocation writes to:
```
.cc24h/audits/
├── screenshot-<timestamp>.yaml
├── qa-<timestamp>.yaml
└── browser-session-<timestamp>.log
```

## Integration Points
- Commander's `_genPrompt()` injects screenshot-loop reminder for UI tasks
- Commander's enforcement gates require visual verification before UI task submit
- production-readiness-audit calls this skill as step 2 of 10
