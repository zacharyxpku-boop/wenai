---
name: accessibility-audit
description: "WCAG 2.1 AA compliance audit: contrast, keyboard nav, ARIA, semantics, focus management, screen reader compatibility."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<URL or file path to audit>"
---

# Accessibility Audit

Systematic WCAG 2.1 AA compliance verification.

## Trigger Phrases
- "无障碍检查"
- "可访问性"
- "accessibility"
- "WCAG"
- "对比度"
- "键盘导航"
- "屏幕阅读器"

## Default Participants
- 尺子官 (lead): standards verification
- 快刀官: fixes

## Phase 1: Automated Checks

### Contrast Ratios
```bash
B=".claude/skills/gstack/browse/dist/browse.exe"
$B goto <URL>

# Check text contrast
$B js "(() => {
  const els = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label, li');
  const issues = [];
  els.forEach(el => {
    const style = getComputedStyle(el);
    const color = style.color;
    const bg = style.backgroundColor;
    if (color && bg && bg !== 'rgba(0, 0, 0, 0)') {
      issues.push({tag: el.tagName, text: el.textContent.substring(0,30), color, bg});
    }
  });
  return JSON.stringify(issues.slice(0,20));
})()"
```

### Alt Text
```bash
$B js "(() => {
  const imgs = document.querySelectorAll('img');
  const missing = [];
  imgs.forEach(img => {
    if (!img.alt && !img.getAttribute('role')?.includes('presentation')) {
      missing.push({src: img.src.substring(0,60)});
    }
  });
  return JSON.stringify({total: imgs.length, missing_alt: missing.length, details: missing.slice(0,10)});
})()"
```

### Heading Hierarchy
```bash
$B js "(() => {
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
  return JSON.stringify(headings.map(h => ({level: h.tagName, text: h.textContent.substring(0,50)})));
})()"
```

Verify: h1 > h2 > h3, no level skipping, exactly one h1 per page.

### ARIA Landmarks
```bash
$B js "(() => {
  const landmarks = {
    header: document.querySelectorAll('header, [role=banner]').length,
    nav: document.querySelectorAll('nav, [role=navigation]').length,
    main: document.querySelectorAll('main, [role=main]').length,
    footer: document.querySelectorAll('footer, [role=contentinfo]').length
  };
  return JSON.stringify(landmarks);
})()"
```

Verify: at least header, nav, main, footer present.

### Form Labels
```bash
$B js "(() => {
  const inputs = document.querySelectorAll('input:not([type=hidden]):not([type=submit]), textarea, select');
  const issues = [];
  inputs.forEach(input => {
    const id = input.id;
    const label = id ? document.querySelector('label[for=\"'+id+'\"]') : null;
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push({type: input.type, name: input.name, id: input.id});
    }
  });
  return JSON.stringify({total: inputs.length, unlabeled: issues.length, details: issues});
})()"
```

### Focus Indicator
```bash
$B js "(() => {
  const style = document.createElement('style');
  style.textContent = ':focus { outline-debug: 1; }';
  document.head.appendChild(style);
  const focusable = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
  return 'Focusable elements: ' + focusable.length;
})()"
```

## Phase 2: Manual Checks

### Keyboard Navigation
```bash
# Tab through the page
$B press Tab
$B snapshot -i  # Check focus location
# Repeat for all interactive elements
# Verify: logical tab order, no focus traps, all actions keyboard-accessible
```

### Skip Link
```bash
$B js "(() => {
  const first = document.querySelector('a[href^=\"#\"]');
  return first ? {text: first.textContent, href: first.href} : 'NO SKIP LINK';
})()"
```

### Reduced Motion
```bash
# Check if prefers-reduced-motion is respected
$B js "(() => {
  const animations = document.getAnimations();
  return 'Active animations: ' + animations.length;
})()"
```

## Checklist

- [ ] All images have descriptive alt text (or role="presentation")
- [ ] Color contrast >= 4.5:1 for normal text
- [ ] Color contrast >= 3:1 for large text (18px+)
- [ ] All interactive elements keyboard accessible
- [ ] Tab order follows visual flow
- [ ] Focus indicator visible on all focusable elements
- [ ] Form inputs have visible labels
- [ ] Heading hierarchy correct (no skipping levels)
- [ ] One h1 per page
- [ ] ARIA landmarks present (header, nav, main, footer)
- [ ] Skip navigation link present
- [ ] Color is never sole indicator of meaning
- [ ] prefers-reduced-motion respected

## Verdict

**PASS**: All items checked.
**CONDITIONAL**: Minor items unchecked (e.g., some decorative images missing presentation role).
**FAIL**: Any contrast failure, missing keyboard access, or missing landmarks.

## Risk Guardrails
- L1: read-only audit
- Does NOT auto-fix (reports only)
- Failures generate fix tasks for build-feature

## Handoff
- Feeds into: production-readiness-audit
- Failures become tasks in build-feature workflow
