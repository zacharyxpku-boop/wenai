/**
 * cc24h - Orchestrator
 * Core autonomous loop: picks tasks, assigns agents, manages parallel execution.
 * Features: exponential retry backoff, graceful shutdown, checkpoint validation,
 * worktree cleanup on quarantine, per-task timeout.
 */

import { join } from 'path';
import { mkdirSync } from 'fs';
import { TaskStatus, SessionStatus, AgentRole, RunMode } from './models.mjs';

export class Orchestrator {
  constructor({ db, taskQueue, sessionManager, worktreeManager, lockManager,
                handoffManager, checkpointManager, eventLogger, backend, config }) {
    this.db = db;
    this.tasks = taskQueue;
    this.sessions = sessionManager;
    this.worktrees = worktreeManager;
    this.locks = lockManager;
    this.handoffs = handoffManager;
    this.checkpoints = checkpointManager;
    this.events = eventLogger;
    this.backend = backend;
    this.config = {
      maxParallel: 2,
      checkpointIntervalMs: 5 * 60 * 1000,
      watchdogIntervalMs: 30 * 1000,
      cooldownMs: 10 * 1000,
      taskTimeoutMs: 30 * 60 * 1000, // 30 min per task
      runMode: RunMode.AUTONOMOUS,
      dryRun: false,
      logsDir: '.cc24h/worklogs',
      ...config,
    };

    mkdirSync(this.config.logsDir, { recursive: true });
    this._running = false;
    this._watchdogTimer = null;
    this._checkpointTimer = null;
    this._ownedSessions = new Set(); // track sessions we created
  }

  async executeTask(task) {
    if (!this.backend) {
      this.events.error('No backend available, cannot execute task', { task_id: task.id });
      this.tasks.updateStatus(task.id, TaskStatus.BLOCKED, { error: 'No backend' });
      return { success: false, reason: 'no_backend' };
    }

    const taskId = task.id;
    this.events.info(`Starting: ${task.title}`, { task_id: taskId });

    // 1. Create worktree (returns null if not git repo)
    let worktreeInfo = null;
    if (this.worktrees.isGitRepo()) {
      try {
        worktreeInfo = this.worktrees.create(taskId);
        if (worktreeInfo) {
          this.events.info(`Branch: ${worktreeInfo.branch}`, { task_id: taskId });
          // Merge dependency branches into this worktree so dependent tasks see prior changes
          const deps = task.depends_on || [];
          for (const depId of deps) {
            const depTask = this.tasks.get(depId);
            if (depTask?.branch) {
              try {
                this.worktrees._git(['merge', depTask.branch, '--no-edit'], worktreeInfo.path);
                this.events.info(`Merged dep ${depTask.branch} into ${worktreeInfo.branch}`, { task_id: taskId });
              } catch (e) {
                this.events.warn(`Merge dep ${depId} failed: ${e.message}`, { task_id: taskId });
              }
            }
          }
        }
      } catch (e) {
        this.events.warn(`Worktree failed: ${e.message}`, { task_id: taskId });
      }
    }

    // 2. Acquire locks
    if (task.files_touched?.length > 0) {
      const { available, conflicts } = this.locks.checkAvailability(task.files_touched, taskId);
      if (!available) {
        this.events.warn(`Lock conflict: ${taskId}`, { task_id: taskId });
        this.tasks.updateStatus(taskId, TaskStatus.BLOCKED, {
          error: `Locked: ${conflicts.map(c => `${c.path}(${c.holder})`).join(', ')}`,
        });
        return { success: false, reason: 'lock_conflict' };
      }
      for (const f of task.files_touched) this.locks.acquire(f, taskId);
    }

    // 3. Create session
    const session = this.sessions.create({
      display_name: `worker-${taskId}`,
      task_id: taskId,
      agent_role: task.agent_role || AgentRole.IMPLEMENTER,
      branch: worktreeInfo?.branch,
      worktree: worktreeInfo?.path,
    });
    this._ownedSessions.add(session.id);

    // 4. Mark running
    this.tasks.updateStatus(taskId, TaskStatus.RUNNING, {
      session_id: session.id,
      branch: worktreeInfo?.branch,
      worktree: worktreeInfo?.path,
      phase: 'coding',
    });

    if (this.config.dryRun) {
      this.events.info(`[DRY-RUN] ${task.title}`, { task_id: taskId });
      this.tasks.updateStatus(taskId, TaskStatus.DONE);
      this.sessions.updateStatus(session.id, SessionStatus.COMPLETED);
      return { success: true, dryRun: true };
    }

    // 5. Execute
    const prompt = this._buildPrompt(task, worktreeInfo);
    const logFile = join(this.config.logsDir, `${taskId}_${Date.now()}.log`);

    try {
      const result = await this.backend.runPrompt(prompt, {
        cwd: worktreeInfo?.path || process.cwd(),
        logFile,
        maxTurns: 100,
        timeout: this.config.taskTimeoutMs,
      });

      if (result.success) {
        this.tasks.updateStatus(taskId, TaskStatus.REVIEW, { phase: 'reviewing' });
        this.sessions.updateStatus(session.id, SessionStatus.COMPLETED, {
          summary: `Done: ${task.title} (${result.duration}s)`,
        });
        this.events.info(`Completed: ${task.title} (${result.duration}s)`, { task_id: taskId });

        this.handoffs.generateFromSession(session, task, {
          completed: [task.title],
          remaining: [],
          test_results: 'Pending review',
          next_steps: 'Review and merge',
        });

        return { success: true, duration: result.duration };
      } else {
        return this._handleFailure(task, session, result, logFile);
      }
    } catch (err) {
      return this._handleFailure(task, session, { output: err.message }, logFile);
    } finally {
      this.locks.releaseAll(taskId);
    }
  }

