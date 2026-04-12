---
name: codebase-understand
description: Analyze project structure, dependencies, patterns, and architecture. Use when starting a new task or onboarding to a project.
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
---

# Codebase Understanding

Analyze this project systematically. Output a structured summary.

## Steps

1. Read `package.json` / `pyproject.toml` / `Cargo.toml` (detect stack)
2. Run `!`ls -la`` to see top-level structure
3. Identify entry points (main, index, app)
4. Map directory structure (src/, tests/, docs/, config/)
5. Identify key patterns (MVC, API routes, component structure)
6. Check for CLAUDE.md, README.md, architecture docs

## Output Format

```
## Tech Stack
- Language: ...
- Framework: ...
- Key deps: ...

## Structure
- Entry: ...
- Source: ...
- Tests: ...

## Patterns
- Architecture: ...
- Data flow: ...
- Key abstractions: ...

## Key Files (top 10 by importance)
1. ...
```
