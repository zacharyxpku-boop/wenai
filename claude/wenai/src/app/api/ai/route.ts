import { NextRequest, NextResponse } from 'next/server';
import { getReferenceContext } from '@/lib/references';
import { getUserSettings } from '@/lib/user-settings';
import { listSkus } from '@/lib/sku-history';
import { logUsageEntry } from '@/lib/usage';
import { checkRateLimit } from '@/lib/ratelimit';
import { verifyToken, getCookieName } from '@/lib/auth';
import { checkCostCap, recordCostWithDetail } from '@/lib/cost-cap';
import { getCategoryPrefix, CATEGORIES } from '@/lib/category-prompts';
import { inferPlanFromUser } from '@/lib/entitlements';

const CATEGORY_WHITELIST: Set<string> = new Set(CATEGORIES.map(c => c.id));
import { extractBrandKeywords, queryTrademark } from '@/app/api/trademark/route';
import { getCachedResponse } from '@/lib/demo-cache';

interface TrademarkQueryResult {
  results: Array<{
    keyword: string;
    found: boolean;
    data?: {
      owner: string;
      regNo: string;
      status: string;
      classes: string[];
    };
    source: string;
  }>;
  foundCount: number;
}

// 商标查询并生成上下文（直接函数调用，不走HTTP）
async function getTrademarkContext(input: string): Promise<{ context: string; queryResult?: TrademarkQueryResult }> {
  try {
    const keywords = extractBrandKeywords(input);
    if (keywords.length === 0) {
      return { context: '' };
    }

    const results = await Promise.all(keywords.slice(0, 20).map(k => queryTrademark(k)));
    const data: TrademarkQueryResult = {
      results,
      foundCount: results.filter(r => r.found).length,
    };
    const registeredMarks = results.filter(r => r.found);

    if (registeredMarks.length === 0) {
      return { context: '', queryResult: data };
    }

    const context = `

## USPTO商标查询结果（实时检测）

检测到 ${registeredMarks.length} 个已注册商标：

${registeredMarks.map(mark => `
- **${mark.keyword}** (US Reg. No. ${mark.data?.regNo})
  - 权利人：${mark.data?.owner}
  - 状态：${mark.data?.status}
  - 商品/服务类别：${mark.data?.classes.join(', ')}
  - 风险提示：使用该商标或近似词汇可能存在侵权风险，需专业核查
`).join('\n')}

**风险规避建议：**
- 避免在listing标题/描述中直接使用上述商标
- 慎用"XX Style"、"XX Compatible"、"XX Type"等关联表述
- 注意拼写变体（如AirPod→AirPods）同样可能触发风险
- 建议改用通用产品描述（如"wireless earbuds"而非"AirPods-like"）

⚠️ 重要声明：本检测基于参考数据库（当前覆盖500+品牌/19大品类），存在漏检可能，检测结果仅供初步参考，不构成任何法律意见。所有商标相关决策请咨询持证商标律师。
`;

    return { context, queryResult: data };
  } catch (error) {
    console.error('Trademark query error:', error);
    return { context: '' };
  }
}

