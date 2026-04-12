# Commander Growth Layer

## Context
- Commander can plan and execute coding tasks
- Missing: market/growth/content awareness in task generation
- When commander plans a project, it should consider go-to-market alongside technical work

## Goal
Enhance commander's Phase A (Product Definition) and Phase C (Design Spec) to include growth considerations.

## Tasks

### 1. Enhance Phase A prompt
In `src/commander.mjs`, Phase A should also output:
- Target audience segments (not just "users")
- Key conversion actions (not just "features")
- Growth channels worth testing
- Content that should exist at launch

### 2. Enhance Phase C prompt
Phase C should also output:
- CTA hierarchy (primary, secondary, tertiary)
- Social proof placement
- SEO content priorities
- Analytics events to track

### 3. Add growth-specific task types
In Phase D task generation, allow these task types:
- `content`: Write copy, create landing page content
- `seo`: Add meta tags, sitemap, structured data
- `analytics`: Add tracking events, conversion funnels
- `social-proof`: Add testimonials, case studies, trust signals

## Constraints
- Don't change existing Phase B (architecture) or Phase D (task gen) structure
- Add to existing prompts, don't replace them
- Growth considerations are suggestions, not blockers

## Verification
1. `cc24h commander "AI tarot reading app" -p .`
2. Phase A output includes audience segments and conversion actions
3. Phase C output includes CTA hierarchy and SEO priorities
4. Phase D tasks include at least one content/seo/analytics task
