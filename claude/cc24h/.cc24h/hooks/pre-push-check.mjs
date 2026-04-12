#!/usr/bin/env node
/**
 * cc24h PreToolUse Hook — Production Readiness Gate
 *
 * Fires BEFORE Bash commands that push/deploy/publish.
 * Blocks if no recent production-readiness-audit found.
 * Exit 0 = allow, Exit 2 = block.
 */

import { existsSync, statSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const DANGEROUS_COMMANDS = [
  /\bgit\s+push\b/,
  /\bnpm\s+publish\b/,
  /\bdeploy\b/,
  /\bvercel\b(?!.*(?:--help|help|list|ls|whoami))/,
  /\bnpx\s+wrangler\s+(?:deploy|publish)\b/,
  /\brailway\s+(?:up|deploy)\b/,
  /\bfly\s+deploy\b/,
];

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function hasRecentAudit() {
  const auditDirs = [
    join(process.cwd(), '.cc24h', 'audits'),
    join(process.cwd(), 'docs'),
  ];

  for (const dir of auditDirs) {
    if (!existsSync(dir)) continue;
    try {
      const files = readdirSync(dir);
      for (const f of files) {
        if (f.includes('production-readiness') || f.includes('launch-readiness')) {
          const fp = join(dir, f);
          const stat = statSync(fp);
          if (Date.now() - stat.mtimeMs < TWENTY_FOUR_HOURS) return true;
        }
      }
    } catch {}
  }
  return false;
}

function hasPassingTests() {
  // Check for recent test results
  const markers = [
    join(process.cwd(), '.cc24h', 'last-test-result.json'),
    join(process.cwd(), 'test-results.json'),
  ];
  for (const m of markers) {
    if (existsSync(m)) {
      try {
        const data = JSON.parse(readFileSync(m, 'utf-8'));
        if (data.pass || data.success || data.status === 'pass') return true;
      } catch {}
    }
  }
  return false;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const command = data?.tool_input?.command || '';
  if (!command) process.exit(0);

  // Only check dangerous commands
  const isDangerous = DANGEROUS_COMMANDS.some(p => p.test(command));
  if (!isDangerous) process.exit(0);

  const blockers = [];

  if (!hasRecentAudit()) {
    blockers.push('No production-readiness-audit in last 24h. Run /production-readiness-audit first.');
  }

  if (blockers.length > 0) {
    const msg = [
      `\n⛔ PRE-PUSH GATE BLOCKED:`,
      ...blockers.map(b => `  - ${b}`),
      '',
      'Deploy/push requires a passing production-readiness-audit.',
      'Run: /production-readiness-audit',
    ].join('\n');
    process.stderr.write(msg);
    process.exit(2);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
