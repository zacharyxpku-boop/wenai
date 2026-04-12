---
name: page-copy-review
description: Audit pages for UX clarity, conversion, accessibility, and copy quality. Use for landing pages and marketing content.
user-invocable: true
allowed-tools: Read, Glob, Grep
---

# Page & Copy Audit

Review user-facing pages for conversion and quality.

## Checklist

### CTA (Call to Action)
- [ ] Primary CTA is immediately visible
- [ ] CTA text is action-oriented (not "Submit" or "Click here")
- [ ] One clear primary CTA per section
- [ ] CTA contrast stands out from background

### Copy Quality
- [ ] Headline communicates value in <8 words
- [ ] Subheadline explains how in one sentence
- [ ] Benefits over features
- [ ] No jargon for target audience
- [ ] Social proof present (testimonials, numbers, logos)

### Mobile & Accessibility
- [ ] Text readable without zooming
- [ ] Touch targets >=44px
- [ ] Alt text on images
- [ ] Color contrast ratio >=4.5:1
- [ ] Content works without images loaded

### SEO Basics
- [ ] Page title <60 chars, includes keyword
- [ ] Meta description <160 chars
- [ ] H1 present and meaningful
- [ ] Images have descriptive filenames

## Output

```
## Page Audit: <page>

Score: X/10

### Must Fix
- ...

### Should Improve
- ...

### Good
- ...
```
