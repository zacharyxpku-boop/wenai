#!/usr/bin/env node
/**
 * cc24h PostToolUse Hook — UI Quality Enforcement
 *
 * Fires AFTER Edit/Write on CSS/TSX/JSX/HTML files.
 * Checks for Anti-AI defaults and design system violations.
 * Exit 0 = pass (with warnings in stderr), Exit 2 = block (must fix).
 *
 * This converts 15+ "suggestion-only" skills into HARD constraints.
 */

import { readFileSync, existsSync } from 'fs';
import { extname, basename, resolve, join } from 'path';

// ── Anti-AI Rules (from oiloil-ui-ux-guide + baseline-ui + frontend-design) ──

const ANTI_AI_FONT_PATTERNS = [
  { pattern: /font-family[:\s]*['"]?Inter\b/gi, rule: 'NEVER use Inter — it screams "AI generated"', source: 'oiloil-ui-ux-guide' },
  { pattern: /font-family[:\s]*['"]?Roboto\b/gi, rule: 'NEVER use Roboto — generic AI default', source: 'oiloil-ui-ux-guide' },
  { pattern: /font-family[:\s]*['"]?Arial\b/gi, rule: 'NEVER use Arial — lazy AI fallback', source: 'oiloil-ui-ux-guide' },
  { pattern: /font-family[:\s]*['"]?Open Sans\b/gi, rule: 'NEVER use Open Sans — overused AI default', source: 'oiloil-ui-ux-guide' },
  { pattern: /font-family[:\s]*['"]?Poppins\b/gi, rule: 'NEVER use Poppins — AI-generic font', source: 'oiloil-ui-ux-guide' },
  { pattern: /fontFamily[:\s]*['"]?Inter\b/gi, rule: 'NEVER use Inter — AI default font', source: 'oiloil-ui-ux-guide' },
  { pattern: /fontFamily[:\s]*['"]?Roboto\b/gi, rule: 'NEVER use Roboto', source: 'oiloil-ui-ux-guide' },
];

const ANTI_AI_COLOR_PATTERNS = [
  { pattern: /from-purple-\d+\s+to-blue-\d+/gi, rule: 'NEVER use purple-to-blue gradient — #1 AI tell', source: 'baseline-ui' },
  { pattern: /from-blue-\d+\s+to-purple-\d+/gi, rule: 'NEVER use blue-to-purple gradient', source: 'baseline-ui' },
  { pattern: /from-indigo-\d+\s+to-purple-\d+/gi, rule: 'NEVER use indigo-to-purple gradient', source: 'baseline-ui' },
  { pattern: /from-violet-\d+\s+to-fuchsia-\d+/gi, rule: 'NEVER use violet-to-fuchsia gradient', source: 'baseline-ui' },
  { pattern: /bg-gradient-to-[rbl]\s+from-(purple|violet|indigo)-/gi, rule: 'Gradient with purple/violet/indigo is AI-generic — use design system colors', source: 'baseline-ui' },
  { pattern: /linear-gradient\([^)]*(?:purple|#[89a-f]{2}[0-5]{2}[f]{2}|#6[0-9a-f]{5})/gi, rule: 'Purple gradient detected — classic AI tell', source: 'baseline-ui' },
];

const ANTI_AI_LAYOUT_PATTERNS = [
  { pattern: /className=["'][^"']*rounded-2xl[^"']*shadow-2xl/gi, rule: 'rounded-2xl + shadow-2xl combo is AI-generic — use subtler values', source: 'baseline-ui' },
  { pattern: /className=["'][^"']*rounded-3xl[^"']*shadow/gi, rule: 'rounded-3xl with shadow is over-styled — AI default pattern', source: 'baseline-ui' },
];

const ANTI_AI_CONTENT_PATTERNS = [
  { pattern: />\s*Powered by AI\s*</gi, rule: '"Powered by AI" is the most generic copy possible — be specific about value', source: 'frontend-design' },
  { pattern: />\s*Get insights\s*</gi, rule: '"Get insights" says nothing — what specific outcome?', source: 'frontend-design' },
  { pattern: />\s*Save time\s*</gi, rule: '"Save time" is generic — quantify or be specific', source: 'frontend-design' },
  { pattern: />\s*Unlock the power\s*/gi, rule: '"Unlock the power" is AI marketing cliché', source: 'frontend-design' },
  { pattern: />\s*Transform your\s*/gi, rule: '"Transform your X" is overused AI copy — be specific', source: 'frontend-design' },
];

// ── React Anti-Patterns (from vercel-react-best-practices) ──

const REACT_ANTIPATTERNS = [
  { pattern: /useEffect\(\s*\(\)\s*=>\s*\{[^}]*fetch\(/gm, rule: 'useEffect + fetch = data waterfall. Use React Server Components, useSWR, or React Query', source: 'vercel-react-best-practices' },
  { pattern: /useEffect\(\s*\(\)\s*=>\s*\{[^}]*setState/gm, rule: 'useEffect + setState on mount = potential waterfall. Consider server-side data or derived state', source: 'vercel-react-best-practices' },
  { pattern: /typeof window\s*!==?\s*['"]undefined['"]/g, rule: 'typeof window check often masks hydration issues — use proper SSR patterns', source: 'vercel-react-best-practices' },
];

// ── Main Logic ──

const UI_EXTENSIONS = new Set(['.css', '.scss', '.less', '.tsx', '.jsx', '.html', '.vue', '.svelte']);
const REACT_EXTENSIONS = new Set(['.tsx', '.jsx']);

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const filePath = data?.tool_input?.file_path || data?.tool_input?.path || '';
  if (!filePath) process.exit(0);

  const ext = extname(filePath).toLowerCase();
  const name = basename(filePath).toLowerCase();

  // Only check UI files
  if (!UI_EXTENSIONS.has(ext)) process.exit(0);

  // Skip test files and config files
  if (name.includes('.test.') || name.includes('.spec.') || name.includes('.config.')) process.exit(0);
  if (filePath.includes('/tests/') || filePath.includes('\\tests\\') ||
      filePath.includes('/__tests__/') || filePath.includes('\\__tests__\\')) process.exit(0);

  // Read the file content
  let content;
  try {
    const absPath = resolve(filePath);
    if (!existsSync(absPath)) process.exit(0);
    content = readFileSync(absPath, 'utf-8');
  } catch {
    process.exit(0);
  }

  const violations = [];
  const warnings = [];

  // ── Check Anti-AI fonts ──
  for (const rule of ANTI_AI_FONT_PATTERNS) {
    if (rule.pattern.test(content)) {
      violations.push(`[ANTI-AI FONT] ${rule.rule} (${rule.source})`);
    }
    rule.pattern.lastIndex = 0; // Reset regex
  }

  // ── Check Anti-AI colors/gradients ──
  for (const rule of ANTI_AI_COLOR_PATTERNS) {
    if (rule.pattern.test(content)) {
      violations.push(`[ANTI-AI COLOR] ${rule.rule} (${rule.source})`);
    }
    rule.pattern.lastIndex = 0;
  }

  // ── Check Anti-AI layout ──
  for (const rule of ANTI_AI_LAYOUT_PATTERNS) {
    if (rule.pattern.test(content)) {
      warnings.push(`[ANTI-AI LAYOUT] ${rule.rule} (${rule.source})`);
    }
    rule.pattern.lastIndex = 0;
  }

  // ── Check Anti-AI content ──
  for (const rule of ANTI_AI_CONTENT_PATTERNS) {
    if (rule.pattern.test(content)) {
      warnings.push(`[ANTI-AI COPY] ${rule.rule} (${rule.source})`);
    }
    rule.pattern.lastIndex = 0;
  }

  // ── Check React anti-patterns ──
  if (REACT_EXTENSIONS.has(ext)) {
    for (const rule of REACT_ANTIPATTERNS) {
      if (rule.pattern.test(content)) {
        warnings.push(`[REACT] ${rule.rule} (${rule.source})`);
      }
      rule.pattern.lastIndex = 0;
    }
  }

  // ── Check design system compliance ──
  const dsPath = join(process.cwd(), 'design-system.md');
  if (existsSync(dsPath) && (ext === '.css' || ext === '.tsx' || ext === '.jsx')) {
    try {
      const ds = readFileSync(dsPath, 'utf-8');
      // Extract primary color from design system if defined
      const colorMatch = ds.match(/primary[:\s]+([#\w]+)/i);
      if (colorMatch) {
        // If design system defines colors but file uses hardcoded off-system colors
        const hardcodedHex = content.match(/#[0-9a-f]{6}/gi) || [];
        if (hardcodedHex.length > 5) {
          warnings.push(`[DESIGN SYSTEM] ${hardcodedHex.length} hardcoded hex colors found. Use design system tokens instead.`);
        }
      }
    } catch {}
  }

  // ── Output ──
  if (violations.length > 0) {
    const msg = [
      `\n⛔ UI QUALITY CHECK FAILED — ${violations.length} Anti-AI violation(s) in ${basename(filePath)}:`,
      ...violations.map((v, i) => `  ${i + 1}. ${v}`),
      '',
      'FIX REQUIRED: Replace AI-default fonts, colors, and gradients with design-system-specific values.',
      'Read .claude/skills/oiloil-ui-ux-guide/SKILL.md#anti-ai-defaults for alternatives.',
      ...(warnings.length > 0 ? ['', `⚠️  Also ${warnings.length} warning(s):`, ...warnings.map(w => `  - ${w}`)] : []),
    ].join('\n');
    process.stderr.write(msg);
    process.exit(2); // BLOCK — must fix
  }

  if (warnings.length > 0) {
    const msg = [
      `\n⚠️  UI quality warnings for ${basename(filePath)}:`,
      ...warnings.map(w => `  - ${w}`),
      '',
      'Consider fixing these before shipping.',
    ].join('\n');
    process.stderr.write(msg);
    // Warnings don't block — exit 0
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
