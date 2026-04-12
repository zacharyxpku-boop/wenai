/**
 * cc24h - Abstract Backend Interface
 */

export class BaseBackend {
  constructor(config = {}) {
    this.config = config;
    this.type = 'base';
  }

  /** Check if this backend is available */
  async isAvailable() { throw new Error('Not implemented'); }

  /** Run a prompt and return { output, exitCode, duration } */
  async runPrompt(prompt, options = {}) { throw new Error('Not implemented'); }

  /** Start a long-running session, return { pid, sessionRef } */
  async startSession(prompt, options = {}) { throw new Error('Not implemented'); }

  /** Kill a running session */
  async killSession(pid) { throw new Error('Not implemented'); }

  /** Get backend info for display */
  getInfo() {
    return { type: this.type, available: false };
  }
}
