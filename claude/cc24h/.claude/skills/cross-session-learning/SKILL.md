---
name: cross-session-learning
description: "Persist patterns, decisions, and lessons learned across sessions. After completing any significant task, extract reusable patterns and write them to the project's pattern library for future sessions to reference."
---

# Cross-Session Learning

## Purpose
Prevent each session from starting from zero. After completing significant work, extract and persist:
- Design patterns that worked
- Architecture decisions and their rationale
- Common pitfalls encountered and solutions
- User feedback patterns
- Performance optimizations applied

## When to Invoke
- After completing a build-feature task
- After a production-readiness-audit
- After a user-reality-test reveals patterns
- After a chatbot-hardening session
- After resolving a non-trivial bug
- At the end of any night-run

## Execution

### Step 1: Extract Patterns
From the just-completed work, identify:
1. **What worked** — patterns worth repeating
2. **What failed** — anti-patterns to avoid
3. **Decisions made** — and WHY (not just what)
4. **Tools/skills that helped** — which skills were most useful
5. **Time sinks** — what took longer than expected

### Step 2: Write to Pattern Library
```
.cc24h/patterns/
├── design/          # Visual/UI patterns that worked
├── architecture/    # Code structure patterns
├── performance/     # Optimization patterns
├── pitfalls/        # Anti-patterns to avoid
├── decisions/       # Key decisions with rationale
└── _index.yaml      # Pattern index with tags
```

Each pattern file:
```yaml
id: pattern-<timestamp>
name: <descriptive name>
category: design|architecture|performance|pitfall|decision
learned_from: <task-id or session-id>
date: <ISO date>
context: <when this pattern applies>
pattern: |
  <the actual pattern/lesson>
counter_pattern: |
  <what NOT to do>
tags: [react, mobile, a11y, performance, ...]
```

### Step 3: Update Index
Append to `.cc24h/patterns/_index.yaml` so future sessions can quickly scan.

### Step 4: Inject into Project CLAUDE.md
If a pattern is project-wide important, add a one-liner to CLAUDE.md under a `## Learned Patterns` section.

## Rules
- Only persist REUSABLE patterns, not task-specific details
- Include WHY, not just WHAT
- Keep pattern descriptions concise (< 10 lines each)
- Tag patterns for searchability
- Review and prune patterns monthly (Commander's /review-and-recover)
- Never persist secrets, credentials, or personal data
