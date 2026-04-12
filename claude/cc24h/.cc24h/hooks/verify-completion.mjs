#!/usr/bin/env node
/**
 * cc24h Stop Hook — Auto-verify completion
 *
 * Runs after a Claude session finishes responding.
 * Outputs JSON summary of what changed.
 * Always exit 0 (informational, not blocking).
 */

import { spawnSync } from 'child_process';

function runGit(args) {
  const result = spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    windowsHide: true,
  });
  return result.status === 0 ? (result.stdout || '').trim() : '';
}

function isGitRepo() {
  const result = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    windowsHide: true,
  });
  return result.status === 0 && (result.stdout || '').trim() === 'true';
}

function main() {
  const summary = { files_changed: [], has_changes: false, timestamp: new Date().toISOString() };

  if (isGitRepo()) {
    const diff = runGit(['diff', '--name-only', 'HEAD']);
    const staged = runGit(['diff', '--cached', '--name-only']);
    const untracked = runGit(['ls-files', '--others', '--exclude-standard']);

    const allFiles = [...new Set([
      ...diff.split(/\r?\n/).filter(Boolean),
      ...staged.split(/\r?\n/).filter(Boolean),
      ...untracked.split(/\r?\n/).filter(Boolean),
    ])];

    summary.files_changed = allFiles;
    summary.has_changes = allFiles.length > 0;
  }

  // Output to stdout — Claude Code will see this as hook output
  console.log(JSON.stringify(summary));
}

main();
