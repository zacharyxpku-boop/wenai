#!/usr/bin/env node
/**
 * cc24h PostCompact Hook — Re-inject commander context
 *
 * After Claude auto-compacts, this injects critical task context back.
 * Reads .cc24h/commander/context-inject.md and outputs to stdout.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ctxFile = join(process.cwd(), '.cc24h', 'commander', 'context-inject.md');

if (existsSync(ctxFile)) {
  const content = readFileSync(ctxFile, 'utf-8');
  // Output as hookSpecificOutput with additionalContext
  console.log(JSON.stringify({
    hookSpecificOutput: {
      additionalContext: content,
    },
  }));
} else {
  // No context file — that's fine
  process.exit(0);
}