export async function POST(request: NextRequest) {
  let prompt: string;
  let input: string;
  let moduleId: string | undefined;
  let category: string | undefined;
  let fromPipeline = false;
  let dryRun = false;
  let skuId: string | undefined;
  try {
    const body = await request.json();
    prompt = body.prompt;
    input = body.input;
    moduleId = body.moduleId;
    category = body.category;
    fromPipeline = body.fromPipeline === true;
    dryRun = body.dryRun === true;
    if (typeof body.skuId === 'string') skuId = body.skuId;
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  // 向后兼容: 旧调用用 x-from-pipeline header (2026-04-20 前) · 下轮 deprecate
  if (!fromPipeline && request.headers.get('x-from-pipeline') === '1') {
    fromPipeline = true;
  }

  // category 白名单校验 · 防未知值注入破坏 prompt
  if (category && !CATEGORY_WHITELIST.has(category)) {
    return NextResponse.json(
      {
        error: `未知 category "${category}" · 合法值: ${Array.from(CATEGORY_WHITELIST).join(' / ')}`,
        code: 'INVALID_CATEGORY',
      },
      { status: 400 }
    );
  }

  // dryRun · 不调真 AI,返回请求参数验证快照供调试
  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      validated: {
        moduleId: moduleId || null,
        category: category || null,
        fromPipeline,
        inputLength: (input || '').length,
        promptLength: (prompt || '').length,
        categoryPrefix: category ? getCategoryPrefix(category).slice(0, 100) + '...' : null,
      },
    });
  }

  // 仅 demo 路径显式启用缓存回退，真实内测用户看到的永远是真 AI 结果或真实错误
  const url = new URL(request.url);
  const isDemoMode = process.env.NODE_ENV === 'development' && (
    url.searchParams.get('demo') === '1'
    || request.cookies.get('wenai_session')?.value?.includes('demo')
    || request.headers.get('x-demo-mode') === '1'
  );

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'qwen-plus';
  const endpoint = process.env.AI_ENDPOINT || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  if (!apiKey) {
    // Demo responses are only reachable in local development. Trial and production users
    // must see an explicit configuration error instead of cached sample output.
    if (isDemoMode) {
      return NextResponse.json({
        content: generateDemoResponse(input),
        usage: { promptTokens: 0, completionTokens: 0 },
        demo: true,
      });
    }
    return NextResponse.json(
      {
        error: 'AI 服务暂未启用。请先使用 CSV 决策工作台完成本地复盘，或联系团队开启生产服务。',
        code: 'AI_SERVICE_DISABLED',
      },
      { status: 503 }
    );
  }

  // 速率限制检查 — 优先按 JWT 用户名隔离，避免所有 beta 用户共享配额
  const tenantId = request.headers.get('x-tenant-id') || 'default';
  let rateKey: string = tenantId;
  let plan = 'free';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) {
        rateKey = payload.username; // 例：beta_alice / beta_wzqfriend
        plan = inferPlanFromUser(payload.role);
      }
    }
  } catch { /* ignore, fallback to tenant-id */ }

  // Pipeline 触发的请求已在 Pipeline 级别预占配额，跳过 per-module 限额
  // fromPipeline 已在 body 层读取 (含 header 向后兼容)
  if (moduleId && !fromPipeline) {
    const limit = await checkRateLimit(moduleId, rateKey, plan);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `今日调用次数已达上限，将于 ${new Date(limit.resetAt).toLocaleString('zh-CN')} 重置` },
        { status: 429 }
      );
    }

    // 成本闸 · 决策层模块 token 量差异大, 按 moduleId 分档估算
    // DeepSeek / qwen 计价 ~¥0.5/百万 token, 含输出保守估
    const moduleCostCents: Record<string, number> = {
      'batch-launch': 8,         // 矩阵输出 ~8K token
      'product-discovery': 5,    // 5-8 SKU 详细
      'ab-test': 5,              // 9 prompt 变体
      'data-insights': 5,        // 4-8 洞察 + SOP
      'customer-service': 4,     // 三版回复 + 钩子 + 升单
      'intent-mining': 4,        // 5-8 客群
      copywriting: 2,
      reviews: 2,
      'ip-compliance': 2,
      outreach: 2,
    };
    const estChatCents = moduleCostCents[moduleId] ?? 1;
    const cap = await checkCostCap(rateKey, estChatCents);
    if (!cap.allowed) {
      return NextResponse.json(
        {
          error: cap.reason ?? '今日成本配额已达上限',
          code: 'COST_CAP_REACHED',
          currentCny: +(cap.currentCents / 100).toFixed(2),
          capCny: +(cap.capCents / 100).toFixed(2),
        },
        { status: 429 }
      );
    }
    // 异步 fire-and-forget 写明细 · 不阻塞响应
    recordCostWithDetail(rateKey, estChatCents, {
      module: `chat:${moduleId}`,
      skuId,
      meta: { scenario: moduleId },
    }).catch(() => {});
  }

  // Per-module temperature: lower for deterministic tasks, higher for creative
  const MODULE_TEMPERATURE: Record<string, number> = {
    translate: 0.3,
    'ocr-translate': 0.3,
    'ip-compliance': 0.3,
    'customer-service': 0.5,
    reviews: 0.5,
    competitor: 0.6,
    selection: 0.6,
    operations: 0.6,
    leads: 0.6,
    copywriting: 0.8,
    content: 0.8,
    livestream: 0.8,
    positioning: 0.85,
    outreach: 0.7,
    video: 0.8,
    images: 0.8,
    'private-domain': 0.7,
    'data-insights': 0.4,
    'ad-optimizer': 0.4,
  };

  const temperature = moduleId ? (MODULE_TEMPERATURE[moduleId] ?? 0.7) : 0.7;
  const useStream = request.headers.get('accept') === 'text/event-stream';

  try {
    // IP合规模块：先查商标
    let trademarkContext = '';
    let trademarkQueryResult: TrademarkQueryResult | undefined;
    if (moduleId === 'ip-compliance') {
      const result = await getTrademarkContext(input);
      trademarkContext = result.context;
      trademarkQueryResult = result.queryResult;
    }

    // 品类专属前缀 — 差异化核心（见 category-prompts.ts）
    const categoryPrefix = category ? `\n\n${getCategoryPrefix(category)}\n\n` : '';

    // 商家行业上下文 (来自 /me/settings 自报) · 让推荐更贴他实际盘子
    // 决策类模块更受益, 文案类已经吃 category 不重复加
    let industryContext = '';
    let portfolioContext = '';
    const INDUSTRY_INJECT_MODULES = new Set([
      'product-discovery', 'data-insights', 'ab-test', 'intent-mining',
      'batch-launch', 'customer-service', 'operations', 'positioning',
      'competitor', 'selection', 'leads', 'ad-optimizer',
    ]);
    // 选品/数据洞察/竞品/定位/运营 这 5 个最需要看商家 portfolio
    const PORTFOLIO_INJECT_MODULES = new Set([
      'product-discovery', 'data-insights', 'competitor',
      'positioning', 'operations', 'selection',
    ]);
    if (moduleId && INDUSTRY_INJECT_MODULES.has(moduleId)) {
      try {
        const settings = await getUserSettings(rateKey);
        if (settings.industry && settings.industry.length > 0) {
          industryContext = `\n\n【商家自报行业上下文】\n${settings.industry.slice(0, 200)}\n\n按这个具体业务场景给建议, 不要泛泛而谈。\n\n`;
        }
      } catch { /* settings 读失败不阻塞主链路 */ }
    }
    if (moduleId && PORTFOLIO_INJECT_MODULES.has(moduleId)) {
      try {
        const recentSkus = await listSkus(rateKey, 8);
        if (recentSkus.length > 0) {
          // 优先取已上架 + 已测款的 (有 perf 数据更有信息量), 其次按时间
          const ranked = [...recentSkus].sort((a, b) => {
            const aHasPerf = a.performance?.testedAt ? 1 : 0;
            const bHasPerf = b.performance?.testedAt ? 1 : 0;
            if (aHasPerf !== bHasPerf) return bHasPerf - aHasPerf;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
          const top = ranked.slice(0, 5);
          const lines = top.map((s, i) => {
            const perfRaw = s.performance?.bestCtr ?? s.performance?.ctr;
            const cpcRaw = s.performance?.cpc;
            const perf = typeof perfRaw === 'number' ? perfRaw : null;
            const cpc = typeof cpcRaw === 'number' ? cpcRaw : null;
            const stats = perf !== null
              ? ` · CTR ${perf.toFixed(1)}%${cpc !== null ? ' / CPC ¥' + cpc.toFixed(2) : ''}`
              : '';
            return `${i + 1}. ${s.name} (${s.category}) · ${s.status}${stats}`;
          });
          portfolioContext = `\n\n【商家近期 SKU portfolio · ${top.length}/${recentSkus.length}】\n${lines.join('\n')}\n\n基于这份现状给建议, 避免推荐与已有 SKU 重叠 (除非明确说复盘老品)。\n\n`;
        }
      } catch { /* skus 读失败不阻塞主链路 */ }
    }

    const systemContent = prompt + categoryPrefix + industryContext + portfolioContext + (moduleId ? getReferenceContext(moduleId, input) : '') + trademarkContext;
    const requestBody = {
      model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: input },
      ],
      temperature,
      max_tokens: 4096,
      stream: useStream,
    };

    // Retry logic: up to 2 retries with exponential backoff
    const MAX_RETRIES = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          // Don't retry on 4xx (client errors)
          if (response.status >= 400 && response.status < 500) {
            throw new Error(`AI API错误 (${response.status}): ${errText}`);
          }
          lastError = new Error(`AI API错误 (${response.status}): ${errText}`);
          continue; // retry on 5xx
        }

        // SSE streaming response
        if (useStream && response.body) {
          const encoder = new TextEncoder();
          const decoder = new TextDecoder();
          let fullContent = '';

          const stream = new ReadableStream({
            async start(ctrl) {
              const reader = response.body!.getReader();
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split('\n');

                  for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                      const parsed = JSON.parse(data);
                      const delta = parsed.choices?.[0]?.delta?.content || '';
                      if (delta) {
                        fullContent += delta;
                        ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ delta, content: fullContent })}\n\n`));
                      }
                    } catch { /* skip malformed chunks */ }
                  }
                }
                // Send final event with usage
                ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, content: fullContent, trademarkQuery: trademarkQueryResult })}\n\n`));
                ctrl.close();
              } catch (err) {
                ctrl.error(err);
              }

              // Log usage (estimated from content length)
              const estimatedTokens = Math.ceil(fullContent.length / 2);
              if (moduleId) logUsageEntry(moduleId, estimatedTokens, undefined, tenantId, request.headers.get('x-username') || undefined);
            },
          });

          return new Response(stream, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }

        // Non-streaming response
        const data = await response.json();
        const totalTokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);
        if (moduleId) logUsageEntry(moduleId, totalTokens, undefined, tenantId, request.headers.get('x-username') || undefined);
        return NextResponse.json({
          content: data.choices[0].message.content,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
          },
          trademarkQuery: trademarkQueryResult,
        });
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (err instanceof Error && err.name === 'AbortError') {
          lastError = new Error('请求超时(30s)');
        }
        // Don't retry on abort
        if (err instanceof Error && err.name === 'AbortError') break;
        continue;
      }
    }

    // All retries exhausted. Cached responses are development-only so trial users never
    // mistake sample output for a real AI result.
    if (isDemoMode) {
      const cached = moduleId ? getCachedResponse(moduleId) : null;
      if (cached) {
        return NextResponse.json({
          content: cached + '\n\n---\n*⚡ 预缓存响应（AI服务暂时不可用）*',
          usage: { promptTokens: 0, completionTokens: 0 },
          cached: true,
        });
      }
    }
    return NextResponse.json(
      { error: lastError?.message || 'AI 服务繁忙，请稍后重试', retryable: true },
      { status: 503 }
    );
  } catch (error) {
    if (isDemoMode) {
      const cached = moduleId ? getCachedResponse(moduleId) : null;
      if (cached) {
        return NextResponse.json({
          content: cached + '\n\n---\n*⚡ 预缓存响应（AI服务异常）*',
          usage: { promptTokens: 0, completionTokens: 0 },
          cached: true,
        });
      }
    }
    return NextResponse.json(
      { error: `请求失败: ${error instanceof Error ? error.message : '未知错误'}`, retryable: true },
      { status: 500 }
    );
  }
}

function generateDemoResponse(input: string): string {
  return `## Demo模式

> AI 服务暂未启用。当前仅展示本地预览，请使用 CSV 决策工作台完成可验证复盘。

**输入预览：**
${input.substring(0, 200)}${input.length > 200 ? '...' : ''}`;
}
