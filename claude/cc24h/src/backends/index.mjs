/**
 * Backend auto-detection and factory.
 */

import { CliBackend } from './cli-backend.mjs';
import { CodexBackend } from './codex-backend.mjs';
import { SdkBackend } from './sdk-backend.mjs';

export async function createBackend(config = {}) {
  const preferred = config.backend || 'auto';

  if (preferred === 'codex') {
    const codex = new CodexBackend(config);
    if (await codex.isAvailable()) return codex;
    throw new Error('Codex backend requested but not available. Install or expose Codex CLI.');
  }

  if (preferred === 'sdk' || preferred === 'auto') {
    const sdk = new SdkBackend(config);
    if (await sdk.isAvailable()) return sdk;
    if (preferred === 'sdk') {
      throw new Error('SDK backend requested but not available. Install @anthropic-ai/claude-code');
    }
  }

  if (preferred === 'claude' || preferred === 'cli' || preferred === 'auto') {
    const cli = new CliBackend(config);
    if (await cli.isAvailable()) return cli;
  }

  throw new Error('No backend available. Install Claude CLI or Agent SDK.');
}

export { CliBackend, CodexBackend, SdkBackend };
