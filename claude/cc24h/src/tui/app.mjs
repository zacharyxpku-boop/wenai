/**
 * cc24h - Terminal UI (blessed)
 * Clean dashboard with Commander Core integration.
 */

import blessed from 'blessed';
import { TaskStatus } from '../models.mjs';

const IC = {
  todo: '○', running: '●', blocked: '⊘', review: '◎',
  done: '✓', failed: '✗', quarantined: '⊗',
  idle: '○', active: '●', paused: '‖', stale: '?',
};

const CLR = {
  todo: 'white', running: 'yellow', blocked: 'red', review: 'cyan',
  done: 'green', failed: 'red', quarantined: 'magenta',
  idle: 'gray', active: 'green', paused: 'yellow', stale: 'red',
};

export class TuiApp {
  constructor(system) {
    this.sys = system;
    this.screen = null;
    this.w = {};
    this._timer = null;
  }

  start() {
    this.screen = blessed.screen({ smartCSR: true, title: 'cc24h Commander', fullUnicode: true });
    this._layout();
    this._keys();
    this._refresh();
    this._timer = setInterval(() => this._refresh(), 2000);
    this.screen.render();
  }

  _layout() {
    // Status bar
    this.w.status = blessed.box({
      parent: this.screen, top: 0, left: 0, width: '100%', height: 1,
      tags: true, style: { bg: 'blue', fg: 'white' },
    });

    // Left: Tasks (45%)
    this.w.tasks = blessed.list({
      parent: this.screen, top: 1, left: 0, width: '45%', height: '100%-4',
      border: { type: 'line' }, label: ' Tasks ',
      tags: true, scrollable: true, mouse: true, keys: true, vi: true,
      style: { border: { fg: 'cyan' }, selected: { bg: 'blue', fg: 'white' } },
    });

    // Right top: Commander Sessions (55%, upper 45%)
    this.w.sessions = blessed.list({
      parent: this.screen, top: 1, left: '45%', width: '55%', height: '45%',
      border: { type: 'line' }, label: ' Commander Sessions ',
      tags: true, scrollable: true, mouse: true, keys: true, vi: true,
      style: { border: { fg: 'green' }, selected: { bg: 'blue', fg: 'white' } },
    });

    // Right bottom: Decisions + Events (55%, lower)
    this.w.events = blessed.box({
      parent: this.screen, top: '46%', left: '45%', width: '55%', height: '54%-3',
      border: { type: 'line' }, label: ' Decisions & Events ',
      tags: true, scrollable: true, mouse: true,
      style: { border: { fg: 'magenta' } },
    });

    // Help bar
    this.w.help = blessed.box({
      parent: this.screen, bottom: 0, left: 0, width: '100%', height: 3,
      border: { type: 'line' }, tags: true, style: { border: { fg: 'gray' } },
    });
    this.w.help.setContent(
      ' {bold}n{/bold}ew  {bold}d{/bold}aemon  {bold}r{/bold}esume  {bold}s{/bold}ync  {bold}h{/bold}andoff  {bold}l{/bold}ocks  {bold}g{/bold}it  {bold}m{/bold}erge  {bold}c{/bold}ontext  {bold}?{/bold}help  {bold}q{/bold}uit  {bold}Tab{/bold} focus'
    );
  }

  _keys() {
    this.screen.key(['q', 'C-c'], () => { this._stop(); process.exit(0); });
    this.screen.key('n', () => this._promptNewTask());
    this.screen.key('d', () => this._startDaemon());
    this.screen.key('r', () => this._promptResume());
    this.screen.key('s', () => this._syncState());
    this.screen.key('h', () => this._popup('Handoffs', this._fmtHandoffs()));
    this.screen.key('l', () => this._popup('Locks', this._fmtLocks()));
    this.screen.key('g', () => this._popup('Git / Worktrees', this._fmtGit()));
    this.screen.key('m', () => this._popup('Merge Candidates', this._fmtMerge()));
    this.screen.key('c', () => this._popup('Commander Context', this._fmtContext()));
    this.screen.key('?', () => this._popup('Help', HELP_TEXT));
    this.screen.key('tab', () => {
      const panels = [this.w.tasks, this.w.sessions];
      const i = panels.indexOf(this.screen.focused);
      panels[(i + 1) % panels.length].focus();
      this.screen.render();
    });
  }

  _refresh() {
    this._drawStatus();
    this._drawTasks();
    this._drawSessions();
    this._drawEvents();
    this.screen.render();
  }

