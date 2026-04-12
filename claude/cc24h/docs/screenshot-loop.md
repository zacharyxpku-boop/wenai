# Screenshot Loop

Version: 1.0
Purpose: Visual feedback loop — screenshot, analyze, fix, verify

## Why This Exists

Claude Code cannot see what it builds. Code review catches logic bugs but misses:
- Layout misalignment
- Spacing inconsistency
- Color/contrast issues
- Mobile viewport breakage
- Design system drift
- Visual hierarchy failures
- Animation timing problems

The screenshot loop closes this gap by making the system's visual output visible to itself.

## How It Works

```
Build UI change
      |
      v
  Screenshot (3 viewports: mobile 375px, tablet 768px, desktop 1280px)
      |
      v
  Analyze against:
    - design-system.md (token compliance)
    - Visual hierarchy (is the important thing prominent?)
    - Spacing rhythm (consistent gaps?)
    - Typography (readable? hierarchy clear?)
    - Color contrast (WCAG AA?)
    - Mobile usability (touch targets? readable?)
    - Animation (smooth? purposeful?)
      |
      v
  Issues found?
    YES → Fix → Re-screenshot → Re-analyze (max 3 iterations)
    NO  → PASS → Continue
```

## Trigger Conditions

Screenshot loop MUST run when:
- Any UI component is created or modified
- Any CSS/styling change is made
- Any layout change is made
- Any responsive behavior is changed
- Before submitting any UI-related task

Screenshot loop MAY be skipped when:
- Backend-only changes
- Configuration changes
- Documentation changes
- Test-only changes

## Implementation

### Using gstack browse

```bash
# Set up browse binary path
B=".claude/skills/gstack/browse/dist/browse"

# 1. Start dev server (project-specific)
# Read project's CLAUDE.md for the correct dev command

# 2. Take responsive screenshots
$B goto http://localhost:3000/page-under-test
$B responsive /tmp/screenshot-loop

# 3. Take annotated interactive snapshot
$B snapshot -i -a -o /tmp/screenshot-annotated.png

# 4. Check console for errors
$B console --errors

# 5. Verify specific elements
$B is visible ".hero-section"
$B is visible ".cta-button"
$B css ".cta-button" "min-height"  # >= 44px for touch
```

### Analysis Checklist

For each screenshot, check:

#### Desktop (1280px)
- [ ] Content width within max-width constraint
- [ ] Navigation fully visible
- [ ] Hero section communicates value in 3 seconds
- [ ] CTA is prominent and above the fold
- [ ] Visual hierarchy: h1 > h2 > h3 > body clear
- [ ] Spacing follows design system scale
- [ ] No horizontal overflow

#### Tablet (768px)
- [ ] Layout adapts (no cramped desktop layout)
- [ ] Navigation collapses or adapts
- [ ] Images resize appropriately
- [ ] Touch targets >= 44px

#### Mobile (375px)
- [ ] Single column layout (or appropriate mobile layout)
- [ ] Text readable without zooming (>= 16px body)
- [ ] CTA reachable with thumb
- [ ] No horizontal scroll
- [ ] Navigation accessible (hamburger/drawer)
- [ ] Images don't push content off-screen
- [ ] Form inputs at least 44px height

#### Cross-Viewport
- [ ] Colors match design system
- [ ] Typography matches design system
- [ ] Consistent component styling across viewports
- [ ] No console errors
- [ ] No broken images or missing assets

## Iteration Protocol

If issues found:
1. List all issues with severity (Critical / Major / Minor)
2. Fix Critical issues first
3. Re-screenshot after fixes
4. Verify fixes didn't introduce new issues
5. Maximum 3 fix-verify iterations per submit
6. If still failing after 3 iterations: BLOCK and escalate to reviewer

## Integration Points

| Workflow | When | Required? |
|----------|------|-----------|
| build-feature | Before submit (UI tasks only) | Yes |
| launch-and-growth | During production-readiness-audit | Yes |
| design-review | After each design change | Yes |
| user-reality-test | During persona simulation | Recommended |

## Output

Screenshot loop produces:
- `/tmp/screenshot-loop-mobile.png`
- `/tmp/screenshot-loop-tablet.png`
- `/tmp/screenshot-loop-desktop.png`
- `/tmp/screenshot-annotated.png` (with interactive element overlay)
- Screenshot analysis report (inline in session)

## Pass/Fail Criteria

**PASS**: All checklist items verified across 3 viewports, no Critical or Major issues remaining.

**FAIL**: Any Critical issue, or more than 2 Major issues after 3 fix iterations.
