---
name: launch-readiness
description: "Workflow: Pre-launch checks — release readiness + page/copy audit + risk review + GTM readiness."
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash
---

# Launch Readiness Workflow

Full pre-launch assessment combining 尺子官 + 增长官 + 铁律官 perspectives.

## Trigger Phrases
- "准备上线"
- "发布前检查"
- "能不能上线了"
- "做 launch checklist"
- "pre-launch review"
- "准备发布"
- "上线前帮我查一遍"
- "这个版本能发吗"

## Default Participants
- 尺子官 (lead): technical readiness
- 增长官: page/copy/conversion audit
- 铁律官: risk assessment
- Commander: go/no-go decision

## Phase 1: 尺子官 — Release Readiness (Technical)

Run the 8-point release readiness check:
1. Build: `npm run build --if-present`
2. Tests: `npm test --if-present`
3. Lint: `npm run lint --if-present`
4. Security: grep for leaked secrets, `npm audit`
5. Deps: check for unintended new dependencies
6. Git: clean status, sensible commits
7. Docs: README/CLAUDE.md accurate
8. Config: no hardcoded URLs/credentials

## Phase 2: 增长官 — Page & Conversion Audit

1. Read all user-facing pages/components
2. Check each page for:
   - Clear value proposition (can you understand in 3 seconds?)
   - Visible CTA (can you find the action button?)
   - Mobile responsiveness
   - Loading performance concerns
   - SEO basics (title, meta, headings)
3. Check copy for:
   - Spelling/grammar
   - Consistent tone
   - User-facing language (not developer jargon)

## Phase 3: 铁律官 — Risk Assessment

1. List all changed files since last release/tag
2. Identify high-risk changes (auth, payment, data, config)
3. Check for:
   - Breaking API changes
   - Database migration needs
   - Environment variable changes
   - Third-party service changes
4. Rate overall risk: LOW / MEDIUM / HIGH

## Output

```markdown
# Launch Readiness Report
Date: <ISO>

## Verdict: READY | NOT READY | CONDITIONAL

## Technical (尺子官)
| Check | Status | Notes |
|-------|--------|-------|
| Build | ✅/❌ | ... |
| Tests | ✅/❌ | ... |
| ... | ... | ... |

## Page & Copy (增长官)
- Homepage: <verdict + key finding>
- CTA clarity: <verdict>
- Mobile: <verdict>
- SEO: <verdict>

## Risk (铁律官)
- Overall risk: <LOW/MEDIUM/HIGH>
- High-risk changes: <list or none>
- Migration needed: <yes/no>

## Blocking Issues
1. <issue>: <how to fix>

## Recommendation
<ship / fix first / wait for>
```
