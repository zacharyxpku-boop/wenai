import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { checkCostCap, recordCostWithDetail } from '@/lib/cost-cap';
import { logUsageEntry } from '@/lib/usage';

/**
 * 批量上架 · 分片处理
 *
 * 老路: 一次跑 20 SKU = 单次 LLM 调用 ~8K token, 截断风险高, 上限锁死 20
 * 新路: 前端切成 chunk (每片 ≤8 SKU) 并发调本接口, 服务端只处理一片
 *      → 100 SKU 上限 (12-13 chunks × 5s ≈ 1 分钟全做完)
 *
 * 服务端只负责单片 SkuPlan 数组生成, 整体策略/checklist/风险走单独 chunkType=overall
 * 前端聚合所有 chunk 结果合成完整 BatchPlan
 *
 * 入参:
 *   chunkType: 'overall' | 'plans'
 *     - overall: 只生成 overallStrategy + estimatedTotalCost + globalChecklist + riskFlags + 计划摘要 (无 stages 详情)
 *     - plans: 给定 SKU 子集, 输出 stages 详情数组
 *   skus: string[] (本片要处理的 SKU 文本行)
 *   stages: Stage[]
 *   platform: Platform
 *   brandContext: string
 *   totalCount: number (整批 SKU 总数, overall 模式估算用)
 *   skuId?: string (如果商家是从某个 SKU 详情页跳进来, 关联成本)
 */

type Stage = 'discovery' | 'photoshoot' | 'video' | 'social' | 'abtest' | 'listing' | 'insights';
type Platform = 'amazon' | 'tmall' | 'pdd' | 'tiktok' | 'douyin' | 'xiaohongshu' | 'shopify' | 'mixed';

const STAGE_TXT: Record<Stage, string> = {
  discovery: '选品验证',
  photoshoot: 'AI 影棚',
  video: 'AI 视频',
  social: '内容拆解包',
  abtest: '测款 A-B',
  listing: '上新流水线',
  insights: '数据洞察',
};

const PLATFORM_TXT: Record<Platform, string> = {
  amazon: 'Amazon',
  tmall: '淘宝/天猫',
  pdd: '拼多多',
  tiktok: 'TikTok Shop',
  douyin: '抖音电商',
  xiaohongshu: '小红书',
  shopify: '独立站',
  mixed: '多渠道',
};

interface ChunkBody {
  chunkType: 'overall' | 'plans';
  skus: string[];
  stages: Stage[];
  platform: Platform;
  brandContext?: string;
  totalCount: number;
  skuId?: string;
}

