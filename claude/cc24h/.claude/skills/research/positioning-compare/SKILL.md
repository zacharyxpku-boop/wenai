---
name: positioning-compare
description: "Side-by-side positioning analysis — taglines, value props, target audiences, differentiation angles for 3-6 competitors."
user-invocable: true
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
argument-hint: "<competitor names, comma-separated>"
---

# Positioning Compare

## Purpose
Extract and compare how competitors position themselves — messaging, target audience, value propositions — to find differentiation opportunities.

## When to Use
- Defining your own positioning against known competitors
- Before writing homepage copy or GTM strategy
- When existing positioning feels weak or undifferentiated
- After serp-landscape-scan identified key players

## When NOT to Use
- You don't know who the competitors are yet (use serp-landscape-scan first)
- You need pricing details (use pricing-teardown)
- You need deep feature analysis (use competitor-teardown)

## Typical User Requests
- "对比一下这几家的定位"
- "他们各自的卖点是什么"
- "我们怎么跟他们差异化"
- "compare positioning of X, Y, Z"

## Inputs
- 3-6 competitor names or homepage URLs
- Our product context (if available from docs/architecture.md)

## Outputs
```markdown
# Positioning Compare: <category>
Date: <ISO>

## Positioning Matrix
| | <Comp A> | <Comp B> | <Comp C> | Ours |
|---|---|---|---|---|
| Tagline | "..." | "..." | "..." | <TBD or existing> |
| Target user | ... | ... | ... | ... |
| Core promise | ... | ... | ... | ... |
| Proof type | Social proof / Data / Authority | ... | ... | ... |
| Primary CTA | ... | ... | ... | ... |
| Tone | Professional / Casual / Technical | ... | ... | ... |

## Messaging Patterns
- Common: <what everyone says>
- Differentiators: <who says something unique>
- Overused: <tired angles to avoid>

## Whitespace Map
Positioning angles that NO competitor currently owns:
1. <angle> — why it could work
2. ...

## Recommended Positioning for Us
- Primary angle: <what to lead with>
- Avoid: <what's overcrowded>
- Proof strategy: <what type of proof we should use>

## Sources
- <Comp A>: <homepage URL>
```

## Execution Pattern
1. For each competitor, WebFetch their homepage
2. Extract: headline, subhead, CTA text, hero image description, key claims
3. Search "<name> about" or "<name> tagline" for additional context
4. Build comparison matrix
5. Identify patterns, gaps, whitespace
6. Write to `docs/research/<category-slug>-positioning.md`

## Risk Guardrails
- L1: read-only
- Only extract from public homepages
- Do NOT quote more than one short phrase per competitor (copyright)
- Mark AI interpretation vs direct quotes

## Dependencies / Adapters
- WebSearch + WebFetch (built-in)

## Validation
- Each tagline/claim must come from actual homepage content
- If a competitor's site is down or blocked, note it rather than guess
- "Could not access" is valid

## Fallback Behavior
- If WebFetch fails for a URL: use WebSearch to find cached/described positioning
- If competitor is pre-launch with no public site: note as "stealth mode"

## Handoff Notes
- Feeds into: design-spec.md (our positioning), content-repurpose, idea-to-plan
- Save: `docs/research/<category-slug>-positioning.md`
