const express = require('express');
const cors = require('cors');
const path = require('path');
const { load } = require('cheerio');
const fs = require('fs');

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
}

const API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const API_BASE = process.env.AI_BASE_URL || 'https://api.deepseek.com';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

// ── Fetch URL content ──
app.post('/api/fetch-url', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await resp.text();
    const $ = load(html);

    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header, noscript, iframe, svg').remove();

    const title = $('title').text().trim();
    const metaDesc = $('meta[name="description"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const h1 = $('h1').map((_, el) => $(el).text().trim()).get().join(' | ');
    const h2 = $('h2').map((_, el) => $(el).text().trim()).get().join(' | ');
    const h3 = $('h3').map((_, el) => $(el).text().trim()).get().join(' | ');

    // Get visible text, limit to ~4000 chars
    let bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    if (bodyText.length > 4000) bodyText = bodyText.substring(0, 4000) + '...';

    // Get pricing info if any
    const pricingText = $('[class*="price"], [class*="pricing"], [id*="price"], [id*="pricing"]')
      .map((_, el) => $(el).text().trim()).get().join(' | ');

    res.json({
      title,
      description: metaDesc || ogDesc,
      headings: { h1, h2, h3 },
      bodyText,
      pricingText,
      url,
    });
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch URL: ' + err.message });
  }
});

