#!/usr/bin/env node
/**
 * Anthropic → Qwen Proxy
 * Converts Claude Code's Anthropic API calls → DashScope OpenAI-compatible format
 * Zero dependencies, pure Node.js built-ins
 */

const http  = require('http');
const https = require('https');
const { URL } = require('url');

const PORT       = parseInt(process.env.PORT || '3456');
const QWEN_KEY   = process.env.DASHSCOPE_API_KEY || 'sk-78d76ee8d247485da8a46c5a3edb2a6d';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-max';
const UPSTREAM   = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

// ─── Content helpers ──────────────────────────────────────────────────────────

function blockToText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content.filter(b => b.type === 'text').map(b => b.text).join('');
}

// ─── Anthropic → OpenAI ───────────────────────────────────────────────────────

function convertMessages(anthropicMessages) {
  const out = [];
  for (const msg of anthropicMessages) {
    if (msg.role === 'user') {
      if (Array.isArray(msg.content)) {
        const toolResults = msg.content.filter(b => b.type === 'tool_result');
        if (toolResults.length) {
          for (const tr of toolResults) {
            out.push({
              role: 'tool',
              tool_call_id: tr.tool_use_id,
              content: typeof tr.content === 'string'
                ? tr.content
                : Array.isArray(tr.content)
                  ? blockToText(tr.content)
                  : JSON.stringify(tr.content)
            });
          }
          // Also include any text blocks in the same user turn
          const textPart = blockToText(msg.content.filter(b => b.type === 'text'));
          if (textPart) out.push({ role: 'user', content: textPart });
          continue;
        }
      }
      out.push({ role: 'user', content: blockToText(msg.content) });

    } else if (msg.role === 'assistant') {
      const oaiMsg = { role: 'assistant', content: null };
      if (Array.isArray(msg.content)) {
        const textBlocks = msg.content.filter(b => b.type === 'text');
        const toolBlocks = msg.content.filter(b => b.type === 'tool_use');
        if (textBlocks.length) oaiMsg.content = textBlocks.map(b => b.text).join('');
        if (toolBlocks.length) {
          oaiMsg.tool_calls = toolBlocks.map(b => ({
            id: b.id,
            type: 'function',
            function: { name: b.name, arguments: JSON.stringify(b.input || {}) }
          }));
        }
      } else {
        oaiMsg.content = blockToText(msg.content);
      }
      out.push(oaiMsg);
    }
  }
  return out;
}

function toOpenAI(body) {
  const messages = [];

  // System prompt
  if (body.system) {
    const text = typeof body.system === 'string' ? body.system : blockToText(body.system);
    if (text) messages.push({ role: 'system', content: text });
  }

  messages.push(...convertMessages(body.messages || []));

  const oai = {
    model: QWEN_MODEL,
    messages,
    stream: body.stream || false,
  };

  if (body.max_tokens)   oai.max_tokens   = body.max_tokens;
  if (body.temperature !== undefined) oai.temperature = body.temperature;

  if (body.tools?.length) {
    oai.tools = body.tools.map(t => ({
      type: 'function',
      function: {
        name:        t.name,
        description: t.description || '',
        parameters:  t.input_schema || { type: 'object', properties: {} }
      }
    }));
    if (body.tool_choice) {
      if (body.tool_choice === 'auto')       oai.tool_choice = 'auto';
      else if (body.tool_choice === 'any')   oai.tool_choice = 'required';
      else if (body.tool_choice?.name)       oai.tool_choice = { type: 'function', function: { name: body.tool_choice.name } };
    }
  }

  return oai;
}

// ─── OpenAI → Anthropic (non-streaming) ──────────────────────────────────────

function toAnthropic(oai, origModel) {
  const choice = oai.choices?.[0];
  const content = [];

  if (choice?.message?.content) content.push({ type: 'text', text: choice.message.content });

  if (choice?.message?.tool_calls) {
    for (const tc of choice.message.tool_calls) {
      let input = {};
      try { input = JSON.parse(tc.function.arguments); } catch {}
      content.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input });
    }
  }

  const fr = choice?.finish_reason;
  const stop_reason =
    fr === 'tool_calls' ? 'tool_use' :
    fr === 'length'     ? 'max_tokens' : 'end_turn';

  return {
    id:        'msg_' + (oai.id?.replace('chatcmpl-', '') || Math.random().toString(36).slice(2)),
    type:      'message',
    role:      'assistant',
    content,
    model:     origModel || QWEN_MODEL,
    stop_reason,
    stop_sequence: null,
    usage: {
      input_tokens:  oai.usage?.prompt_tokens     || 0,
      output_tokens: oai.usage?.completion_tokens || 0,
    }
  };
}

// ─── Streaming converter ──────────────────────────────────────────────────────

