import { NextRequest, NextResponse } from 'next/server';
import { getReferenceContext } from '@/lib/references';
import { logUsageEntry } from '@/lib/usage';
import { checkRateLimit } from '@/lib/ratelimit';
import { extractBrandKeywords, queryTrademark } from '@/app/api/trademark/route';

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
  - 风险：使用该商标或近似词汇构成高风险侵权
`).join('\n')}

**使用规则：**
- 禁止在listing标题/描述中直接使用上述商标
- 禁止使用"XX Style"、"XX Compatible"、"XX Type"等关联用法
- 即使拼写变体（如AirPod→AirPods、XM→Xiaomi）也构成侵权
- 建议改用通用产品描述（如"wireless earbuds"而非"AirPods-like"）

⚠️ 免责声明：以上结果基于有限本地数据库，不构成法律意见。高风险项请咨询专业商标律师。
`;

    return { context, queryResult: data };
  } catch (error) {
    console.error('Trademark query error:', error);
    return { context: '' };
  }
}

export async function POST(request: NextRequest) {
  const { prompt, input, moduleId } = await request.json();

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
    const limit = checkRateLimit(moduleId, tenantId);
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
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `AI API错误: ${error}` }, { status: 500 });
    }

    const data = await response.json();
    const totalTokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);
    if (moduleId) logUsageEntry(moduleId, totalTokens);
    return NextResponse.json({
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
      },
      trademarkQuery: trademarkQueryResult, // 返回商标查询结果供前端显示
    });
  } catch (error) {
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
