#!/usr/bin/env node
/**
 * cc24h PreToolUse Hook — Risk Policy Enforcement
 *
 * Reads tool_input from stdin (JSON), checks file_path against risk policy.
 * Exit 0 = allow, Exit 2 + stderr = block.
 *
 * Triggered by: Edit, Write tools
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';

const HIGH_RISK_PATTERNS = [
  /[\/\\]auth[\/\\]/i,
  /[\/\\]payment[\/\\]/i,
  /[\/\\]migration[s]?[\/\\]/i,
  /[\/\\]secret[s]?[\/\\]/i,
  /[\/\\]\.env/i,
  /[\/\\]deploy[\/\\]/i,
  /credentials/i,
  /[\/\\]ci[\/\\-]?cd[\/\\]/i,
];

const ALWAYS_ALLOWED = [
  /[\/\\]tests?[\/\\]/i,
  /[\/\\]docs?[\/\\]/i,
  /[\/\\]\.cc24h[\/\\]/i,
  /\.md$/i,
  /\.yaml$/i,
  /\.yml$/i,
];

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); } catch { process.exit(0); }

  const filePath = data?.tool_input?.file_path || data?.tool_input?.path || '';
  if (!filePath) process.exit(0);

  // Always allow safe paths
  if (ALWAYS_ALLOWED.some(p => p.test(filePath))) process.exit(0);

  // Block high-risk paths
  for (const pattern of HIGH_RISK_PATTERNS) {
    if (pattern.test(filePath)) {
      process.stderr.write(`BLOCKED by cc24h risk policy: ${filePath} matches high-risk zone (${pattern.source}). Use manual review for auth/payment/migration/secrets changes.`);
      process.exit(2);
    }
  }

  // Load custom policy if available
  const policyPath = join(process.cwd(), '.cc24h', 'risk-policy.yaml');
  if (existsSync(policyPath)) {
    try {
      const yaml = await import('js-yaml');
      const policy = yaml.default.load(readFileSync(policyPath, 'utf-8'));
      for (const rule of (policy.directory_rules || [])) {
        const pat = rule.pattern.replace('/**', '').replace('/*', '');
        if (filePath.includes(pat) && rule.max_risk === 'L1') {
          process.stderr.write(`BLOCKED by project risk policy: ${filePath} restricted to L1 (read-only) for ${rule.reason}`);
          process.exit(2);
        }
      }
    } catch {}
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
