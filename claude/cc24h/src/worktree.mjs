/**
 * cc24h - Git Worktree Manager
 * Provides parallel isolation via git worktrees.
 */

import { execFileSync, execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

// Sanitize branch/task names: only allow alphanumeric, dash, underscore, dot, slash
function sanitize(name) {
  return name.replace(/[^a-zA-Z0-9\-_./]/g, '_');
}

export class WorktreeManager {
  constructor(projectRoot) {
    this.projectRoot = resolve(projectRoot);
    this.worktreeBase = join(this.projectRoot, '.cc24h', 'worktrees');
    this._isGitRepo = null;
  }

  /** Run git with array args (no shell injection) */
  _git(args, cwd = null) {
    const argsArr = Array.isArray(args) ? args : args.split(/\s+/);
    return execFileSync('git', argsArr, {
      cwd: cwd || this.projectRoot,
      encoding: 'utf-8',
      timeout: 30000,
    }).trim();
  }

  /** Check if project root is a git repo (cached) */
  isGitRepo() {
    if (this._isGitRepo !== null) return this._isGitRepo;
    try {
      this._git(['rev-parse', '--is-inside-work-tree']);
      this._isGitRepo = true;
    } catch {
      this._isGitRepo = false;
    }
    return this._isGitRepo;
  }

  getCurrentBranch() {
    try {
      return this._git(['rev-parse', '--abbrev-ref', 'HEAD']);
    } catch {
      return null;
    }
  }

  list() {
    try {
      const raw = this._git(['worktree', 'list', '--porcelain']);
      const worktrees = [];
      let current = {};
      for (const line of raw.split('\n')) {
        if (line.startsWith('worktree ')) {
          if (current.path) worktrees.push(current);
          current = { path: line.slice(9) };
        } else if (line.startsWith('HEAD ')) {
          current.head = line.slice(5);
        } else if (line.startsWith('branch ')) {
          current.branch = line.slice(7).replace('refs/heads/', '');
        } else if (line === 'bare') {
          current.bare = true;
        } else if (line === 'detached') {
          current.detached = true;
        }
      }
      if (current.path) worktrees.push(current);
      return worktrees;
    } catch {
      return [];
    }
  }

  /** Create a worktree for a task. Returns null if not a git repo. */
  create(taskId, baseBranch = null) {
    if (!this.isGitRepo()) return null;

    const safeId = sanitize(taskId);
    const branchName = `cc24h/${safeId}`;
    const worktreePath = join(this.worktreeBase, safeId);

    if (existsSync(worktreePath)) {
      return { path: worktreePath, branch: branchName, existed: true };
    }

    const base = baseBranch || this.getCurrentBranch() || 'main';

    try {
      this._git(['worktree', 'add', '-b', branchName, worktreePath, base]);
    } catch {
      try {
        this._git(['worktree', 'add', worktreePath, branchName]);
      } catch (e2) {
        throw new Error(`Failed to create worktree for ${safeId}: ${e2.message}`);
      }
    }

    return { path: worktreePath, branch: branchName, existed: false };
  }

  remove(taskId) {
    const safeId = sanitize(taskId);
    const worktreePath = join(this.worktreeBase, safeId);
    try {
      this._git(['worktree', 'remove', worktreePath, '--force']);
      return true;
    } catch {
      return false;
    }
  }

  getDiff(branchName, baseBranch = 'main') {
    try {
      const stat = this._git(['diff', '--stat', `${baseBranch}...${branchName}`]);
      const files = this._git(['diff', '--name-only', `${baseBranch}...${branchName}`]);
      return { stat, files: files ? files.split('\n').filter(Boolean) : [] };
    } catch {
      return { stat: '', files: [] };
    }
  }

  getModifiedFiles(branchName, baseBranch = null) {
    const base = baseBranch || this.getCurrentBranch() || 'main';
    try {
      const files = this._git(['diff', '--name-only', `${base}...${branchName}`]);
      return files ? files.split('\n').filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  /** Create a checkpoint commit. Returns HEAD sha (even if nothing changed). */
  checkpoint(worktreePath, message) {
    try {
      this._git(['add', '-A'], worktreePath);
      try {
        this._git(['commit', '-m', message], worktreePath);
      } catch {
        // No changes to commit — that's fine
      }
      return this._git(['rev-parse', 'HEAD'], worktreePath);
    } catch {
      return null;
    }
  }

  /** Check merge conflicts between two branches */
  checkMergeConflict(branchA, branchB) {
    try {
      const base = this._git(['merge-base', branchA, branchB]);
      // Use execSync for piped command
      execSync(`git merge-tree ${base} ${branchA} ${branchB}`, {
        cwd: this.projectRoot,
        encoding: 'utf-8',
        timeout: 15000,
      });
      return { conflicts: false, files: [] };
    } catch (e) {
      return { conflicts: true, message: e.message };
    }
  }
}
