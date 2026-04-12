# Commander TUI Unification

## Context
- TUI exists at src/tui/app.mjs (blessed-based)
- Currently shows tasks, sessions, logs
- Needs to also show: skill governance status, risk policy, audit, hook activity

## Goal
Add a Skill Governance panel to TUI.

## Tasks

### 1. Add skill stats to status bar
In the top status bar, add: `Skills: 7 approved │ 0 trial │ 0 disabled`

### 2. Add 'k' hotkey for skill panel
When user presses 'k':
- Show overlay/panel listing all skills
- Columns: ID, Risk, Status, Uses, Score, Last Used
- Highlight trial skills in yellow, disabled in red

### 3. Add skill report to review command
`cc24h review` should include a "Skill Health" section from `skillEvaluator.weeklyReport()`

## Constraints
- Keep TUI simple — just tables, no fancy graphics
- Don't restructure existing panels
- Add to existing blessed layout

## Verification
1. `cc24h tui -p .` → top bar shows skill count
2. Press 'k' → skill list visible
3. `cc24h review -p .` → includes skill health section