function makeStreamConverter(res, origModel) {
  const msgId   = 'msg_' + Math.random().toString(36).slice(2);
  let   started = false;
  let   textIdx = -1;            // content block index for current text block
  let   textOpen = false;
  const toolMap = {};            // oai tool index → anthropic content block index
  let   nextIdx = 0;
  let   outTokens = 0;
  let   finalStopReason = 'end_turn';
  let   buf = '';

  function sse(event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  function ensureStarted() {
    if (started) return;
    started = true;
    sse('message_start', {
      type: 'message_start',
      message: {
        id: msgId, type: 'message', role: 'assistant', content: [],
        model: origModel, stop_reason: null, stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 1 }
      }
    });
    sse('ping', { type: 'ping' });
  }

  function openTextBlock() {
    ensureStarted();
    textIdx = nextIdx++;
    textOpen = true;
    sse('content_block_start', {
      type: 'content_block_start', index: textIdx,
      content_block: { type: 'text', text: '' }
    });
  }

  function closeTextBlock() {
    if (!textOpen) return;
    sse('content_block_stop', { type: 'content_block_stop', index: textIdx });
    textOpen = false;
  }

  function finish() {
    closeTextBlock();
    for (const idx of Object.values(toolMap)) {
      sse('content_block_stop', { type: 'content_block_stop', index: idx });
    }
    sse('message_delta', {
      type: 'message_delta',
      delta: { stop_reason: finalStopReason, stop_sequence: null },
      usage: { output_tokens: outTokens }
    });
    sse('message_stop', { type: 'message_stop' });
    res.end();
  }

  function processChunk(raw) {
    const lines = (buf + raw).split('\n');
    buf = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') { finish(); return; }

      let chunk;
      try { chunk = JSON.parse(payload); } catch { continue; }

      if (chunk.usage?.completion_tokens) outTokens = chunk.usage.completion_tokens;

      const delta  = chunk.choices?.[0]?.delta;
      const finish_reason = chunk.choices?.[0]?.finish_reason;

      if (finish_reason === 'tool_calls') finalStopReason = 'tool_use';
      else if (finish_reason === 'length') finalStopReason = 'max_tokens';

      if (!delta) continue;

      // Text delta
      if (delta.content !== undefined && delta.content !== null && delta.content !== '') {
        if (!textOpen) openTextBlock();
        sse('content_block_delta', {
          type: 'content_block_delta', index: textIdx,
          delta: { type: 'text_delta', text: delta.content }
        });
        outTokens++;
      }

      // Tool call deltas
      if (delta.tool_calls) {
        closeTextBlock();
        for (const tc of delta.tool_calls) {
          const oaiTcIdx = tc.index ?? 0;

          if (tc.id && !Object.prototype.hasOwnProperty.call(toolMap, oaiTcIdx)) {
            // New tool call
            const blockIdx = nextIdx++;
            toolMap[oaiTcIdx] = blockIdx;
            ensureStarted();
            sse('content_block_start', {
              type: 'content_block_start', index: blockIdx,
              content_block: { type: 'tool_use', id: tc.id, name: tc.function?.name || '', input: {} }
            });
          }

          if (tc.function?.arguments) {
            sse('content_block_delta', {
              type: 'content_block_delta', index: toolMap[oaiTcIdx],
              delta: { type: 'input_json_delta', partial_json: tc.function.arguments }
            });
          }
        }
      }

      // Immediate finish on finish_reason (some providers send before [DONE])
      if (finish_reason === 'stop' || finish_reason === 'tool_calls' || finish_reason === 'length') {
        finish();
        return;
      }
    }
  }

  return { processChunk };
}

// ─── HTTP proxy server ────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || !req.url.startsWith('/v1/messages')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', model: QWEN_MODEL }));
    return;
  }

  let raw = '';
  req.on('data', c => { raw += c; });
  req.on('end', () => {
    let body;
    try { body = JSON.parse(raw); }
    catch { res.writeHead(400); res.end('{"error":"bad json"}'); return; }

    const oaiBody    = toOpenAI(body);
    const oaiBodyStr = JSON.stringify(oaiBody);

    const upUrl  = new URL(UPSTREAM);
    const opts   = {
      hostname: upUrl.hostname,
      path:     upUrl.pathname + upUrl.search,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Authorization':  `Bearer ${QWEN_KEY}`,
        'Content-Length': Buffer.byteLength(oaiBodyStr),
        'Accept':         oaiBody.stream ? 'text/event-stream' : 'application/json',
      }
    };

    const upReq = https.request(opts, upRes => {
      if (oaiBody.stream) {
        res.writeHead(200, {
          'Content-Type':  'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection':    'keep-alive',
        });
        const conv = makeStreamConverter(res, body.model || QWEN_MODEL);
        upRes.on('data', chunk => conv.processChunk(chunk.toString()));
        upRes.on('end', () => { /* [DONE] handled inside */ });
      } else {
        let respRaw = '';
        upRes.on('data', c => { respRaw += c; });
        upRes.on('end', () => {
          let oai;
          try { oai = JSON.parse(respRaw); }
          catch {
            res.writeHead(500); res.end('{"error":"upstream parse error"}'); return;
          }
          if (oai.error) {
            res.writeHead(upRes.statusCode || 500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              type: 'error',
              error: { type: 'api_error', message: oai.error.message || 'Upstream error' }
            }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(toAnthropic(oai, body.model)));
        });
      }
    });

    upReq.on('error', err => {
      console.error('[proxy] upstream error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502);
        res.end(JSON.stringify({ type: 'error', error: { type: 'api_error', message: err.message } }));
      }
    });

    upReq.write(oaiBodyStr);
    upReq.end();
  });

  req.on('error', err => console.error('[proxy] req error:', err.message));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n╔═══════════════════════════════════════════╗`);
  console.log(`║   Anthropic → Qwen Proxy  ✓ Running       ║`);
  console.log(`╠═══════════════════════════════════════════╣`);
  console.log(`║  http://127.0.0.1:${PORT}                   ║`);
  console.log(`║  Model: ${QWEN_MODEL.padEnd(32)}║`);
  console.log(`╚═══════════════════════════════════════════╝`);
  console.log(`\nTo use with Claude Code:`);
  console.log(`  ANTHROPIC_BASE_URL=http://127.0.0.1:${PORT} ANTHROPIC_API_KEY=qwen claude\n`);
});

server.on('error', err => { console.error('[proxy] fatal:', err); process.exit(1); });