export async function POST(req: NextRequest) {
  let body: ChunkBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const { chunkType, skus, stages, platform, brandContext, totalCount, skuId } = body;

  if (!Array.isArray(skus) || skus.length === 0) {
    return NextResponse.json({ error: 'skus 不能为空' }, { status: 400 });
  }
  if (skus.length > 10) {
    return NextResponse.json({ error: '单片 SKU 不能超过 10 个 (避免输出截断)' }, { status: 400 });
  }
  if (!Array.isArray(stages) || stages.length === 0) {
    return NextResponse.json({ error: 'stages 不能为空' }, { status: 400 });
  }

  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || 'qwen-plus';
  const endpoint = process.env.AI_ENDPOINT || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

  if (!apiKey) {
    return NextResponse.json(
      { error: '批量上新 AI 服务暂未启用。请先导出上新规格，或使用 CSV 决策工作台完成本地复盘。', code: 'AI_SERVICE_DISABLED' },
      { status: 503 }
    );
  }

  const orgId = await resolveOrgId(req);

  // 单片成本估算 · overall 模式较轻 (3 cents), plans 模式按 SKU 数 (1 cent/SKU)
  const estCents = chunkType === 'overall' ? 3 : Math.max(2, skus.length);
  const cap = await checkCostCap(orgId, estCents);
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

  const prompt = chunkType === 'overall'
    ? buildOverallPrompt(totalCount, stages, platform, brandContext)
    : buildPlansPrompt(skus, stages, platform, brandContext);

  const userInput = chunkType === 'overall'
    ? `批次总览: 共 ${totalCount} 个 SKU, 平台 ${PLATFORM_TXT[platform]}, 工序 ${stages.map(s => STAGE_TXT[s]).join(' → ')}`
    : `本片 ${skus.length} 个 SKU:\n${skus.join('\n')}`;

  const requestBody = {
    model,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: userInput },
    ],
    temperature: 0.7,
    max_tokens: chunkType === 'overall' ? 1500 : 4000,
  };

  // 重试 1 次
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 1000));
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const errText = await res.text();
        if (res.status >= 400 && res.status < 500) {
          return NextResponse.json({ error: `AI API 错误 (${res.status}): ${errText.slice(0, 200)}` }, { status: 502 });
        }
        lastError = new Error(`AI API ${res.status}: ${errText.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const content: string = data.choices?.[0]?.message?.content || '';
      const totalTokens = (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

      // 提取 JSON
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) {
        return NextResponse.json(
          { error: 'AI 输出非 JSON', raw: content.slice(0, 500) },
          { status: 502 }
        );
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(m[0]);
      } catch (err) {
        return NextResponse.json(
          { error: `JSON 解析失败: ${err instanceof Error ? err.message : 'unknown'}`, raw: content.slice(0, 500) },
          { status: 502 }
        );
      }

      // 写成本明细 · 关联 chunkType 和 skuId (如果有)
      recordCostWithDetail(orgId, estCents, {
        module: `batch-launch:${chunkType}`,
        skuId,
        meta: { scenario: chunkType, count: skus.length },
      }).catch(() => {});

      logUsageEntry('batch-launch', totalTokens, undefined, orgId, undefined);

      return NextResponse.json({
        chunkType,
        result: parsed,
        chunkSize: skus.length,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
        },
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (err instanceof Error && err.name === 'AbortError') {
        lastError = new Error('请求超时(25s)');
        break;
      }
    }
  }

  return NextResponse.json(
    { error: lastError?.message || 'AI 服务繁忙', retryable: true },
    { status: 503 }
  );
}

function buildOverallPrompt(totalCount: number, stages: Stage[], platform: Platform, brandContext?: string): string {
  return `
你是一个跨境/本土电商 15 年的品牌操盘手 + 项目经理, 帮商家做 ${totalCount} 个 SKU 的批量上架顶层规划。
本次任务: 只产出整批的 overall 维度信息 (不输出单 SKU 详情, 那些会分片单独处理)。

【商家信息】
- 目标平台: ${PLATFORM_TXT[platform]}
- 选定工序: ${stages.map(s => STAGE_TXT[s]).join(' → ')}
- 品牌上下文: ${brandContext || '无'}
- 总 SKU 数: ${totalCount}

【任务】
1. overallStrategy (80-150 字): 整体策略, 含品类节奏 / 上架时机 / 资源分配 / 哪些先上哪些等
2. estimatedTotalCost: 总成本估算 (含 wenai 模块开销 + 人工)
3. estimatedDuration: 总耗时
4. globalChecklist (4-7 条): 全局必做 (合规 / 商标 / AIGC 标识 / 平台规则)
5. riskFlags (2-4 条): 风险预警
6. 如果包含内容拆解包, overallStrategy 需要说明哪些 SKU 先做 benchmark-to-campaign 测试, 哪些 SKU 等待素材补齐

【硬要求】
- 数字必须具体: ¥80-150 / 1-2 天 / CTR > 3% 这种, 不接受空话
- checklist 必须可执行 (动词开头)
- riskFlags 给到具体应对建议, 不是空喊

【输出严格 JSON】
{
  "overallStrategy": "<整体策略 80-150 字>",
  "estimatedTotalCost": "<总成本>",
  "estimatedDuration": "<总耗时>",
  "globalChecklist": ["<必做 1>", "<必做 2>", "..."],
  "riskFlags": ["<风险 1>", "<风险 2>"]
}

直接输出 JSON, 不要 markdown 标签, 不要解释。
`.trim();
}

function buildPlansPrompt(skus: string[], stages: Stage[], platform: Platform, brandContext?: string): string {
  return `
你是一个跨境/本土电商 15 年的品牌操盘手 + 项目经理, 现在帮商家做 ${skus.length} 个 SKU 的工序详情规划 (本片是整批的一部分)。

【商家信息】
- 目标平台: ${PLATFORM_TXT[platform]}
- 选定工序: ${stages.map(s => STAGE_TXT[s]).join(' → ')}
- 品牌上下文: ${brandContext || '无'}

【本片 SKU】
${skus.join('\n')}

【任务】
对每个 SKU, 在每个选定工序里给:
- prompt: 该 SKU 在该工序的推荐 prompt (具体, 可直接拷)
- params: 推荐参数 (尺寸 / 数量 / 比例 / 风格)
- expectedOutput: 预期产出物
- estimatedTime: 单 SKU 在这步的预计耗时
- checkCriteria: 验收硬标准 (数字化, 例 CTR > X%)

外加:
- positioning: 该 SKU 在批次中的定位 (30-60 字)
- category: 细分类目

【硬要求】
- 每个 SKU 的工序 prompt 不能千篇一律, 要根据该 SKU 的细分类目调整
- params 要具体 (1024x1536 / n=2 / quality=medium 这种)
- checkCriteria 要数字化
- positioning 给真实定位判断, 不是空话
- 如果 stage=social, 必须按 benchmark-to-campaign 输出: 产品读图、搜索地图、benchmark 方向、Audience/Product/Context/Hook/Timeline/CTA 拆解模板、产品改编脚本、素材 manifest、7 天测试排期和复盘指标
- 如果没有真实参考链接, social 的 checkCriteria 必须标注"待补 benchmark URL / 竞品账号 / 真实评论证据", 不能伪装成已调研
- social 的验收标准不能写"爆款", 必须写 CTR、3 秒停留、完播率、save rate、valuable comments、加购或询盘等可复盘指标

【输出严格 JSON】
{
  "skuPlans": [
    {
      "skuName": "<SKU 名>",
      "category": "<细分类目>",
      "positioning": "<定位>",
      "stages": [
        {
          "stage": "${stages[0]}",
          "prompt": "<推荐 prompt>",
          "params": "<推荐参数>",
          "expectedOutput": "<预期产出>",
          "estimatedTime": "<耗时>",
          "checkCriteria": "<验收标准>"
        }
      ]
    }
  ]
}

直接输出 JSON, 不要 markdown 标签, 不要解释。
`.trim();
}
