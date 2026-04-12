# Routing Failures: Why Skills Don't Fire When They Should

**Date:** 2026-03-20

## The 4 Failure Modes

### Mode 1: Installed But Never Triggered

**Mechanism:** Claude Code loads skill descriptions at session start (~100 tokens each). It decides "is this relevant?" based on the description field. If the current task doesn't match the description, the skill is ignored.

**Affected Skills:**
| Skill | Description Says | Task Context | Why Not Triggered |
|-------|-----------------|--------------|-------------------|
| baseline-ui | "Enforces opinionated UI baseline to prevent AI-generated interface slop" | "Build a login page" | Claude doesn't think "login page" = "preventing slop" |
| fixing-motion-performance | "Fix animation performance issues" | "Build hero section" | No animation exists yet to fix |
| vercel-composition-patterns | "React composition patterns that scale" | "Build card component" | Claude doesn't see "card" as "composition pattern" |
| cross-session-learning | "Persist patterns across sessions" | "Task completed" | No trigger condition at task completion |
| accessibility | "Comprehensive axe-core + jsx-a11y audit" | "Build form component" | Claude builds first, doesn't audit |

**Root cause:** Skill descriptions are too passive ("use when...") instead of aggressive ("ALWAYS apply when ANY UI code is written").

### Mode 2: Triggered But Routing Is Wrong

**Mechanism:** Commander's routing-policy.md uses keyword detection. If user says "做个页面", it routes to build-feature with 快刀官. The design-system-bootstrap gate SHOULD fire, but only if no design-system.md exists.

**Failure scenarios:**
| User Says | Expected Route | Actual Route | Why Wrong |
|-----------|---------------|--------------|-----------|
| "做个好看的页面" | design-system-bootstrap → frontend-design → build-feature | build-feature directly | "做" triggers build, "好看" not a routing keyword |
| "优化一下UI" | screenshot-loop → baseline-ui | refactor-safely | "优化" triggers refactor, not screenshot |
| "检查一下能不能上线" | production-readiness-audit | review-and-recover | "检查" triggers review, not audit |
| "这个chatbot还不够好" | chatbot-hardening | bug-triage-hotfix | "不够好" matches "not working" pattern |

**Root cause:** Keyword detection is regex-based, not semantic. Chinese is especially ambiguous — same words have different intents in different contexts.

### Mode 3: Used But Only As Suggestion

**Mechanism:** Most skills are "reference when relevant" — Claude reads the SKILL.md and tries to follow the advice. But there's no verification that it actually did.

**The suggestion → enforcement gap:**

| What SKILL.md Says | Enforcement Level | What Actually Happens |
|---|---|---|
| "NEVER use Inter, Roboto, Arial" (oiloil) | Suggestion | Claude uses Inter anyway because it's the first font that comes to mind |
| "NEVER use purple gradients" (baseline-ui) | Suggestion | Claude generates gradient because task said "modern design" |
| "Must run screenshot-loop after UI changes" (routing-policy) | Prompt injection | Claude skips it to ship faster |
| "Must run /fixing-accessibility" (routing-policy) | Prompt injection | Claude says "accessibility looks good" without actually auditing |
| "React: eliminate waterfalls first" (vercel) | Suggestion | Claude writes useEffect waterfall because it's the obvious pattern |

**Root cause:** No hooks. No PostToolUse checks. No automated verification. Everything relies on Claude's self-discipline, which degrades under task pressure.

### Mode 4: Skill Itself Is Weak

**Mechanism:** Some skills are well-intentioned but don't contain enough substance to change Claude's behavior.

| Skill | What It Claims | What It Actually Provides | Gap |
|-------|---------------|--------------------------|-----|
| design-system-bootstrap | "Create production-grade design system" | 4 phases of questions + token generation | No visual references, no examples of great design systems, no competitive analysis |
| reference-extraction | "Extract design patterns from reference sites" | Instructions to "browse and analyze" | No working browser integration, no screenshot analysis capability |
| screenshot-loop | "3-viewport screenshot → analyze → fix" | Instructions for using gstack browse | gstack browse binary may not be built, fallback chain untested |
| user-reality-test | "8 personas test the product" | Persona descriptions + friction log template | No actual browser automation, no click-through execution, no real data |
| mobile-qa | "Touch target, viewport, font QA" | Checklist of what to check | No automated checking, no viewport simulation wired in |

**Root cause:** These skills are SPECIFICATIONS (what should happen), not IMPLEMENTATIONS (code that makes it happen).

## The Fix Framework

### What Can Be Fixed With Better Descriptions
- Make skill descriptions more aggressive: "ALWAYS apply when" instead of "Use when"
- Add negative triggers: "If this skill was NOT used on a UI task, that's a bug"

### What Can Be Fixed With Hooks
```json
// .claude/hooks.json (does not exist yet)
{
  "PostToolUse": [
    {
      "tool": "Write",
      "pattern": "*.tsx|*.jsx|*.css|*.html",
      "command": "check-anti-ai-rules.sh $FILE"
    }
  ],
  "PreToolUse": [
    {
      "tool": "Bash",
      "pattern": "git push|npm publish|deploy",
      "command": "check-production-readiness.sh"
    }
  ]
}
```

### What Can Be Fixed With Better Prompt Injection
- `_genPrompt()` already injects quality pipeline for UI tasks — make it more specific
- Add concrete file paths: "Read .claude/skills/oiloil-ui-ux-guide/SKILL.md#anti-ai-defaults BEFORE writing any CSS"
- Add verification steps: "After writing CSS, grep for 'Inter|Roboto|purple|gradient' and fix"

### What CANNOT Be Fixed With Skills Alone
- Real aesthetic judgment (requires seeing output)
- Product innovation (requires domain expertise)
- Market insight (requires real data, not research prompts)
- User empathy (requires real user testing)
- Competitive moat design (requires strategic thinking)

These require either:
1. Human-in-the-loop at key decisions
2. Real browser verification (agent-browser/gstack working)
3. Real market data (firecrawl + external APIs working)
4. Real user feedback (not persona simulation)
