/**
 * cc24h - Claude Agent SDK Backend (optional)
 * Falls back gracefully if SDK is not installed.
 */

import { BaseBackend } from './base.mjs';

export class SdkBackend extends BaseBackend {
  constructor(config = {}) {
    super(config);
    this.type = 'sdk';
    this._available = null;
    this._sdk = null;
  }

  async isAvailable() {
    if (this._available !== null) return this._available;
    try {
      this._sdk = await import('@anthropic-ai/claude-code');
      this._available = true;
    } catch {
      this._available = false;
    }
    return this._available;
  }

  async runPrompt(prompt, options = {}) {
    if (!this._sdk) throw new Error('SDK not available');
    const { cwd = process.cwd(), maxTurns = 100 } = options;

    const startTime = Date.now();
    try {
      const result = await this._sdk.query({
        prompt,
        options: {
          maxTurns,
          cwd,
          dangerouslySkipPermissions: true,
        },
      });

      return {
        output: typeof result === 'string' ? result : JSON.stringify(result),
        exitCode: 0,
        duration: Math.round((Date.now() - startTime) / 1000),
        success: true,
      };
    } catch (err) {
      return {
        output: err.message,
        exitCode: 1,
        duration: Math.round((Date.now() - startTime) / 1000),
        success: false,
      };
    }
  }

  async startSession(prompt, options = {}) {
    const { onOutput, onClose } = options;
    const result = await this.runPrompt(prompt, options);
    // Fire callbacks for compatibility with session-manager
    if (onOutput && result.output) onOutput(result.output);
    if (onClose) onClose({ code: result.exitCode, output: result.output, success: result.success });
    return {
      pid: null,
      sessionRef: `sdk-${Date.now()}`,
      process: null,
    };
  }

  async killSession() {
    return false; // SDK sessions are not killable
  }

  getInfo() {
    return {
      type: 'sdk',
      available: this._available,
    };
  }
}