  _drawStatus() {
    const cs = this.sys.bridge.status();
    const be = this.sys.backend?.type || 'none';
    const git = this.sys.worktreeManager.isGitRepo() ? `git:${this.sys.worktreeManager.getCurrentBranch()}` : 'no-git';
    const time = new Date().toLocaleTimeString();
    this.w.status.setContent(
      ` {bold}cc24h{/bold}  ${be}  ${git}  T:${cs.taskStats.running}run/${cs.taskStats.todo}todo/${cs.taskStats.done}done/${cs.taskStats.failed}fail  S:${cs.activeSessions}act/${cs.sessions}tot  L:${cs.locks}  ${time}`
    );
  }

  _drawTasks() {
    const tasks = this.sys.taskQueue.getAll();
    const items = tasks.map(t => {
      const ic = IC[t.status] || '?';
      const clr = CLR[t.status] || 'white';
      const br = t.branch ? `{gray-fg}${t.branch.replace('cc24h/', '')}{/gray-fg}` : '';
      const wt = t.worktree ? '{cyan-fg}wt{/cyan-fg}' : '';
      const role = t.agent_role ? `{gray-fg}${t.agent_role.slice(0, 5)}{/gray-fg}` : '';
      const lock = t.session_id ? `{yellow-fg}→${t.session_id.slice(0, 8)}{/yellow-fg}` : '';
      const deps = (t.depends_on?.length) ? `{gray-fg}dep:${t.depends_on.length}{/gray-fg}` : '';
      const retry = t.retry_count > 0 ? `{red-fg}R${t.retry_count}{/red-fg}` : '';
      return `{${clr}-fg}${ic}{/${clr}-fg} P${t.priority} ${t.id.slice(0, 18).padEnd(18)} ${role} ${wt}${br} ${lock} ${deps} ${retry}`;
    });
    if (!items.length) items.push('{gray-fg} No tasks. [n] to add{/gray-fg}');
    this.w.tasks.setItems(items);
  }

  _drawSessions() {
    // Show Commander Core sessions (not orchestrator sessions)
    const sessions = this.sys.bridge.commander.getAllSessions();
    const items = sessions.map(s => {
      const ic = IC[s.status] || '?';
      const clr = CLR[s.status] || 'white';
      const task = s.current_task_id ? `→${s.current_task_id}` : '';
      const phase = s.current_phase ? `[${s.current_phase}]` : '';
      const branch = s.branch_name ? `{gray-fg}${s.branch_name.replace('cc24h/', '')}{/gray-fg}` : '';
      const wt = s.worktree_path ? '{cyan-fg}wt{/cyan-fg}' : '';
      const review = s.needs_review ? '{red-fg}!review{/red-fg}' : '';
      const hb = s.last_heartbeat ? timeSince(s.last_heartbeat) : '?';
      return `{${clr}-fg}${ic}{/${clr}-fg} ${s.id.slice(0, 14).padEnd(14)} ${(s.role || '').slice(0, 7).padEnd(7)} ${phase.padEnd(10)} ${task.padEnd(18)} ${wt}${branch} ${review} {gray-fg}${hb}{/gray-fg}`;
    });
    if (!items.length) items.push('{gray-fg} No sessions. Use: cc24h register -s <id> -r builder{/gray-fg}');
    this.w.sessions.setItems(items);
  }

  _drawEvents() {
    // Mix commander decisions + system events
    const decisions = this.sys.bridge.commander._getDecisions(10);
    const events = this.sys.eventLogger.getRecent(10);

    const all = [
      ...decisions.map(d => ({ time: d.created_at, msg: `{cyan-fg}DEC{/cyan-fg} ${d.decision}`, level: 'decision' })),
      ...events.map(e => ({ time: e.created_at, msg: `${e.message}`, level: e.level })),
    ].sort((a, b) => (b.time || '').localeCompare(a.time || '')).slice(0, 15);

    const lines = all.map(e => {
      const clr = e.level === 'error' ? 'red' : e.level === 'warn' ? 'yellow' : e.level === 'decision' ? 'cyan' : 'white';
      const t = (e.time || '').slice(11, 19);
      return `{${clr}-fg}${t} ${(e.msg || '').slice(0, 60)}{/${clr}-fg}`;
    });
    this.w.events.setContent(lines.join('\n'));
  }

  // ── Actions ──

  _promptNewTask() {
    const form = blessed.prompt({
      parent: this.screen, top: 'center', left: 'center', width: '60%', height: 'shrink',
      border: { type: 'line' }, label: ' New Task (id|title|prompt) ', style: { border: { fg: 'cyan' } },
    });
    form.input('', '', (err, val) => {
      if (err || !val) { this.screen.render(); return; }
      const [id, title, prompt] = val.split('|').map(s => s.trim());
      try {
        this.sys.taskQueue.add({ id: id || undefined, title: title || id, prompt: prompt || title || id });
        this.sys.eventLogger.info(`Task added: ${id || title}`);
      } catch (e) { this.sys.eventLogger.error(`Add failed: ${e.message}`); }
      this._refresh();
    });
  }

