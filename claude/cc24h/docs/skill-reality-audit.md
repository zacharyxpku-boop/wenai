# Skill Reality Audit
**Date:** 2026-03-20
**Verdict:** System has quantity, lacks execution depth. Most skills are suggestions, not enforcers.

## The Core Problem

129 SKILL.md files. Zero products shipped. The system is an elaborate instruction manual that nobody is forced to follow.

## Classification: Every Skill's Real Status

### A. Installed + High Quality + Would Work IF Triggered Correctly

These skills have real substance and would improve output — but depend on being triggered at the right moment:

| Skill | Lines | Quality | Problem |
|-------|-------|---------|---------|
| frontend-design (Anthropic) | 42 | Excellent | Only works if explicitly invoked or task is recognized as UI |
| oiloil-ui-ux-guide | 197 | Excellent | Has Anti-AI Defaults section with concrete rules. But only loads as reference |
| baseline-ui | 85 | Excellent | Concrete MUST/NEVER rules. But who forces the builder to run it after coding? |
| fixing-accessibility | 119 | Excellent | Priority-ranked rules. But not auto-executed |
| vercel-react-best-practices | 143 | Excellent | 64 rules, impact-ordered. But only "reference when" — not mandatory |
| agent-browser | 682 | Excellent | Real browser automation. But never called automatically |
| chatbot-hardening | 165 | Good | Clear checklist. But only runs on explicit request |

**Verdict:** These 7 skills are genuinely strong. They would work. But they sit as passive reference material.

### B. Installed + Triggers Exist + But Only Suggestions

These skills have routing keywords in routing-policy.md, but the routing itself is just a Commander prompt instruction — not a code-level gate:

| Skill | Routing | Enforcement Level |
|-------|---------|-------------------|
| design-system-bootstrap | Keywords + mandatory rule in docs | **Code-level gate** (checkEnforcementGates) |
| screenshot-loop | Keywords + mandatory rule in docs | Prompt injection only |
| production-readiness-audit | Keywords + mandatory rule in docs | **Code-level gate** |
| user-reality-test | Keywords | Prompt injection only |
| mobile-qa | Keywords | Prompt injection only |
| performance-audit | Keywords | Prompt injection only |
| accessibility-audit | Keywords | Prompt injection only |

**Verdict:** Only 2 out of 7 "mandatory" workflows have actual code-level enforcement. The rest rely on Commander's prompt saying "you must run this" — which Claude can and will ignore when task pressure is high.

### C. Installed But Will Never Auto-Trigger

These skills only activate with explicit `/skill-name` invocation:

| Skill | Why It Won't Auto-Trigger |
|-------|--------------------------|
| fixing-motion-performance | No auto-detection of animation issues |
| fixing-metadata | No auto-detection of missing SEO tags |
| vercel-composition-patterns | No auto-detection of boolean prop patterns |
| vercel-web-design-guidelines | No auto-detection of guideline violations |
| remotion | Only useful for video, very narrow trigger |
| firecrawl | Only useful for web scraping tasks |
| cross-session-learning | No auto-trigger after task completion |
| deploy | Only on explicit deploy request |

**Verdict:** 8 skills that are pure passive reference. They add context tokens but zero proactive behavior.

### D. Installed But Quality Is Insufficient

| Skill | Problem |
|-------|---------|
| design-system-bootstrap (self-built) | Produces generic output because it lacks REAL reference websites, real brand input, real competitive analysis. It asks for "3-5 adjectives" — that's not design system creation, that's a prompt template. |
| screenshot-loop (self-built) | Depends on gstack browse or agent-browser — neither is reliably installed/tested. Falls back to preview_* which requires a running server. The "analyze against design system" step is vague — what exactly does Claude check? |
| reference-extraction (self-built) | 85 lines of instructions but no actual mechanism to browse, scrape, or analyze a real website. Says "extract patterns" but doesn't define HOW. |
| user-reality-test (self-built) | 127 lines of persona descriptions but no actual browser automation wired in. The agent CAN'T test without a running product and working browser tool. |
| mobile-qa (self-built) | Describes what to check but doesn't run any actual checks. It's a checklist, not a tool. |

**Verdict:** 5 critical self-built skills are **checklists pretending to be capabilities**. They describe what SHOULD happen but don't make it happen.

### E. Capability That Doesn't Exist At All (Only a Name)

| "Capability" | Reality |
|-------------|---------|
| "AI 审美能力" | No skill teaches Claude real aesthetic judgment. frontend-design says "be bold" but doesn't show what bold looks like. |
| "产品巧思" | No skill provides product innovation frameworks. 破局官's prompt says "砍需求" but doesn't teach business model thinking. |
| "壁垒表达" | No skill teaches competitive differentiation. customer-voice-synthesis can collect feedback but can't synthesize a moat. |
| "内容智能" | No skill teaches content strategy beyond "write conversion-focused copy". |
| "视觉节奏" | No skill teaches scroll rhythm, information pacing, or storytelling through layout. |
| "Reference learning" | reference-extraction says "extract patterns" but can't actually browse/analyze websites without firecrawl or agent-browser integration. |

## Summary Statistics

| Category | Count | % of Total |
|----------|-------|-----------|
| A. Strong + would work if triggered | 7 | 5% |
| B. Has routing + but only suggestions | 7 | 5% |
| C. Will never auto-trigger | 8 | 6% |
| D. Insufficient quality | 5 | 4% |
| E. Doesn't actually exist | 6 | — |
| F. Functional operational skills | ~30 | 23% |
| G. Narrow-purpose application skills | ~50 | 39% |
| H. gstack (external, separate system) | 21 | 16% |
| **Total SKILL.md files** | **129** | |

**Honest assessment: ~7 skills (5%) are genuinely production-grade. ~30 operational skills work for orchestration. ~90 skills are passive reference material that may or may not be loaded into context.**
