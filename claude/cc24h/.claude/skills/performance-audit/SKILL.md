---
name: performance-audit
description: "Performance check: bundle size, Core Web Vitals, image optimization, lazy loading, font strategy, Lighthouse targets."
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
argument-hint: "<URL or build output directory to audit>"
---

# Performance Audit

Check performance against production standards.

## Trigger Phrases
- "性能检查"
- "加载速度"
- "performance"
- "bundle 太大"
- "Core Web Vitals"
- "Lighthouse"
- "首屏速度"

## Default Participants
- 铁律官 (lead): architecture and optimization decisions
- 快刀官: implementation

## Phase 1: Runtime Performance (via browser)

```bash
B=".claude/skills/gstack/browse/dist/browse.exe"
$B goto <URL>

# Page load timing
$B perf

# Check for JS errors
$B console --errors

# Check network requests
$B network

# Core Web Vitals proxy checks
$B js "(() => {
  const entries = performance.getEntriesByType('navigation')[0];
  const lcp = performance.getEntriesByType('largest-contentful-paint');
  const cls = performance.getEntriesByType('layout-shift');
  return JSON.stringify({
    domContentLoaded: Math.round(entries?.domContentLoadedEventEnd || 0),
    load: Math.round(entries?.loadEventEnd || 0),
    transferSize: Math.round(entries?.transferSize / 1024 || 0) + 'KB',
    lcpEntries: lcp.length,
    clsEntries: cls.length
  });
})()"

# Resource sizes
$B js "(() => {
  const resources = performance.getEntriesByType('resource');
  const byType = {};
  resources.forEach(r => {
    const ext = r.name.split('.').pop().split('?')[0].substring(0,4);
    if (!byType[ext]) byType[ext] = {count: 0, size: 0};
    byType[ext].count++;
    byType[ext].size += r.transferSize || 0;
  });
  Object.keys(byType).forEach(k => byType[k].size = Math.round(byType[k].size/1024) + 'KB');
  return JSON.stringify(byType);
})()"
```

## Phase 2: Build Output Analysis

If build directory available:
```bash
# Check total JS bundle size
find <BUILD_DIR> -name "*.js" -exec wc -c {} + | tail -1

# Check for unoptimized images
find <BUILD_DIR> -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | while read f; do
  size=$(wc -c < "$f")
  if [ $size -gt 200000 ]; then echo "LARGE: $f ($size bytes)"; fi
done

# Check for modern image formats
find <BUILD_DIR> -name "*.webp" -o -name "*.avif" | wc -l

# Check for source maps in production
find <BUILD_DIR> -name "*.map" | wc -l
```

## Phase 3: Code Analysis

```bash
# Check for lazy loading
grep -r "lazy\|dynamic\|Suspense\|import(" --include="*.{ts,tsx,js,jsx}" -l

# Check for font loading strategy
grep -r "font-display\|preload.*font\|@font-face" --include="*.{css,scss,ts,tsx}" -l

# Check for image optimization
grep -r "next/image\|loading=\"lazy\"\|srcset\|<picture" --include="*.{ts,tsx,jsx,html}" -l

# Check for render-blocking resources
grep -r "blocking\|async\|defer" --include="*.html" -l
```

## Checklist

### Core Web Vitals Targets
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] INP (Interaction to Next Paint) < 200ms

### Bundle
- [ ] Total JS < 200KB gzipped (landing pages)
- [ ] Total JS < 500KB gzipped (web apps)
- [ ] No single chunk > 100KB gzipped
- [ ] Code splitting implemented for routes
- [ ] Tree shaking configured

### Images
- [ ] Modern formats used (WebP/AVIF preferred)
- [ ] No image > 200KB without justification
- [ ] Responsive sizes (srcset) for key images
- [ ] Below-fold images lazy loaded
- [ ] Hero/above-fold images preloaded

### Fonts
- [ ] font-display: swap on all @font-face
- [ ] Critical fonts preloaded
- [ ] Maximum 2-3 font families loaded
- [ ] Variable fonts used where possible

### Architecture
- [ ] No render-blocking resources in critical path
- [ ] Critical CSS inlined or preloaded
- [ ] Third-party scripts deferred or async
- [ ] No source maps in production build
- [ ] Compression enabled (gzip/brotli)

## Verdict

**PASS**: All Core Web Vitals targets met, no oversized resources.
**CONDITIONAL**: CWV targets met, minor optimization opportunities remain.
**FAIL**: Any CWV target missed, or total JS > 2x limit.

## Risk Guardrails
- L1: read-only audit, reports only
- Does NOT auto-optimize (generates fix tasks)

## Handoff
- Feeds into: production-readiness-audit
- Failures become optimization tasks in build-feature
