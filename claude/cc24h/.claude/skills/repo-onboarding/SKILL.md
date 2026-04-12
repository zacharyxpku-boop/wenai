---
name: repo-onboarding
description: "Workflow: Analyze a new/unfamiliar project. Outputs architecture.md + progress.md + project stage judgment."
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Repo Onboarding Workflow

Systematically understand a project and set up Commander context documents.

## Trigger Phrases
- "接手这个项目"
- "帮我读懂这个仓库"
- "先了解一下这个项目"
- "新项目，先分析一下"
- "onboard this repo"
- "这个项目是什么情况"
- "帮我看看这个代码库"

## Default Participants
- 铁律官 (lead): codebase analysis, structure mapping
- 破局官: project stage & product judgment
- Commander: write docs, synthesize

## Phase 1: 铁律官 — Codebase Analysis

1. Read `package.json` / `pyproject.toml` / `Cargo.toml` to detect stack
2. `ls` top-level to see structure
3. Glob `src/**/*.{ts,tsx,js,jsx,py,rs}` to map source files
4. Identify entry points (main, index, app, server)
5. Read existing `README.md`, `CLAUDE.md`
6. Run `git log --oneline -20` for recent history
7. Check for: tests/, docs/, CI config, .env.example

## Phase 2: 破局官 — Project Stage Judgment

Based on codebase analysis, determine:
- **Stage**: Idea / MVP / Growth / Mature / Legacy
- **Type**: SaaS / Marketing site / API / CLI tool / Library / Internal tool
- **Health**: Active / Stale / Abandoned
- **Key risk**: Tech debt / No tests / Missing docs / Security / Other

## Phase 3: Write Context Documents

### Create/update `docs/architecture.md`:
```markdown
# Architecture

## Tech Stack
- Language: ...
- Framework: ...
- Key deps: ...

## Structure
- Entry: ...
- Source: src/...
- Tests: tests/...
- Config: ...

## Key Modules
1. <module>: <purpose>

## Data Flow
<how data moves through the system>

## Risk Areas
- <high-risk directory>: <why>
```

### Create/update `docs/progress.md`:
```markdown
# Progress

## Current Stage
<stage> — <evidence>

## Last Updated
<ISO date>

## Completed
- <what exists>

## Next Best Action
<what should happen first>
```

## Output
Summarize findings in 10 lines or less. Point to the created docs.
