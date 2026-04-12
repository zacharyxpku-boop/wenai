/**
 * cc24h - Codex CLI Backend
 * Executes prompts via Codex CLI `exec --json`, parsing the final agent message
 * from JSONL events. This backend is opt-in and does not replace the default
 * Claude-backed auto-detection path.
 */

import { spawn, spawnSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { BaseBackend } from './base.mjs';

function defaultExecutable() {
  const sandboxExe = join(homedir(), '.codex', '.sandbox-bin', 'codex.exe');
  return existsSync(sandboxExe) ? sandboxExe : 'codex';
}

function parseJsonEvent(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

export class CodexBackend extends BaseBackend {
  constructor(config = {}) {
    super(config);
    this.type = 'codex';
    this._available = null;
    this._version = null;
    this.model = config.model || null;
    this.executable = config.codexPath || defaultExecutable();
    this.sandbox = config.codexSandbox || 'danger-full-access';
    this.ephemeral = config.codexEphemeral !== false;
  }

  _spawnSync(args) {
    return spawnSync(this.executable, args, {
      encoding: 'utf8',
      windowsHide: true
    });
  }

  async isAvailable() {
    if (this._available !== null) return this._available;
    try {
      const result = this._spawnSync(['--version']);
      this._available = result.status === 0;
      this._version = result.stdout?.trim() || null;
    } catch {
      this._available = false;
    }
    return this._available;
  }

  getVersion() {
    if (this._version) return this._version;
    try {
      const result = this._spawnSync(['--version']);
      this._version = result.stdout?.trim() || 'unknown';
      return this._version;
    } catch {
      return 'unknown';
    }
  }

  _buildArgs(cwd, schemaPath = null) {
    const args = [
      'exec',
      '--json',
      '--skip-git-repo-check',
      '-s',
      this.sandbox,
      '-C',
      cwd,
      '-'
    ];
    if (this.ephemeral) args.splice(args.length - 1, 0, '--ephemeral');
    if (schemaPath) args.splice(args.length - 1, 0, '--output-schema', schemaPath);
    if (this.model) args.splice(1, 0, '-m', this.model);
    return args;
  }

  async runPrompt(prompt, options = {}) {
    const {
      cwd = process.cwd(),
      logFile = null,
      timeout = 0,
      onOutput = null,
      outputSchema = null
    } = options;

    return new Promise((resolve, reject) => {
      const schemaPath = outputSchema ? join(homedir(), '.codex', 'tmp', `cc24h-schema-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`) : null;
      if (schemaPath) {
        writeFileSync(schemaPath, JSON.stringify(outputSchema, null, 2), 'utf8');
      }

      const args = this._buildArgs(cwd, schemaPath);
      const startTime = Date.now();
      const stdoutChunks = [];
      const stderrChunks = [];
      const jsonEvents = [];
      let lastAgentMessage = '';
      let resolved = false;

      const child = spawn(this.executable, args, {
        cwd,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdoutBuffer = '';
      child.stdout.on('data', (data) => {
        const text = data.toString();
        stdoutChunks.push(text);
        if (onOutput) onOutput(text);

        stdoutBuffer += text;
        const lines = stdoutBuffer.split(/\r?\n/);
        stdoutBuffer = lines.pop() || '';
        for (const line of lines) {
          const event = parseJsonEvent(line.trim());
          if (!event) continue;
          jsonEvents.push(event);
          if (event.type === 'item.completed' && event.item?.type === 'agent_message' && event.item.text) {
            lastAgentMessage = event.item.text;
          }
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        stderrChunks.push(text);
        if (logFile) {
          // Preserve stderr in raw output for debugging, but don't let it pollute parsed content.
        }
      });

      child.stdin.write(prompt);
      child.stdin.end();

      let timer = null;
      if (timeout > 0) {
        timer = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          child.kill('SIGTERM');
          setTimeout(() => {
            try { child.kill('SIGKILL'); } catch {}
          }, 5000);
          resolve({
            output: lastAgentMessage || stdoutChunks.join(''),
            rawOutput: stdoutChunks.join('') + stderrChunks.join(''),
            exitCode: -1,
            duration: Math.round((Date.now() - startTime) / 1000),
            success: false
          });
          if (schemaPath) {
            try { unlinkSync(schemaPath); } catch {}
          }
        }, timeout);
      }

      child.on('close', async (code) => {
        if (resolved) return;
        resolved = true;
        if (timer) clearTimeout(timer);

        if (stdoutBuffer.trim()) {
          const event = parseJsonEvent(stdoutBuffer.trim());
          if (event) {
            jsonEvents.push(event);
            if (event.type === 'item.completed' && event.item?.type === 'agent_message' && event.item.text) {
              lastAgentMessage = event.item.text;
            }
          }
        }

        const rawOutput = stdoutChunks.join('') + stderrChunks.join('');
        const duration = Math.round((Date.now() - startTime) / 1000);
        if (logFile) {
          try {
            await import('fs/promises').then((fs) => fs.writeFile(logFile, rawOutput, 'utf8'));
          } catch {}
        }
        if (schemaPath) {
          try { unlinkSync(schemaPath); } catch {}
        }

        resolve({
          output: lastAgentMessage || rawOutput,
          rawOutput,
          jsonEvents,
          exitCode: code ?? 1,
          duration,
          success: code === 0
        });
      });

      child.on('error', (error) => {
        if (resolved) return;
        resolved = true;
        if (timer) clearTimeout(timer);
        if (schemaPath) {
          try { unlinkSync(schemaPath); } catch {}
        }
        reject(error);
      });
    });
  }

  async startSession(prompt, options = {}) {
    const { onOutput, onClose } = options;
    const result = await this.runPrompt(prompt, { ...options, onOutput });
    if (onClose) {
      onClose({
        code: result.exitCode,
        output: result.output,
        success: result.success
      });
    }
    return {
      pid: null,
      sessionRef: `codex-${Date.now()}`,
      process: null
    };
  }

  async killSession() {
    return false;
  }

  getInfo() {
    return {
      type: 'codex',
      available: this._available,
      version: this._available ? this.getVersion() : 'N/A',
      model: this.model || 'config-default',
      sandbox: this.sandbox,
      ephemeral: this.ephemeral
    };
  }
}
