---
name: screenshot-loop
description: "ALWAYS run after ANY UI code changes. Visual feedback loop: screenshot at 3 viewports → analyze → fix → re-verify. Auto-triggered by hook after 5 UI edits."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, mcp__Claude_Preview__preview_start, mcp__Claude_Preview__preview_screenshot, mcp__Claude_Preview__preview_snapshot, mcp__Claude_Preview__preview_inspect, mcp__Claude_Preview__preview_resize, mcp__Claude_Preview__preview_console_logs, mcp__Claude_Preview__preview_network, mcp__Claude_Preview__preview_eval
argument-hint: "<URL or local dev server URL>"
---

# Screenshot Loop — EXECUTABLE Visual QA

**This is NOT optional.** Every UI task MUST end with a screenshot loop pass.
The `auto-screenshot-trigger` hook will remind you after every 5 UI file edits.

## Step 0: Ensure Dev Server Running

Use `preview_start` to launch the dev server. If already running, use `preview_list` to get the serverId.

```
preview_start({ name: "<server-name-from-launch.json>" })
```

If no `.claude/launch.json` exists, create one first:
```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
  ]
}
```

## Step 1: Desktop Capture (1280x800)

Execute these in sequence:
1. `preview_resize({ serverId, preset: "desktop" })`
2. `preview_console_logs({ serverId, level: "error" })` — check for JS errors FIRST
3. `preview_network({ serverId, filter: "failed" })` — check for failed requests
4. `preview_snapshot({ serverId })` — get accessibility tree (text content, structure)
5. `preview_screenshot({ serverId })` — visual capture

**Analyze desktop**: content within max-width? adequate whitespace? visual hierarchy clear? CTA prominent?

## Step 2: Mobile Capture (375x812)

1. `preview_resize({ serverId, preset: "mobile" })`
2. `preview_snapshot({ serverId })` — check structure adapts
3. `preview_screenshot({ serverId })` — visual capture

**Analyze mobile — THESE ARE HARD REQUIREMENTS**:
- [ ] Body text >= 16px? → `preview_inspect({ serverId, selector: "body", styles: ["font-size"] })`
- [ ] Touch targets >= 44px? → `preview_inspect({ serverId, selector: "button, a, [role=button]", styles: ["min-height", "min-width", "padding"] })`
- [ ] No horizontal overflow? → `preview_eval({ serverId, expression: "document.body.scrollWidth > window.innerWidth" })`
- [ ] Navigation accessible? → `preview_snapshot` should show nav elements
- [ ] Content not cut off? → screenshot shows all content

## Step 3: Tablet Capture (768x1024)

1. `preview_resize({ serverId, preset: "tablet" })`
2. `preview_screenshot({ serverId })` — visual capture

**Analyze tablet**: layout adapts (not squeezed desktop)? Columns reflow?

## Step 4: Design System Compliance

Read the project's `design-system.md` (if exists) and check:

```
preview_inspect({ serverId, selector: "h1", styles: ["font-family", "font-size", "color", "font-weight"] })
preview_inspect({ serverId, selector: "body", styles: ["font-family", "font-size", "color", "background-color"] })
preview_inspect({ serverId, selector: ".btn, button", styles: ["background-color", "color", "border-radius", "padding"] })
preview_inspect({ serverId, selector: "a", styles: ["color", "text-decoration"] })
```

**Anti-AI Check** (hard constraints from oiloil-ui-ux-guide):
- Font is NOT Inter/Roboto/Arial/Open Sans/Poppins?
- No purple-to-blue gradients?
- No rounded-3xl + shadow-2xl combo?
- Colors match design system, not Tailwind defaults?

## Step 5: Issue Classification

| Severity | Definition | Action |
|----------|-----------|--------|
| CRITICAL | Page broken, JS errors, content unreadable, function inaccessible | MUST fix before continuing |
| MAJOR | Layout wrong, touch targets small, contrast failure, design system violation, Anti-AI violation | MUST fix before submit |
| MINOR | Spacing off, minor inconsistency | Fix if within scope |

## Step 6: Fix → Re-verify Loop

If issues found:
1. Edit source files to fix (NOT preview_eval — that's temporary)
2. Wait for HMR or `preview_eval({ expression: "window.location.reload()" })`
3. Re-run Steps 1-4 for affected viewports
4. **Max 3 iterations** — if still CRITICAL/MAJOR after 3 rounds:

```
STATUS: BLOCKED
REASON: Visual issues persist after 3 fix iterations
ATTEMPTED: [list fixes]
RECOMMENDATION: Manual design review needed
```

## Step 7: Verdict

Output this table:

```
| Viewport | Status | Issues |
|----------|--------|--------|
| Desktop  | PASS/FAIL | ... |
| Mobile   | PASS/FAIL | ... |
| Tablet   | PASS/FAIL | ... |

VERDICT: PASS / CONDITIONAL / FAIL
```

- **PASS**: No CRITICAL/MAJOR across all 3
- **CONDITIONAL**: No CRITICAL, ≤2 MINOR remaining
- **FAIL**: Any CRITICAL, or >2 MAJOR

## Auto-Trigger Integration

The `auto-screenshot-trigger` hook tracks UI file edits. After 5 edits it outputs:
```
📸 VISUAL CHECK NEEDED — run screenshot-loop
```

When you see this message, you MUST run this workflow before continuing to write more UI code.

## Reset Tracker After Verification

After completing screenshot-loop, reset the edit tracker:
```bash
echo '{"editCount":0,"files":[],"lastReminder":0,"lastVerified":'$(date +%s000)'}' > .cc24h/ui-edit-tracker.json
```
