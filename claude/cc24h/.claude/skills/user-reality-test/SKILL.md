---
name: user-reality-test
description: "Workflow: Simulate 8 types of real users trying the product. Output friction log, confusion points, abandonment risks, launch blockers."
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, WebFetch
argument-hint: "<product URL or project path> [focus: onboarding|core-task|chatbot|pricing|all]"
---

# User Reality Test

Simulate real users with different personas, goals, and patience levels trying your product.

## Trigger Phrases
- "帮我从用户角度试试这个产品"
- "模拟真实用户测一下"
- "用户会不会用"
- "上线前从用户视角检查"
- "这个 onboarding 顺不顺"
- "chatbot 对话体验怎么样"
- "user reality test"
- "用户会在哪里流失"

## Default Participants
- 用户战场官 (lead): runs all persona simulations
- 增长官: CTA/conversion context
- 尺子官: final verdict

## Phase 1: Scope

From `$ARGUMENTS`, determine:
- Target: URL, local project, or specific feature
- Focus: onboarding / core-task / chatbot / pricing / all (default: all)
- Read docs/design-spec.md and docs/progress.md for context

## Phase 2: Persona Matrix

Select 4-6 personas most relevant to this product:

| Persona | Goal | Patience | Key Risk |
|---------|------|----------|----------|
| novice-user | Complete first task | 30 seconds | Can't find start |
| buyer-user | Decide to pay | 2 minutes | No clear value |
| impatient-user | Fastest path | 3 seconds | Any friction = gone |
| skeptical-user | Verify trust | 1 minute | One doubt = gone |
| operator-user | Daily workflow | 5 minutes | Errors break trust |
| misunderstood-user | Wrong expectation | Varies | Disappointment |

## Phase 3: Simulate (per persona)

For each selected persona:
1. State: "I am <persona>. My goal is <goal>. I have <patience level> patience."
2. Start at the entry point (homepage, onboarding, first screen)
3. Walk through the actual flow step by step
4. At each step, record:
   - What I see
   - What I think it means
   - What I try to do
   - What actually happens
   - Whether I'm confused, frustrated, or satisfied
5. Stop when: task completed, OR gave up, OR hit dead end

## Phase 4: Chatbot/AI Test (if applicable)

If product has AI/chatbot:
- Test 5 different conversation openings
- Test 3 multi-turn sequences
- Test 2 edge cases (unexpected input, topic switch)
- Test 1 "I don't understand what to do" scenario
- Record: intent recognition accuracy, context retention, tool calling quality, recovery from confusion

## Phase 5: Output

```markdown
# User Reality Test: <product>
Date: <ISO>
Focus: <scope>
Personas tested: <N>

## Friction Log
| # | Persona | Step | Friction | Type | Severity | Fix |
|---|---------|------|----------|------|----------|-----|
| 1 | novice | Landing | "Don't know what this does" | copy | critical | Rewrite hero |

Type: copy / UX / logic / AI / performance / trust / access
Severity: critical / major / minor / nit

## Confusion Points
| # | Where | What's Confusing | Who's Confused | Why |
|---|-------|-----------------|----------------|-----|

## Abandonment Risk
| Persona | Would abandon at | Reason | Probability |
|---------|-----------------|--------|-------------|
| impatient | Step 2 | Loading too slow | 90% |

## Trust Risks
| Issue | Impact | Persona Most Affected |

## Chatbot/AI Issues (if tested)
| # | Input | Expected | Actual | Problem Type |
|---|-------|----------|--------|-------------|

## Launch Blockers
Issues that MUST be fixed before launch:
1. [CRITICAL] <issue> — affects: <personas>
2. ...

## Recommended Fix Priority
1. P0: <what> (blocks all users)
2. P1: <what> (blocks key personas)
3. P2: <what> (degrades experience)
```

## Risk Guardrails
- L1-L2: read-only simulation, may fetch public URLs
- All findings labeled as "simulated user perspective" not "real user data"
- Does not replace real user testing — complements it
- If product requires login: test only public-facing parts unless user provides access

## Persistence
- Save to `docs/testing/user-reality-<date>.md`
- Feed launch blockers into task-decomposition for fix tasks
- Update docs/progress.md

## Handoff
- Feeds into: bug-triage-hotfix, build-feature, launch-readiness
- Launch blockers become P0/P1 tasks in execution-plan