  _handleFailure(task, session, result, logFile) {
    const errMsg = (result.output || '').slice(0, 200);
    this.events.error(`Failed: ${task.title} — ${errMsg}`, { task_id: task.id });
    this.sessions.updateStatus(session.id, SessionStatus.FAILED, {
      summary: `Failed: ${task.title}`,
      blocker: errMsg,
    });

    if (task.retry_count < task.max_retries) {
      this.events.decision(`Retry ${task.id} (#${task.retry_count + 1}/${task.max_retries})`, { task_id: task.id });
      this.tasks.retry(task.id);
      return { success: false, reason: 'will_retry' };
    }

    // Quarantine: clean up worktree
    this.tasks.updateStatus(task.id, TaskStatus.QUARANTINED, {
      error: `Failed ${task.max_retries}x. Log: ${logFile}`,
    });
    if (task.worktree) {
      this.worktrees.remove(task.id);
      this.events.info(`Cleaned worktree: ${task.id}`, { task_id: task.id });
    }

    this.handoffs.generateFromSession(session, task, {
      completed: [],
      remaining: [task.title],
      risks: `Quarantined after ${task.max_retries} failures`,
      next_steps: `Check log: ${logFile}`,
    });

    return { success: false, reason: 'quarantined' };
  }

  _buildPrompt(task, worktreeInfo) {
    let prompt = task.prompt;
    if (worktreeInfo) {
      prompt += `\n\n## Git Requirements\n- Branch: ${worktreeInfo.branch}\n- After completing, git add && commit with format "feat(${task.id}): <desc>"\n- Do NOT push`;
    }
    if (task.agent_role) {
      prompt = `[Role: ${task.agent_role}]\n\n${prompt}`;
    }
    return prompt;
  }

