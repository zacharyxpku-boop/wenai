/**
 * Cloudflare Worker · OpenAI API 反向代理
 *
 * 国内服务器/Vercel Edge 偶发访问 https://api.openai.com 不稳的应急方案。
 * 把所有请求从 your-worker.workers.dev/v1/* 转发到 https://api.openai.com/v1/*
 *
 * 部署步骤:
 *  1. 注册 cloudflare.com (免费)
 *  2. Workers & Pages → Create → Create Worker
 *  3. 命名 (例: wenai-openai-proxy)
 *  4. 把这段代码贴进编辑器
 *  5. Save and Deploy
 *  6. 复制部署后的 URL (例 https://wenai-openai-proxy.xxx.workers.dev)
 *  7. wenai .env.local 加 OPENAI_BASE_URL=https://wenai-openai-proxy.xxx.workers.dev
 *  8. 改 src/app/api/openai-image/route.ts 把硬编码的 https://api.openai.com 替换为
 *     `${process.env.OPENAI_BASE_URL || 'https://api.openai.com'}/v1/images/...`
 *
 * 思路来源: clico-clean/cloudflare-gemini-proxy.js · 同款反代模式
 */

const openaiProxyWorker = {
  async fetch(request) {
    const url = new URL(request.url);
    // 把 host 换成 OpenAI 上游
    const upstream = `https://api.openai.com${url.pathname}${url.search}`;

    const init = {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'follow',
    };

    const res = await fetch(upstream, init);

    // 透传响应,加 CORS (调试用)
    const headers = new Headers(res.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  },
};

export default openaiProxyWorker;
