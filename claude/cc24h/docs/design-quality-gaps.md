# Design Quality Gaps: Why Output Still Looks Like AI

**Date:** 2026-03-20

## The Honest Truth

Claude can write code. Claude cannot see. This is the fundamental gap that no amount of SKILL.md files can fix.

## Why Design Still Sucks: 7 Root Causes

### 1. No Visual Feedback Loop Exists In Practice

**The gap:** screenshot-loop is defined as a workflow but has NEVER been executed.
**Why it matters:** Without actually seeing what was built, Claude optimizes for code correctness, not visual quality.
**What happens:** Claude writes `className="bg-gradient-to-r from-purple-500 to-blue-600"` because it's syntactically valid, not because it looks good.
**Fix needed:** A WORKING screenshot → analyze → fix cycle. Not a SKILL.md describing one.

### 2. "Design System" Is a Checklist, Not a System

**The gap:** design-system-bootstrap asks for "3-5 brand adjectives" then generates token values.
**Why it matters:** Real design systems are built by looking at dozens of reference sites, testing combinations, iterating on visual feel.
**What happens:** Claude generates "reasonable" tokens (some blue, some gray, 16px body, 4px spacing unit) that are technically correct but visually generic.
**Fix needed:** Reference-driven design that ACTUALLY crawls and analyzes real sites via firecrawl + agent-browser.

### 3. No Reference Website Integration Works

**The gap:** reference-extraction skill says "extract patterns from reference sites" but has no working browser/scraping integration.
**Why it matters:** Without seeing real, high-quality websites, Claude defaults to its training distribution — which converges to Inter + purple gradient + white background.
**What happens:** Every generated site looks like every other AI-generated site.
**Fix needed:** Wire firecrawl or agent-browser to actually visit reference URLs, extract screenshots, analyze spacing/color/typography patterns.

### 4. Anti-AI Rules Exist But Aren't Enforced

**The gap:** oiloil-ui-ux-guide has an excellent "Anti-AI Defaults" section. baseline-ui has "NEVER use gradients unless requested". But these are SUGGESTIONS in a reference document.
**Why it matters:** When Claude is focused on implementing a feature, it won't spontaneously stop and check against anti-AI rules.
**What happens:** The rules exist in .claude/skills/ but Claude generates the purple gradient anyway because it's in a build-feature workflow, not a design-review workflow.
**Fix needed:** PostToolUse hooks that automatically check edited CSS/TSX files against anti-AI rules.

### 5. Motion/Animation Is Untouched

**The gap:** fixing-motion-performance fixes performance issues in EXISTING animations. But no skill CREATES meaningful animations.
**Why it matters:** 2026 web products use scroll-driven storytelling, micro-interactions, and motion as primary language. Claude generates static pages.
**What happens:** Landing pages feel like PDFs. No scroll effects. No hover states. No entrance animations. No spatial storytelling.
**Fix needed:** A motion-design skill that teaches Claude WHAT to animate and WHEN, not just how to fix jank.

### 6. No "Taste" Skill Exists

**The gap:** frontend-design says "be BOLD" and "make it UNFORGETTABLE". But taste isn't a rule — it's pattern recognition from seeing thousands of great designs.
**Why it matters:** Claude's training data includes more bad websites than good ones. Without explicit "this is what great looks like" references, it regresses to the mean.
**What happens:** Output is technically valid, follows all the rules, and still looks mediocre.
**Fix needed:** This is the hardest gap. Possible approaches:
- Curated reference library (screenshots of great sites + analysis)
- Style-specific skills (editorial, brutalist, luxury, etc.)
- Always pair with agent-browser visual verification

### 7. Mobile Is An Afterthought

**The gap:** mobile-qa skill checks touch targets and viewport after the fact. But responsive design should be mobile-FIRST.
**Why it matters:** 60%+ of web traffic is mobile. Checking mobile after desktop is backwards.
**What happens:** Desktop looks OK. Mobile is broken — text too small, layout doesn't reflow, touch targets too small, horizontal scroll.
**Fix needed:** Enforce mobile-first in the prompt injection. Build mobile layout FIRST, then scale up.

## What "Should" Be Happening vs What Actually Happens

| What Should Happen | What Actually Happens |
|---|---|
| Visit 3 reference sites → extract patterns → build design system | Skip reference. Generate generic tokens. |
| Build mobile layout first → verify → scale to desktop | Build desktop first. Maybe add responsive later. |
| After each component: screenshot → check → fix | Build all components. Submit. No visual check. |
| Anti-AI check on every CSS change | Never check. Purple gradient shipped. |
| Motion design: entrance stagger, scroll trigger, hover states | Zero animation. Static page. |
| User persona walkthrough before submit | Never executed. "Looks good to me" |

## The Uncomfortable Conclusion

The system has the right VOCABULARY (design systems, screenshot loops, anti-AI rules, reference extraction). But none of it EXECUTES. It's like having a gym membership, a personal trainer's phone number, and a nutrition plan — but never going to the gym.
