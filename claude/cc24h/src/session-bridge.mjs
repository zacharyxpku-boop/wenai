/**
 * cc24h - Session Bridge
 *
 * Provides the interface for ANY Claude Code session to connect to Commander Core.
 * This is the "API layer" — implemented as CLI commands that read/write shared state.
 *
 * Design: stateless commands that operate on the shared SQLite + filesystem state.
 * Any session, in any terminal, can call these and get consistent results because
 * they all hit the same .cc24h/commander/ state.
 */

import { CommanderCore } from './commander-core.mjs';

export class SessionBridge {
  constructor(system) {
    this.system = system;
    this.commander = new CommanderCore({
      db: system.db,
      taskQueue: system.taskQueue,
      sessionManager: system.sessionManager,
      worktreeManager: system.worktreeManager,
      lockManager: system.lockManager,
      handoffManager: system.handoffManager,
      eventLogger: system.eventLogger,
      projectRoot: system.projectRoot,
    });
  }

  /**
   * Register a session with the commander.
   * Called once when a new Claude Code session starts working on this project.
   */
  register(sessionId, role) {
    return this.commander.registerSession(sessionId, role);
  }

  /**
   * Ask commander: "What should I do next?"
   * Commander assigns a task, generates a prompt, returns it.
   */
  claimTask(sessionId) {
    return this.commander.claimTask(sessionId);
  }

  /**
   * Get the current prompt for this session.
   * If already working on something, returns that task's prompt.
   * If idle, claims a new task.
   */
  nextPrompt(sessionId) {
    return this.commander.getNextPrompt(sessionId);
  }

  /**
   * Submit execution results back to commander.
   * Commander decides: done / review / retry / generate follow-up.
   */
  submitResult(sessionId, taskId, result) {
    return this.commander.submitResult(sessionId, taskId, result);
  }

  /**
   * Sync: get full project context and state for this session.
   */
  syncContext(sessionId) {
    return this.commander.syncContext(sessionId);
  }

  /**
   * Request review for current task.
   */
  requestReview(sessionId) {
    return this.commander.requestReview(sessionId);
  }

  /**
   * Close/complete a task explicitly.
   */
  closeTask(sessionId, taskId) {
    return this.commander.submitResult(sessionId, taskId, {
      summary: 'Closed by session',
      tests: 'skipped',
    });
  }

  /**
   * Get commander's overall status.
   */
  status() {
    return this.commander.getStatus();
  }

  /**
   * Get full project context as the commander sees it.
   */
  context() {
    return this.commander.getProjectContext();
  }
}