  /** Main autonomous loop with graceful shutdown */
  async runLoop() {
    this._running = true;
    this.events.info(`Orchestrator started (mode=${this.config.runMode}, parallel=${this.config.maxParallel})`);

    this._startWatchdog();
    this._startCheckpointTimer();

    // Graceful shutdown handler
    const shutdown = () => {
      this.events.info('Shutting down gracefully...');
      this.stop();
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    while (this._running) {
      try {
        this.locks.cleanExpired();
        this.sessions.detectStale();

        // Count running tasks
        const running = this.tasks.getByStatus(TaskStatus.RUNNING).length;
        const slots = this.config.maxParallel - running;

        if (slots > 0) {
          const ready = this.tasks.getReady(slots);
          if (ready.length > 0) {
            this.events.info(`Dispatching ${ready.length} task(s)`);
            await Promise.allSettled(ready.map(t => this.executeTask(t)));
          }
        }

        this.db.autoSave();
        await this._sleep(this.config.cooldownMs);
      } catch (err) {
        this.events.error(`Loop error: ${err.message}`);
        await this._sleep(this.config.cooldownMs * 2);
      }
    }

    // Cleanup
    this._stopWatchdog();
    this._stopCheckpointTimer();
    process.removeListener('SIGINT', shutdown);
    process.removeListener('SIGTERM', shutdown);
    this.db.save();
    this.events.info('Orchestrator stopped');
  }

  stop() { this._running = false; }

  _sleep(ms) {
    return new Promise(r => {
      const t = setTimeout(r, ms);
      // Allow early exit if stopped
      const check = setInterval(() => {
        if (!this._running) { clearTimeout(t); clearInterval(check); r(); }
      }, 500);
    });
  }

  _startWatchdog() {
    this._watchdogTimer = setInterval(() => {
      // Only heartbeat sessions this orchestrator owns
      for (const sid of this._ownedSessions) {
        const s = this.sessions.get(sid);
        if (s?.status === SessionStatus.ACTIVE) {
          this.sessions.heartbeat(sid);
        }
      }
    }, this.config.watchdogIntervalMs);
  }

  _stopWatchdog() {
    if (this._watchdogTimer) clearInterval(this._watchdogTimer);
  }

  _startCheckpointTimer() {
    this._checkpointTimer = setInterval(() => {
      for (const sid of this._ownedSessions) {
        const s = this.sessions.get(sid);
        if (s?.status === SessionStatus.ACTIVE && s.task_id) {
          const task = this.tasks.get(s.task_id);
          if (task) {
            try {
              const cp = this.checkpoints.createFromSession(s, task, this.worktrees);
              if (cp?.commit_sha) {
                this.events.info(`Checkpoint ${cp.id} (${cp.commit_sha.slice(0, 7)})`, { session_id: sid });
              }
            } catch {
              // checkpoint failed, non-fatal
            }
          }
        }
      }
    }, this.config.checkpointIntervalMs);
  }

  _stopCheckpointTimer() {
    if (this._checkpointTimer) clearInterval(this._checkpointTimer);
  }

  generateReview() {
    const ts = this.tasks.getStats();
    const ss = this.sessions.getStats();
    const handoffs = this.handoffs.getRecent(5);
    const errors = this.events.getByLevel('error', 10);
    const decisions = this.events.getByLevel('decision', 10);
    const locks = this.locks.getAll();

    return [
      '═══════════════════════════════════════',
      `  CC24H Review — ${new Date().toISOString().slice(0, 16)}`,
      '═══════════════════════════════════════',
      '',
      `Tasks  todo:${ts.todo} run:${ts.running} blocked:${ts.blocked} review:${ts.review} done:${ts.done} fail:${ts.failed} total:${ts.total}`,
      `Sess   active:${ss.active} idle:${ss.idle} stale:${ss.stale} fail:${ss.failed}`,
      `Locks  ${locks.length || 'none'}`,
      '',
      ...(handoffs.length ? ['Handoffs:', ...handoffs.map(h => `  ${h.from_session} → ${h.to_session}: ${h.goal}`)] : []),
      ...(errors.length ? ['', 'Errors:', ...errors.map(e => `  [${e.created_at?.slice(11, 19)}] ${e.message?.slice(0, 72)}`)] : []),
      ...(decisions.length ? ['', 'Decisions:', ...decisions.map(d => `  [${d.created_at?.slice(11, 19)}] ${d.message?.slice(0, 72)}`)] : []),
      '',
      '═══════════════════════════════════════',
    ].join('\n');
  }
}
