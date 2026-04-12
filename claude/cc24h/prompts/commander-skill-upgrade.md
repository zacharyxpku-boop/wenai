# Commander Skill Upgrade — Create Real SKILL.md Files

## Context
- Project: cc24h
- We have 7 skills in the skill registry (SQLite)
- But no actual `.claude/skills/` SKILL.md files exist
- Skills must become natively invocable by Claude Code

## Goal
Create 7 `.claude/skills/<name>/SKILL.md` files.

## Skills to Create

### 1. `.claude/skills/codebase-understand/SKILL.md`
```yaml
---
name: codebase-understand
description: Analyze project structure, dependencies, patterns, and architecture
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
---
```
Instructions: Read package.json/tsconfig/etc, map directory structure, identify patterns, output structured summary.

### 2. `.claude/skills/task-decomposition/SKILL.md`
```yaml
---
name: task-decomposition
description: Break a high-level goal into atomic executable tasks as YAML
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
argument-hint: "<goal>"
---
```
Instructions: Analyze codebase, break goal into tasks with id/title/prompt/files_touched/depends_on, output valid YAML.

### 3. `.claude/skills/handoff-generation/SKILL.md`
```yaml
---
name: handoff-generation
description: Generate structured handoff notes for session relay
user-invocable: true
allowed-tools: Read, Bash
---
```
Instructions: Summarize current state, completed items, remaining items, modified files, risks, next steps.

### 4. `.claude/skills/review-checklist/SKILL.md`
```yaml
---
name: review-checklist
description: Systematic code review covering correctness, security, style, tests
user-invocable: true
context: fork
allowed-tools: Read, Glob, Grep, Bash
---
```
Instructions: Review git diff, check for bugs, security issues, style violations, missing tests, edge cases.

### 5. `.claude/skills/page-copy-review/SKILL.md`
```yaml
---
name: page-copy-review
description: Audit pages for UX clarity, conversion, accessibility, copy quality
user-invocable: true
allowed-tools: Read, Glob, Grep
---
```
Instructions: Check CTA clarity, mobile readability, SEO basics, conversion path, accessibility.

### 6. `.claude/skills/test-generation/SKILL.md`
```yaml
---
name: test-generation
description: Generate unit/integration tests for changed files
user-invocable: true
allowed-tools: Read, Write, Bash, Glob
argument-hint: "<file-or-module>"
---
```
Instructions: Read changed files, identify testable functions, generate tests, run them, report coverage.

### 7. `.claude/skills/risk-scan/SKILL.md`
```yaml
---
name: risk-scan
description: Scan for security issues, leaked secrets, broken deps, deployment risks
user-invocable: true
context: fork
allowed-tools: Read, Glob, Grep, Bash
---
```
Instructions: Check for .env values in code, TODO/FIXME in critical paths, npm audit, git secrets scan.

## Constraints
- Each SKILL.md must have valid YAML frontmatter
- Instructions must be specific and actionable (not generic)
- Keep each file under 80 lines
- Do NOT modify the skill registry (database) — these are the native Claude Code files

## Verification
- In a Claude Code session, type `/review-checklist` → skill should appear and be invocable
- `ls .claude/skills/` → 7 directories, each with SKILL.md