  async _startDaemon() {
    if (!this.sys.backend) { this.sys.eventLogger.error('No backend'); this._refresh(); return; }
    this.sys.eventLogger.info('Daemon starting');
    this._refresh();
    this.sys.orchestrator.runLoop().catch(e => this.sys.eventLogger.error(`Daemon: ${e.message}`));
  }

  _promptResume() {
    const rec = this.sys.sessionManager.getAll().filter(s => ['failed', 'paused', 'stale'].includes(s.status));
    if (!rec.length) { this._msg('No recoverable sessions'); return; }
    const items = rec.map(s => `${s.id} (${s.status}) ${s.display_name}`);
    const list = blessed.list({
      parent: this.screen, top: 'center', left: 'center', width: '50%', height: Math.min(items.length + 4, 12),
      border: { type: 'line' }, label: ' Resume ', items, keys: true, mouse: true, vi: true,
      style: { selected: { bg: 'blue' }, border: { fg: 'green' } },
    });
    list.on('select', (_, i) => { this.sys.sessionManager.recover(rec[i].id); list.destroy(); this._refresh(); });
    list.key('escape', () => { list.destroy(); this.screen.render(); });
    list.focus(); this.screen.render();
  }

  _syncState() {
    const cleaned = this.sys.lockManager.cleanExpired();
    this.sys.sessionManager.detectStale();
    this.sys.bridge.commander.recoverStaleSessions();
    this.sys.db.save();
    this.sys.eventLogger.info(`Synced: ${cleaned} locks cleaned`);
    this._refresh();
  }

  // ── Popups ──

  _fmtHandoffs() {
    const h = this.sys.handoffManager.getRecent(10);
    if (!h.length) return 'No handoffs.';
    return h.map(x =>
      `${x.created_at?.slice(0, 16)}  ${x.from_session} → ${x.to_session}\n  Goal: ${x.goal}\n  Next: ${(x.next_steps || '').slice(0, 60)}`
    ).join('\n\n');
  }

  _fmtLocks() {
    const l = this.sys.lockManager.getAll();
    if (!l.length) return 'No active locks.';
    return l.map(x => `${x.path}  owner:${x.session_id}  expires:${x.expires_at || 'never'}`).join('\n');
  }

  _fmtGit() {
    const wm = this.sys.worktreeManager;
    const lines = [`Git: ${wm.isGitRepo() ? 'yes' : 'no'}`, `Branch: ${wm.getCurrentBranch() || 'N/A'}`];
    const wts = wm.list();
    if (wts.length) {
      lines.push('', 'Worktrees:');
      for (const w of wts) lines.push(`  ${w.branch || 'detached'} → ${w.path}`);
    }
    // Show tasks with branches
    const branchTasks = this.sys.taskQueue.getAll().filter(t => t.branch);
    if (branchTasks.length) {
      lines.push('', 'Task → Branch mapping:');
      for (const t of branchTasks) lines.push(`  ${t.id} → ${t.branch} [${t.status}]`);
    }
    return lines.join('\n');
  }

  _fmtMerge() {
    const tasks = [...this.sys.taskQueue.getByStatus('review'), ...this.sys.taskQueue.getByStatus('done')].filter(t => t.branch);
    if (!tasks.length) return 'No merge candidates.';
    return tasks.map(t => `${t.id} (${t.status})  branch:${t.branch}  ${t.title}`).join('\n');
  }

  _fmtContext() {
    const ctx = this.sys.bridge.context();
    return ctx.slice(0, 3000);
  }

  _popup(title, content) {
    const box = blessed.box({
      parent: this.screen, top: 'center', left: 'center', width: '75%', height: '65%',
      border: { type: 'line' }, label: ` ${title} `, content,
      scrollable: true, mouse: true, keys: true, vi: true,
      style: { border: { fg: 'white' } },
    });
    box.key(['escape', 'q'], () => { box.destroy(); this.screen.render(); });
    box.focus(); this.screen.render();
  }

  _msg(text) {
    const m = blessed.message({ parent: this.screen, top: 'center', left: 'center', width: '40%', height: 'shrink', border: { type: 'line' } });
    m.display(text, 2, () => this.screen.render());
  }

  _stop() {
    if (this._timer) clearInterval(this._timer);
    this.sys.db.save();
  }
}

function timeSince(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m`;
  return `${Math.round(diff / 3600000)}h`;
}

const HELP_TEXT = `cc24h TUI — Keyboard Shortcuts

  n   New task (id|title|prompt)
  d   Start daemon
  r   Resume session
  s   Sync (clean locks, recover stale)
  h   Handoff history
  l   Active locks
  g   Git / worktree / branch status
  m   Merge candidates
  c   Commander context
  ?   This help
  Tab Switch focus
  q   Quit

Sessions panel shows Commander Core sessions.
Tasks panel shows worktree + lock + dep info.`;
