---
name: pricing-teardown
description: "Compare pricing models of 3-8 competitors — tiers, feature gates, free vs paid, positioning strategy."
user-invocable: true
allowed-tools: Read, Write, Bash, WebSearch, WebFetch
argument-hint: "<competitor names or URLs, comma-separated>"
---

# Pricing Teardown

## Purpose
Systematically collect and compare pricing structures of competitors to inform our own pricing strategy.

## When to Use
- Designing pricing for a new product
- Auditing whether current pricing is competitive
- Before a pricing change decision
- Feeding into go-to-market strategy

## When NOT to Use
- Competitors don't have public pricing (enterprise/contact-sales only — note this as a finding)
- You need full product analysis beyond pricing (use competitor-teardown)

## Typical User Requests
- "看看竞品怎么定价的"
- "对比一下这几家的价格"
- "pricing teardown for Notion, Coda, Obsidian"
- "我们应该怎么定价，先看看别人"

## Inputs
- 3-8 competitor names or pricing page URLs
- Product category (for context)

## Outputs
```markdown
# Pricing Teardown: <category>
Date: <ISO>

## Comparison Table
| Competitor | Free Tier | Starter | Pro | Enterprise | Model |
|-----------|----------|---------|-----|-----------|-------|
| <name> | <what's free> | $X/mo | $X/mo | Contact | per-seat / flat / usage |

## Feature Gates (what unlocks at each tier)
| Feature | <Comp A> Free | <Comp A> Pro | <Comp B> Free | <Comp B> Pro |
|---------|------|------|------|------|

## Pricing Models Observed
- Per-seat: <who uses this>
- Flat rate: <who>
- Usage-based: <who>
- Freemium: <who>

## Positioning Patterns
- <Comp A>: targets <who> at <price point> with <angle>
- <Comp B>: ...

## Our Pricing Implications
1. <insight for our pricing>
2. <what price range is defensible>
3. <what model fits our product type>

## Sources
- [1] <pricing page URL>
```

## Execution Pattern
1. For each competitor, search "<name> pricing" or fetch provided URL
2. WebFetch each pricing page: extract tiers, prices, feature lists
3. Normalize into comparison table
4. Identify common patterns (freemium, per-seat, etc.)
5. Note missing/hidden pricing as a data point
6. Write to `docs/research/<category-slug>-pricing.md`

## Risk Guardrails
- L1: read-only, public pages only
- Do NOT access pricing that requires login or trial signup
- Do NOT fabricate prices — mark "not public" if unavailable
- Currency must be noted (USD/CNY/EUR)

## Dependencies / Adapters
- WebSearch + WebFetch (built-in)

## Validation
- Every price must link to its source URL
- "Pricing not public" is a valid finding
- Check date — pricing changes frequently, note retrieval date

## Fallback Behavior
- If pricing page is behind auth: record "requires signup to view" as data point
- If no public pricing: record the contact-sales model as the finding

## Handoff Notes
- Feeds into: go-to-market.md, idea-to-plan, research-to-brief
- Save: `docs/research/<category-slug>-pricing.md`
