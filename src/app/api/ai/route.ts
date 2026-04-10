import { NextRequest, NextResponse } from 'next/server';
import { getReferenceContext } from '@/lib/references';
import { logUsageEntry } from '@/lib/usage';

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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: prompt + (moduleId ? getReferenceContext(moduleId) : '') },
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