// ── AI Analysis ──
app.post('/api/analyze', async (req, res) => {
  const { productName, productDesc, targetUsers, corePromise, testAreas, focusAreas, extraMaterials, sampleSize, fetchedContent } = req.body;

  if (!productName) return res.status(400).json({ error: 'Product name is required' });

  const N = sampleSize || 100;

  const systemPrompt = `你是一个"AI Beta 用户研究实验室"的首席分析师。你的任务是模拟 ${N} 个随机真实用户体验一个产品，然后输出统计分析报告。

核心原则：
- 站在真实用户视角，模拟用户有限的信息状态
- 只基于用户可见信息判断，不允许使用开发者知识
- 允许用户误解、犹豫、放弃、不信任
- 输出是统计汇总 + 按问题分组的精选案例，不是逐个画像展示

你必须输出严格的 JSON 格式，不要输出任何其他文字。`;

  const productInfo = `【产品信息】
产品名称：${productName}
一句话描述：${productDesc || '未提供'}
目标用户：${targetUsers || '未提供'}
核心承诺：${corePromise || '未提供'}
重点测试环节：${testAreas || '未提供'}
本次关注：${focusAreas || '未提供'}

${extraMaterials ? '【补充材料】\n' + extraMaterials : ''}

${fetchedContent ? '【从产品页面抓取的信息】\n标题：' + fetchedContent.title + '\n描述：' + fetchedContent.description + '\n主要标题：' + (fetchedContent.headings?.h1 || '') + ' | ' + (fetchedContent.headings?.h2 || '') + '\n页面内容摘要：' + (fetchedContent.bodyText || '').substring(0, 3000) + (fetchedContent.pricingText ? '\n定价信息：' + fetchedContent.pricingText : '') : ''}`;

  const userPrompt = `请假设你已经模拟了 ${N} 个随机用户体验以下产品的全流程。这 ${N} 个用户覆盖了不同年龄、技术水平、行业背景、使用动机、耐心程度、信任阈值。

${productInfo}

基于这 ${N} 个模拟用户的体验结果，请严格按以下 JSON 结构输出统计分析报告（不要输出任何其他内容，直接输出JSON）：

{
  "sampleSize": ${N},
  "scores": [
    { "label": "任务完成度", "score": 0-100, "level": "high/mid/low" },
    { "label": "认知清晰度", "score": 0-100, "level": "high/mid/low" },
    { "label": "风险与信任", "score": 0-100, "level": "high/mid/low" },
    { "label": "价值感知", "score": 0-100, "level": "high/mid/low" },
    { "label": "回访可能性", "score": 0-100, "level": "high/mid/low" },
    { "label": "整体 Beta 就绪度", "score": 0-100, "level": "high/mid/low" }
  ],
  "statistics": {
    "completionRate": "XX%（成功完成核心任务的用户比例）",
    "dropoffRate": "XX%（中途放弃的用户比例）",
    "avgConfidence": "XX/100（完成用户的平均信心值）",
    "avgTimeToValue": "描述首次感知到价值的平均时间",
    "willReturn": "XX%（表示愿意再次使用的比例）",
    "willRecommend": "XX%（表示愿意推荐给别人的比例）",
    "topDropoffPoint": "最多用户放弃的环节名称",
    "topDropoffPercent": "XX%"
  },
  "userDistribution": [
    { "type": "用户类型名", "percent": "XX%", "completionRate": "XX%", "verdict": "pass/partial/fail 中最多的" }
  ],
  "funnelSteps": [
    { "step": "环节名称", "reachRate": "XX%", "dropRate": "XX%", "avgConfidence": 数字 }
  ],
  "jtbd": ["用户核心任务1", "用户核心任务2", "..."],
  "coreContradiction": "核心矛盾描述（200字以内）",
  "assumptions": ["假设1", "假设2", "..."],
  "problemGroups": [
    {
      "id": "problem-1",
      "priority": "p0/p1/p2",
      "title": "问题标题",
      "desc": "问题描述",
      "affectedPercent": "XX%（受此问题影响的用户比例）",
      "categories": ["Findability", "Comprehension", "Workflow friction", "Trust", "Value communication", "Pricing", "Migration cost", "Activation gap", "Retention gap"],
      "improves": "改善什么（激活率/信任/留存/转化率）",
      "representativeCase": {
        "emoji": "一个emoji",
        "name": "用户昵称",
        "type": "用户类型",
        "background": "一句话背景",
        "goal": "本次目标",
        "steps": [
          {
            "title": "步骤标题",
            "conf": 0-100,
            "trust": "up/down/flat",
            "thought": "用户内心独白",
            "action": "用户实际行为"
          }
        ],
        "verdict": "pass/partial/fail",
        "verdictText": "一句话结论"
      }
    }
  ],
  "actions": [
    {
      "priority": "p0/p1/p2",
      "title": "建议标题",
      "what": "具体改什么",
      "why": "为什么",
      "improves": "改善什么",
      "estimatedImpact": "预计影响 XX% 的用户"
    }
  ],
  "validation": [
    {
      "title": "验证标题",
      "who": "找谁",
      "task": "给什么任务",
      "observe": "观察什么",
      "why": "为什么要验证这个"
    }
  ]
}

要求：
- userDistribution 至少覆盖 6-8 种用户类型
- funnelSteps 按产品使用流程排列，展示每一步的到达率和流失率
- problemGroups 至少 5-8 个问题，按 priority 排序（P0在前）
- 每个 problemGroup 必须有一个 representativeCase，含 3-5 个 steps
- actions 至少 5-7 条具体建议
- 所有百分比数据要基于 ${N} 人样本合理推算
- score 的 level：>= 65 为 high，35-64 为 mid，< 35 为 low`;

  try {
    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const apiResp = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!apiResp.ok) {
      const errText = await apiResp.text();
      console.error('Kimi API error:', apiResp.status, errText);
      res.write(`data: ${JSON.stringify({ error: 'Kimi API error: ' + apiResp.status })}\n\n`);
      res.end();
      return;
    }

    // Stream the response
    const reader = apiResp.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullContent += delta;
            // Send progress updates
            res.write(`data: ${JSON.stringify({ delta, progress: Math.min(fullContent.length / 100, 95) })}\n\n`);
          }
        } catch (e) { /* ignore parse errors in stream */ }
      }
    }

    // Parse the full JSON from the response
    let jsonContent = fullContent.trim();
    // Extract JSON if wrapped in markdown code block
    const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonContent = jsonMatch[1].trim();
    // Also try to find JSON object directly
    if (!jsonContent.startsWith('{')) {
      const startIdx = jsonContent.indexOf('{');
      if (startIdx !== -1) jsonContent = jsonContent.substring(startIdx);
    }
    const lastBrace = jsonContent.lastIndexOf('}');
    if (lastBrace !== -1) jsonContent = jsonContent.substring(0, lastBrace + 1);

    try {
      const result = JSON.parse(jsonContent);
      res.write(`data: ${JSON.stringify({ done: true, result })}\n\n`);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      // Send raw content for debugging
      res.write(`data: ${JSON.stringify({ done: true, rawContent: fullContent, error: 'JSON parse failed' })}\n\n`);
    }

    res.end();
  } catch (err) {
    console.error('Analysis error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

const PORT = 3459;
app.listen(PORT, () => {
  console.log(`AI Beta Lab server running at http://localhost:${PORT}`);
});
