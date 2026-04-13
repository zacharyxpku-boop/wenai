import { NextRequest, NextResponse } from 'next/server';
import { getReferenceContext } from '@/lib/references';
import { logUsageEntry } from '@/lib/usage';
import { checkRateLimit } from '@/lib/ratelimit';
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

⚠️ 重要声明：本检测基于有限参考数据库（当前覆盖约15个高频品牌），存在漏检可能，检测结果仅供初步参考，不构成任何法律意见。所有商标相关决策请咨询持证商标律师。
`;

    return { context, queryResult: data };
  } catch (error) {
    console.error('Trademark query error:', error);
    return { context: '' };
  }
}

export async function POST(request: NextRequest) {
  let prompt: string, input: string, moduleId: string | undefined;
  try {
    ({ prompt, input, moduleId } = await request.json());
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'qwen-plus';
  const endpoint = process.env.AI_ENDPOINT || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  if (!apiKey) {
    return NextResponse.json({
      content: generateDemoResponse(input),
      usage: { promptTokens: 0, completionTokens: 0 },
      demo: true,
    });
  }

  // 速率限制检查
  const tenantId = request.headers.get('x-tenant-id') || 'default';
  if (moduleId) {
    const limit = await checkRateLimit(moduleId, tenantId);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `今日调用次数已达上限，将于 ${new Date(limit.resetAt).toLocaleString('zh-CN')} 重置` },
        { status: 429 }
      );
    }
  }

  try {
    // IP合规模块：先查商标
    let trademarkContext = '';
    let trademarkQueryResult;
    if (moduleId === 'ip-compliance') {
      const result = await getTrademarkContext(input);
      trademarkContext = result.context;
      trademarkQueryResult = result.queryResult;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: prompt + (moduleId ? getReferenceContext(moduleId) : '') + trademarkContext },
          { role: 'user', content: input },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      // Fallback to cached response on API error
      const cached = moduleId ? getCachedResponse(moduleId) : null;
      if (cached) {
        return NextResponse.json({
          content: cached + '\n\n---\n*⚡ 预缓存响应（AI服务暂时不可用）*',
          usage: { promptTokens: 0, completionTokens: 0 },
          cached: true,
        });
      }
      return NextResponse.json({ error: `AI API错误: ${error}` }, { status: 500 });
    }

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
  } catch (error) {
    // Fallback to cached response on timeout/network error
    const cached = moduleId ? getCachedResponse(moduleId) : null;
    if (cached) {
      return NextResponse.json({
        content: cached + '\n\n---\n*⚡ 预缓存响应（AI服务超时）*',
        usage: { promptTokens: 0, completionTokens: 0 },
        cached: true,
      });
    }
    return NextResponse.json(
      { error: `请求失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

function generateDemoResponse(input: string): string {
  return `## Demo模式

> 未配置 AI_API_KEY，请在 .env.local 中设置。

**输入预览：**
${input.substring(0, 200)}${input.length > 200 ? '...' : ''}`;
}
