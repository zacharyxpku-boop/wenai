/**
 * cc24h - Commander Core
 *
 * Single source of truth for all project decisions, task dispatch, and prompt generation.
 * All sessions connect to this ONE instance via Session Bridge.
 *
 * Key capabilities:
 * - Task assignment with lock protection and worktree auto-isolation
 * - Self-contained prompt generation
 * - Result acceptance and status flow
 * - Decision audit trail
 * - Session heartbeat and stale recovery
 * - Idempotent submit
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import yaml from 'js-yaml';

export class CommanderCore {
  constructor({ db, taskQueue, sessionManager, worktreeManager, lockManager, handoffManager, eventLogger, projectRoot }) {
    this.db = db;
    this.tasks = taskQueue;
    this.sessions = sessionManager;
    this.worktrees = worktreeManager;
    this.locks = lockManager;
    this.handoffs = handoffManager;
    this.events = eventLogger;
    this.root = resolve(projectRoot);

    this.dirs = {
      base: join(this.root, '.cc24h', 'commander'),
      inbox: join(this.root, '.cc24h', 'commander', 'inbox'),
      outbox: join(this.root, '.cc24h', 'commander', 'outbox'),
      decisions: join(this.root, '.cc24h', 'commander', 'decisions'),
      prompts: join(this.root, '.cc24h', 'commander', 'prompts'),
      sessions: join(this.root, '.cc24h', 'commander', 'sessions'),
    };
    for (const d of Object.values(this.dirs)) mkdirSync(d, { recursive: true });

    this._ensureSchema();
    // Claim mutex: simple in-process lock to serialize claimTask
    this._claiming = false;
  }

  _ensureSchema() {
    this.db.db.run(`
      CREATE TABLE IF NOT EXISTS commander_sessions (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        current_task_id TEXT,
        current_phase TEXT,
        branch_name TEXT,
        worktree_path TEXT,
        status TEXT DEFAULT 'idle',
        last_heartbeat TEXT,
        last_handoff TEXT,
        last_prompt_id TEXT,
        needs_review INTEGER DEFAULT 0,
        blocker TEXT,
        next_action TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE TABLE IF NOT EXISTS commander_decisions (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        type TEXT NOT NULL,
        input_summary TEXT,
        decision TEXT NOT NULL,
        reasoning TEXT,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS commander_prompts (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        task_id TEXT,
        role TEXT,
        prompt TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT
      );
    `);
    this.db._dirty = true;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Session Registration
  // ═══════════════════════════════════════════════════════════════════

  registerSession(sessionId, role, extra = {}) {
    const now = new Date().toISOString();
    const existing = this._getCsess(sessionId);

    if (existing) {
      this.db.db.run(
        `UPDATE commander_sessions SET role=?, status=?, last_heartbeat=?, updated_at=? WHERE id=?`,
        [role, extra.status || 'idle', now, now, sessionId]
      );
    } else {
      this.db.db.run(
        `INSERT INTO commander_sessions (id, role, status, last_heartbeat, created_at, updated_at) VALUES (?,?,?,?,?,?)`,
        [sessionId, role, 'idle', now, now, now]
      );
    }
    this.db._dirty = true;

    writeFileSync(
      join(this.dirs.sessions, `${sessionId}.yaml`),
      yaml.dump({ id: sessionId, role, status: extra.status || 'idle', registered_at: now })
    );

    return this._getCsess(sessionId);
  }

  heartbeat(sessionId) {
    const now = new Date().toISOString();
    this.db.db.run(
      `UPDATE commander_sessions SET last_heartbeat=?, updated_at=? WHERE id=?`,
      [now, now, sessionId]
    );
    this.db._dirty = true;
  }

  _getCsess(id) {
    const stmt = this.db.db.prepare('SELECT * FROM commander_sessions WHERE id = ?');
    stmt.bind([id]);
    let result = null;
    if (stmt.step()) result = stmt.getAsObject();
    stmt.free();
    return result;
  }

  getAllSessions() {
    const results = [];
    const stmt = this.db.db.prepare('SELECT * FROM commander_sessions ORDER BY updated_at DESC');
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Enforcement Gates (Production Quality Pipeline)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Pre-flight checks before task assignment.
   * These are MANDATORY — Commander cannot bypass them.
   * Returns { pass: true } or { pass: false, gate: string, fix: string }
   */
  checkEnforcementGates(task, targetProjectRoot = null) {
    const projectRoot = targetProjectRoot || this.root;
    const gates = [];

    // Gate 1: Design System must exist before UI tasks
    if (this._isUITask(task)) {
      const dsPath = join(projectRoot, 'docs', 'design-system.md');
      const dsFallback = join(projectRoot, 'design-system.md');
      if (!existsSync(dsPath) && !existsSync(dsFallback)) {
        gates.push({
          gate: 'design-system-required',
          message: `UI task "${task.title}" blocked: no design-system.md found.`,
          fix: 'Run workflow: /design-system-bootstrap before any UI work.',
          autofix_workflow: 'design-system-bootstrap',
        });
      }
    }

    // Gate 2: React tasks must have react-best-practices acknowledged
    if (this._isReactTask(task)) {
      const skillPath = join(projectRoot, '.claude', 'skills', 'vercel-react-best-practices', 'SKILL.md');
      if (!existsSync(skillPath)) {
        gates.push({
          gate: 'react-best-practices-required',
          message: `React task "${task.title}" — vercel-react-best-practices skill not installed.`,
          fix: 'Install: curl -sL https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/react-best-practices/SKILL.md > .claude/skills/vercel-react-best-practices/SKILL.md',
        });
      }
    }

    // Gate 3: Launch tasks must have production-readiness-audit pending or done
    if (this._isLaunchTask(task)) {
      const auditDir = join(projectRoot, '.cc24h', 'audits');
      const hasRecentAudit = existsSync(auditDir) && this._hasRecentFile(auditDir, 24 * 60 * 60 * 1000);
      if (!hasRecentAudit) {
        gates.push({
          gate: 'production-readiness-required',
          message: `Launch task "${task.title}" blocked: no recent production-readiness-audit.`,
          fix: 'Run workflow: /production-readiness-audit before launching.',
          autofix_workflow: 'production-readiness-audit',
        });
      }
    }

    // Gate 4: AI/Chatbot tasks must acknowledge chatbot-hardening
    if (this._isAITask(task)) {
      const hardeningPath = join(projectRoot, '.cc24h', 'audits', 'chatbot-hardening.yaml');
      // Only warn, don't block — chatbot-hardening is part of production-readiness
      if (!existsSync(hardeningPath)) {
        gates.push({
          gate: 'chatbot-hardening-advisory',
          message: `AI task "${task.title}" — chatbot-hardening not yet run. Will be required before launch.`,
          fix: 'Run workflow: /chatbot-hardening before shipping AI features.',
          severity: 'warning', // warning, not blocker
        });
      }
    }

    const blockers = gates.filter(g => g.severity !== 'warning');
    const warnings = gates.filter(g => g.severity === 'warning');

    return {
      pass: blockers.length === 0,
      blockers,
      warnings,
      allGates: gates,
    };
  }

  _isUITask(task) {
    const uiPatterns = /\b(ui|frontend|page|component|layout|css|style|design|landing|header|footer|nav|button|form|modal|responsive|mobile)\b/i;
    const text = `${task.title || ''} ${task.prompt || ''} ${(task.files_touched || []).join(' ')}`;
    return uiPatterns.test(text);
  }

  _isReactTask(task) {
    const reactPatterns = /\b(react|jsx|tsx|next\.js|nextjs|component|hook|useMemo|useState|useEffect)\b/i;
    const text = `${task.title || ''} ${task.prompt || ''} ${(task.files_touched || []).join(' ')}`;
    return reactPatterns.test(text);
  }

  _isLaunchTask(task) {
    const launchPatterns = /\b(launch|ship|deploy|发布|上线|go.?live|release|production)\b/i;
    return launchPatterns.test(`${task.title || ''} ${task.prompt || ''}`);
  }

  _isAITask(task) {
    const aiPatterns = /\b(ai|llm|chatbot|agent|gpt|claude|对话|dialog|intent|memory|tool.?call|rag|embedding|prompt)\b/i;
    return aiPatterns.test(`${task.title || ''} ${task.prompt || ''}`);
  }

  _hasRecentFile(dir, maxAgeMs) {
    try {
      const { readdirSync, statSync } = require('fs');
      const files = readdirSync(dir);
      const now = Date.now();
      return files.some(f => {
        try { return now - statSync(join(dir, f)).mtimeMs < maxAgeMs; } catch { return false; }
      });
    } catch { return false; }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Task Claim (with worktree auto-isolation + enforcement gates)
  // ═══════════════════════════════════════════════════════════════════

  claimTask(sessionId) {
    // Serialize claims to prevent double-assignment
    if (this._claiming) {
      return { task: null, prompt: null, decision: 'Another claim in progress. Try again.' };
    }
    this._claiming = true;

    try {
      return this._doClaimTask(sessionId);
    } finally {
      this._claiming = false;
    }
  }

  _doClaimTask(sessionId) {
    const csess = this._getCsess(sessionId);
    if (!csess) return { task: null, prompt: null, decision: `Session ${sessionId} not registered. Run: cc24h register --session ${sessionId} --role builder` };

    // If already working on something, return that
    if (csess.current_task_id) {
      const existingTask = this.tasks.get(csess.current_task_id);
      if (existingTask && existingTask.status === 'running') {
        const prompt = this._genPrompt(existingTask, csess);
        return {
          task: existingTask, prompt, promptId: csess.last_prompt_id,
          decision: `Already assigned: ${existingTask.id}. Continue working.`,
          worktree: csess.worktree_path, branch: csess.branch_name,
        };
      }
    }

    const role = csess.role;
    const candidates = this.tasks.getReady(20);
    let bestTask = null;
    let blockReason = null;

    for (const task of candidates) {
      // Role filter
      const taskRole = task.agent_role || 'builder';
      if (taskRole !== role && role !== 'builder' && taskRole !== 'implementer') {
        continue;
      }

      // Lock check
      if (task.files_touched?.length > 0) {
        const { available, conflicts } = this.locks.checkAvailability(task.files_touched, sessionId);
        if (!available) {
          blockReason = `Lock conflict: ${conflicts.map(c => `${c.path}(→${c.holder})`).join(', ')}`;
          continue;
        }
      }

      // Already claimed by another session?
      if (task.session_id && task.session_id !== sessionId) continue;

      // ── Enforcement Gate Check ──
      const gateResult = this.checkEnforcementGates(task);
      if (!gateResult.pass) {
        const blockerMsg = gateResult.blockers.map(b => `[GATE:${b.gate}] ${b.message} → ${b.fix}`).join('\n');
        this._decide(sessionId, 'gate_blocked', {
          input: `Task ${task.id}: ${task.title}`,
          decision: `BLOCKED by enforcement gate`,
          reasoning: blockerMsg,
        });
        // Try to auto-create prerequisite task
        for (const blocker of gateResult.blockers) {
          if (blocker.autofix_workflow) {
            this._createPrerequisiteTask(task, blocker);
          }
        }
        blockReason = `Enforcement gate: ${gateResult.blockers[0].gate}`;
        continue;
      }

      // Log warnings (non-blocking)
      for (const w of gateResult.warnings || []) {
        this._decide(sessionId, 'gate_warning', {
          input: `Task ${task.id}`,
          decision: `WARNING: ${w.gate}`,
          reasoning: w.message,
        });
      }

      bestTask = task;
      break;
    }

    if (!bestTask) {
      const pending = this.tasks.getAll().filter(t => t.status === 'todo').length;
      const reason = blockReason || (pending > 0 ? 'Tasks exist but deps/locks not ready' : 'No tasks in queue');
      return { task: null, prompt: null, decision: reason };
    }

    // ── Worktree auto-isolation ──
    let worktreeInfo = null;
    if (this.worktrees.isGitRepo()) {
      try {
        worktreeInfo = this.worktrees.create(bestTask.id);
        if (worktreeInfo) {
          // Merge dependency branches so this worktree has their changes
          const deps = bestTask.depends_on || [];
          for (const depId of deps) {
            const depTask = this.tasks.get(depId);
            if (depTask?.branch) {
              try {
                this.worktrees._git(['merge', depTask.branch, '--no-edit'], worktreeInfo.path);
              } catch {
                // Non-fatal — log and continue
              }
            }
          }
        }
      } catch (e) {
        // Worktree creation failed — non-fatal, execute in project root
        blockReason = `Worktree failed: ${e.message}`;
      }
    }

    // ── Acquire locks ──
    if (bestTask.files_touched?.length > 0) {
      for (const f of bestTask.files_touched) this.locks.acquire(f, sessionId);
    }

    // ── Update task state ──
    this.tasks.updateStatus(bestTask.id, 'running', {
      session_id: sessionId,
      branch: worktreeInfo?.branch || null,
      worktree: worktreeInfo?.path || null,
      phase: 'coding',
    });

    // ── Update commander session ──
    const now = new Date().toISOString();
    this.db.db.run(
      `UPDATE commander_sessions SET current_task_id=?, current_phase='coding', status='active', branch_name=?, worktree_path=?, last_heartbeat=?, updated_at=? WHERE id=?`,
      [bestTask.id, worktreeInfo?.branch || null, worktreeInfo?.path || null, now, now, sessionId]
    );

    // ── Generate prompt ──
    // Refresh task with worktree info
    const taskWithWT = { ...bestTask, branch: worktreeInfo?.branch, worktree: worktreeInfo?.path };
    const prompt = this._genPrompt(taskWithWT, csess);
    const promptId = `prompt-${Date.now()}`;

    this.db.db.run(
      `INSERT INTO commander_prompts (id, session_id, task_id, role, prompt, status, created_at) VALUES (?,?,?,?,?,?,?)`,
      [promptId, sessionId, bestTask.id, role, prompt, 'issued', now]
    );
    this.db.db.run(
      `UPDATE commander_sessions SET last_prompt_id=? WHERE id=?`,
      [promptId, sessionId]
    );

    // ── Record decision ──
    const wtNote = worktreeInfo ? `worktree=${worktreeInfo.path.split(/[/\\]/).pop()} branch=${worktreeInfo.branch}` : 'no worktree (not git repo)';
    this._decide(sessionId, 'task_assigned', {
      input: `Session ${sessionId} (${role}) requested task`,
      decision: `Assigned ${bestTask.id}: ${bestTask.title}`,
      reasoning: `P${bestTask.priority}, ${wtNote}, files=${(bestTask.files_touched || []).join(',')||'none'}`,
    });

    writeFileSync(
      join(this.dirs.prompts, `${promptId}.md`),
      `# ${promptId}\nSession: ${sessionId} | Task: ${bestTask.id} | Role: ${role}\nWorktree: ${worktreeInfo?.path || 'N/A'}\nBranch: ${worktreeInfo?.branch || 'N/A'}\n\n---\n\n${prompt}`
    );

    // GAP 7: Write context-inject.md for PostCompact hook re-injection
    const contextInjectPath = join(dirname(this.dirs.prompts), 'context-inject.md');
    const forbiddenZones = ['auth', 'payment', 'migration', 'secrets', 'deploy'];
    writeFileSync(contextInjectPath,
      `# CC24H Commander Context (auto-generated)\n\n` +
      `## Current Task\n- ID: ${bestTask.id}\n- Title: ${bestTask.title}\n- Priority: ${bestTask.priority}\n- Session: ${sessionId}\n- Role: ${role}\n\n` +
      `## Constraints\n- Only modify files related to this task\n- Files you may touch: ${(bestTask.files_touched || []).join(', ') || 'any (no restrictions)'}\n` +
      `- Forbidden zones: ${forbiddenZones.join(', ')}\n- Worktree: ${worktreeInfo?.path || 'project root'}\n- Branch: ${worktreeInfo?.branch || 'current'}\n\n` +
      `## When Done\nOutput these lines at the end:\n\`\`\`\nCOMPLETED: <what you did>\nFILES_CHANGED: <comma-separated>\nTESTS: pass/fail/skipped\nISSUES: <any issues or "none">\n\`\`\`\n`
    );

    this.db._dirty = true;
    this.db.autoSave();

    return {
      task: taskWithWT,
      prompt,
      promptId,
      decision: `Assigned: ${bestTask.id} — ${bestTask.title}`,
      worktree: worktreeInfo?.path || null,
      branch: worktreeInfo?.branch || null,
    };
  }

  /**
   * Auto-create a prerequisite task when an enforcement gate blocks.
   * The prerequisite is inserted as a dependency of the blocked task.
   */
  _createPrerequisiteTask(blockedTask, blocker) {
    const prereqId = `prereq-${blocker.autofix_workflow}-${Date.now()}`;
    const prereqTask = {
      id: prereqId,
      title: `[Auto] Run ${blocker.autofix_workflow} (required by ${blockedTask.id})`,
      prompt: `Commander enforcement gate requires "${blocker.autofix_workflow}" before task "${blockedTask.title}" can proceed.\n\nRun the /${blocker.autofix_workflow} workflow now.\n\nGate: ${blocker.gate}\nReason: ${blocker.message}`,
      priority: 0, // Highest priority
      status: 'todo',
      agent_role: 'builder',
      files_touched: [],
      risk_level: 'L1',
      parallel_safe: true,
      created_by: 'commander-enforcement',
    };

    try {
      this.tasks.add(prereqTask);
      // Add as dependency to blocked task
      const deps = blockedTask.depends_on || [];
      if (!deps.includes(prereqId)) {
        deps.push(prereqId);
        this.tasks.updateStatus(blockedTask.id, blockedTask.status, { depends_on: deps });
      }
      this._decide('commander', 'prerequisite_created', {
        input: `Gate ${blocker.gate} blocked ${blockedTask.id}`,
        decision: `Created prerequisite task ${prereqId}`,
        reasoning: blocker.fix,
      });
    } catch (e) {
      // Non-fatal — task may already exist
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Prompt Generation (with quality pipeline injection)
  // ═══════════════════════════════════════════════════════════════════

  _genPrompt(task, csess) {
    const lines = [];
    lines.push(`# Task: ${task.title}`);
    lines.push(`ID: ${task.id} | Role: ${csess.role} | Priority: ${task.priority}`);

    if (task.worktree) {
      lines.push(`Worktree: ${task.worktree}`);
      lines.push(`Branch: ${task.branch}`);
      lines.push('→ You are working in an isolated worktree. Changes here do not affect other sessions.');
    }

    lines.push('');

    // Deps context
    const deps = task.depends_on || [];
    if (deps.length > 0) {
      lines.push('## Dependencies (already done)');
      for (const depId of deps) {
        const dep = this.tasks.get(depId);
        if (dep) lines.push(`- ${depId}: ${dep.title} [${dep.status}]${dep.branch ? ` branch:${dep.branch}` : ''}`);
      }
      lines.push('');
    }

    // Locked files
    if (task.files_touched?.length > 0) {
      lines.push(`## Your files (locked to you): ${task.files_touched.join(', ')}`);
      lines.push('');
    }

    lines.push('## Instructions');
    lines.push(task.prompt);
    lines.push('');

    // Quality pipeline injection for UI tasks
    if (this._isUITask(task)) {
      lines.push('## Quality Pipeline (MANDATORY for UI tasks)');
      lines.push('');
      lines.push('### Before Writing Code:');
      lines.push('1. Read `design-system.md` — if missing, STOP and run `/design-system-bootstrap` first');
      lines.push('2. Read `.claude/skills/oiloil-ui-ux-guide/SKILL.md` #Anti-AI Defaults section');
      lines.push('3. Run `/frontend-design` — set design direction');
      lines.push('');
      lines.push('### While Writing Code:');
      lines.push('4. Apply `/motion-design` patterns: entrance stagger, scroll reveals, hover states');
      lines.push('5. Build mobile layout FIRST, then scale up (mobile-first)');
      lines.push('6. NEVER use: Inter, Roboto, Arial, purple gradients, rounded-3xl+shadow-2xl');
      lines.push('');
      lines.push('### After Writing Code (ALL REQUIRED):');
      lines.push('7. `grep -rn "Inter\\|Roboto\\|purple\\|from-purple\\|from-violet" <changed-files>` — fix any matches');
      lines.push('8. `/baseline-ui` — Remove AI aesthetic defaults');
      lines.push('9. `/fixing-accessibility` — Fix keyboard, ARIA, focus, semantics');
      lines.push('10. `/screenshot-loop` — Take screenshots at 3 viewports, analyze, fix');
      lines.push('11. `/mobile-qa` — Verify touch targets >=44px, font >=16px, no horizontal overflow');
      lines.push('');
      lines.push('### SUBMIT BLOCKERS (cannot submit without):');
      lines.push('- [ ] Screenshot taken at desktop + mobile viewports');
      lines.push('- [ ] No Anti-AI violations (hook will block if found)');
      lines.push('- [ ] Mobile layout verified');
      lines.push('- [ ] Entrance animations present (hero stagger, scroll reveals)');
      lines.push('');
    }

    // Quality pipeline injection for React tasks
    if (this._isReactTask(task)) {
      lines.push('## React Quality Rules');
      lines.push('- Follow `/vercel-react-best-practices` (57 rules, priority-ordered)');
      lines.push('- Follow `/vercel-composition-patterns` (avoid boolean prop proliferation)');
      lines.push('');
    }

    // Quality pipeline injection for AI tasks
    if (this._isAITask(task)) {
      lines.push('## AI Production Rules');
      lines.push('- All AI calls must have fallback behavior');
      lines.push('- Streaming responses required for user-facing output');
      lines.push('- Input validation + output filtering mandatory');
      lines.push('- Log all AI calls (latency, tokens, success/fail)');
      lines.push('- Test core dialog paths before submitting');
      lines.push('');
    }

    lines.push('## Rules');
    lines.push('1. Read existing code before changing anything');
    lines.push('2. Stay within your assigned files — do NOT modify other files');
    lines.push('3. Follow existing conventions');
    if (task.branch) {
      lines.push(`4. When done: git add -A && git commit -m "feat(${task.id}): <description>"`);
    }

    lines.push('');
    lines.push('## Output when done');
    lines.push('```');
    lines.push('COMPLETED: <what you did>');
    lines.push('FILES_CHANGED: <comma-sep list>');
    lines.push('TESTS: <pass/fail/skipped>');
    lines.push('ISSUES: <problems or "none">');
    lines.push('NEXT: <suggestion>');
    lines.push('```');

    return lines.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════
  // Result Submission (idempotent)
  // ═══════════════════════════════════════════════════════════════════

  submitResult(sessionId, taskId, result) {
    const { summary = '', filesChanged = [], tests = 'unknown', issues = '', nextSuggestion = '' } = result;

    const task = this.tasks.get(taskId);
    if (!task) return { status: 'error', message: `Task ${taskId} not found` };

    // Idempotent: if already done/review, skip
    if (['done', 'review'].includes(task.status) && task.session_id !== sessionId) {
      return { status: task.status, message: `Task ${taskId} already ${task.status}` };
    }

    const hasIssues = issues && issues.toLowerCase() !== 'none' && issues.trim().length > 0;
    const newStatus = hasIssues ? 'review' : 'done';

    this.tasks.updateStatus(taskId, newStatus, { error: hasIssues ? issues : null });

    // Release locks
    this.locks.releaseAll(sessionId);

    // Update commander session
    const now = new Date().toISOString();
    this.db.db.run(
      `UPDATE commander_sessions SET current_task_id=NULL, current_phase=NULL, status='idle', branch_name=NULL, worktree_path=NULL, needs_review=?, updated_at=? WHERE id=?`,
      [hasIssues ? 1 : 0, now, sessionId]
    );

    // Handoff
    this.handoffs.create({
      from_session: sessionId,
      to_session: 'commander',
      task_id: taskId,
      goal: task.title || taskId,
      completed: [summary || task.title],
      remaining: hasIssues ? [issues] : [],
      files_modified: filesChanged,
      test_results: tests,
      risks: issues,
      next_steps: nextSuggestion,
      can_parallel: true,
    });

    this._decide(sessionId, 'result_received', {
      input: `Task ${taskId}: ${summary}`,
      decision: `→ ${newStatus}${hasIssues ? '. Review needed.' : '. Done.'}`,
      reasoning: hasIssues ? `Issues: ${issues.slice(0, 80)}` : 'Clean',
    });

    // Write outbox
    writeFileSync(
      join(this.dirs.outbox, `${taskId}-${Date.now()}.yaml`),
      yaml.dump({ session: sessionId, task: taskId, status: newStatus, summary, filesChanged, tests, issues, nextSuggestion, at: now })
    );

    this.db._dirty = true;
    this.db.autoSave();

    return {
      status: newStatus,
      message: hasIssues
        ? `${taskId} → review. Issues: ${issues.slice(0, 80)}`
        : `${taskId} → done. Run "cc24h claim" for next task.`,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // Other Bridge Operations
  // ═══════════════════════════════════════════════════════════════════

  getNextPrompt(sessionId) {
    const csess = this._getCsess(sessionId);
    if (!csess) return { prompt: null, message: 'Not registered' };

    if (csess.current_task_id) {
      const task = this.tasks.get(csess.current_task_id);
      if (task && task.status === 'running') {
        return { taskId: task.id, prompt: this._genPrompt(task, csess), message: `Continue: ${task.title}`, worktree: csess.worktree_path, branch: csess.branch_name };
      }
    }
    return this.claimTask(sessionId);
  }

  syncContext(sessionId) {
    const csess = this._getCsess(sessionId);
    const taskStats = this.tasks.getStats();
    const all = this.getAllSessions();
    const locks = this.locks.getAll();

    return {
      you: csess ? { id: csess.id, role: csess.role, task: csess.current_task_id, phase: csess.current_phase, branch: csess.branch_name, worktree: csess.worktree_path, status: csess.status } : null,
      tasks: taskStats,
      sessions: all.map(s => ({ id: s.id, role: s.role, task: s.current_task_id, status: s.status, branch: s.branch_name })),
      locks: locks.map(l => ({ path: l.path, holder: l.session_id })),
      handoffs: this.handoffs.getRecent(5).map(h => ({ from: h.from_session, task: h.task_id, goal: h.goal })),
      decisions: this._getDecisions(5).map(d => ({ type: d.type, decision: d.decision, at: d.created_at })),
    };
  }

  requestReview(sessionId) {
    const csess = this._getCsess(sessionId);
    if (!csess?.current_task_id) return { message: 'No active task' };
    this.tasks.updateStatus(csess.current_task_id, 'review');
    this.db.db.run(`UPDATE commander_sessions SET needs_review=1, updated_at=? WHERE id=?`, [new Date().toISOString(), sessionId]);
    this.db._dirty = true;
    this._decide(sessionId, 'review_requested', { decision: `${csess.current_task_id} → review` });
    return { message: `${csess.current_task_id} → review queue` };
  }

  // ═══════════════════════════════════════════════════════════════════
  // Stale Session Recovery
  // ═══════════════════════════════════════════════════════════════════

  recoverStaleSessions(maxAgeMs = 30 * 60 * 1000) {
    const all = this.getAllSessions();
    const now = Date.now();
    const recovered = [];

    for (const s of all) {
      if (s.status !== 'active') continue;
      const hb = s.last_heartbeat ? new Date(s.last_heartbeat).getTime() : 0;
      if (now - hb > maxAgeMs) {
        // Stale — release task and locks
        if (s.current_task_id) {
          this.tasks.updateStatus(s.current_task_id, 'todo', { session_id: null, error: `Stale session ${s.id} recovered` });
        }
        this.locks.releaseAll(s.id);
        this.db.db.run(
          `UPDATE commander_sessions SET status='stale', current_task_id=NULL, current_phase=NULL, branch_name=NULL, worktree_path=NULL, updated_at=? WHERE id=?`,
          [new Date().toISOString(), s.id]
        );
        this._decide(s.id, 'stale_recovery', { decision: `Session ${s.id} marked stale, task ${s.current_task_id || 'none'} returned to queue` });
        recovered.push(s.id);
      }
    }
    this.db._dirty = true;
    return recovered;
  }

  // ═══════════════════════════════════════════════════════════════════
  // Project Context (for planning pipeline)
  // ═══════════════════════════════════════════════════════════════════

  getProjectContext() {
    const parts = [];
    const docs = ['CLAUDE.md', 'README.md', 'docs/architecture.md', 'docs/design-spec.md', 'docs/progress.md', 'docs/go-to-market.md'];
    for (const rel of docs) {
      const p = join(this.root, rel);
      if (existsSync(p)) parts.push(`### ${rel}\n${readFileSync(p, 'utf-8').slice(0, 3000)}`);
    }
    const stats = this.tasks.getStats();
    parts.push(`### Tasks\ntodo:${stats.todo} run:${stats.running} review:${stats.review} done:${stats.done} fail:${stats.failed}`);
    return parts.join('\n\n');
  }

  // ═══════════════════════════════════════════════════════════════════
  // Status
  // ═══════════════════════════════════════════════════════════════════

  getStatus() {
    const sess = this.getAllSessions();
    const ts = this.tasks.getStats();
    const dec = this._getDecisions(1);
    return {
      sessions: sess.length,
      activeSessions: sess.filter(s => s.status === 'active').length,
      idleSessions: sess.filter(s => s.status === 'idle').length,
      staleSessions: sess.filter(s => s.status === 'stale').length,
      taskStats: ts,
      locks: this.locks.getAll().length,
      lastDecision: dec[0]?.decision || 'none',
      lastDecisionAt: dec[0]?.created_at || 'never',
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // Internal
  // ═══════════════════════════════════════════════════════════════════

  _decide(sessionId, type, { input = '', decision, reasoning = '' }) {
    const id = `dec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    this.db.db.run(
      `INSERT INTO commander_decisions (id, session_id, type, input_summary, decision, reasoning, created_at) VALUES (?,?,?,?,?,?,?)`,
      [id, sessionId, type, input, decision, reasoning, now]
    );
    writeFileSync(join(this.dirs.decisions, `${id}.yaml`), yaml.dump({ id, session: sessionId, type, decision, reasoning, at: now }));
    this.db._dirty = true;
  }

  _getDecisions(limit = 10) {
    const results = [];
    const stmt = this.db.db.prepare(`SELECT * FROM commander_decisions ORDER BY created_at DESC LIMIT ?`);
    stmt.bind([limit]);
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  }
}
