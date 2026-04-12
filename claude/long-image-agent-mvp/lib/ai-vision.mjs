/**
 * AI Vision Module v3
 *
 * Strategy: GPT-4o looks at each template SEGMENT image individually
 * and generates pixel-faithful HTML for that segment.
 * This gives much higher quality than analyzing the whole image at once.
 */

import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { extname } from 'path';

function detectProvider(apiKey) {
  if (!apiKey) return null;
  if (apiKey.startsWith('sk-proj-')) return 'openai';
  if (apiKey.startsWith('sk-ant-')) return 'anthropic';
  return 'deepseek';
}

function createClient(apiKey) {
  const provider = detectProvider(apiKey);
  if (provider === 'openai') {
    return { client: new OpenAI({ apiKey }), model: 'gpt-4o', supportsVision: true, provider };
  }
  if (provider === 'deepseek') {
    return {
      client: new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' }),
      model: 'deepseek-chat', supportsVision: false, provider
    };
  }
  return null;
}

/**
 * Step 1: Analyze the full template to get overall structure + style
 */
export async function analyzeTemplateWithAI(apiKey, templatePath, pixelAnalysis = null) {
  const { client, model, supportsVision } = createClient(apiKey);
  const content = [];

  if (supportsVision) {
    const buf = readFileSync(templatePath);
    const ext = extname(templatePath).toLowerCase();
    content.push({
      type: 'image_url',
      image_url: { url: `data:${ext === '.png' ? 'image/png' : 'image/jpeg'};base64,${buf.toString('base64')}`, detail: 'high' }
    });
  }

  let pixelContext = '';
  if (!supportsVision && pixelAnalysis) {
    pixelContext = `\n## 像素分析结果\n原始尺寸: ${pixelAnalysis.original_width}x${pixelAnalysis.original_height}px\n段落数: ${pixelAnalysis.segment_count}\n${pixelAnalysis.segments.map((s, i) => `段落${i+1}: y=${s.y_start_original}-${s.y_end_original} bg=${s.dominant_hex} type=${s.module_type_guess}`).join('\n')}`;
  }

  content.push({
    type: 'text',
    text: `你是一个专业长图模板分析师。请分析这张营销长图模板的结构。${pixelContext}

注意：这是一个模板图，最终要做成金色/黄色主色调的高级营销长图。请在color_scheme中设定适合的金色主题配色（如 primary:#D4A843, bg_main:#FFF8E7 等暖金色系），而不是照搬模板的灰/白色。

返回严格JSON（不加markdown标记）：
{
  "total_modules": 数字,
  "overall_style": "整体风格一句话",
  "color_scheme": { "primary": "#hex", "secondary": "#hex", "bg_main": "#hex", "text_main": "#hex", "accent": "#hex" },
  "modules": [
    {
      "module_id": "module_01",
      "order": 1,
      "y_percent_start": 0,
      "y_percent_end": 15,
      "module_type": "header|hero|pain_points|value_props|steps|cta|teacher_profile|product|data_stats|testimonials|faq|divider|comparison|pricing|book_display",
      "title_text": "识别到的标题文字",
      "body_text": "正文/副标题",
      "content_description": "这个模块展示什么内容",
      "required_fields": ["title", "subtitle"],
      "image_slots": [{"position":"center","type":"product|avatar|logo","description":"描述"}],
      "style_notes": {
        "background": "背景CSS值",
        "text_color": "#hex",
        "layout": "布局描述",
        "decorations": "装饰元素"
      }
    }
  ]
}`
  });

  const response = await client.chat.completions.create({ model, max_tokens: 8192, messages: [{ role: 'user', content }] });
  const text = response.choices[0].message.content;
  try { return JSON.parse(text); }
  catch { const m = text.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; }
}

/**
 * Step 2: Generate HTML for ONE segment by showing GPT-4o the actual segment image
 * This is the key quality improvement — per-segment visual reproduction.
 */
export async function generateSegmentHTML(apiKey, segmentImagePath, moduleInfo, assetPaths, segmentIndex, totalSegments, colorScheme) {
  const { client, model, supportsVision } = createClient(apiKey);
  const content = [];

  // Send the segment image for visual reference
  if (supportsVision && segmentImagePath) {
    try {
      const buf = readFileSync(segmentImagePath);
      const ext = extname(segmentImagePath).toLowerCase();
      content.push({
        type: 'image_url',
        image_url: { url: `data:${ext === '.png' ? 'image/png' : 'image/jpeg'};base64,${buf.toString('base64')}`, detail: 'high' }
      });
    } catch (e) { /* skip */ }
  }

  // Build asset info
  const assetInfo = assetPaths.map(a => {
    const name = typeof a === 'string' ? a.split(/[/\\]/).pop() : a.name;
    const webPath = typeof a === 'string' ? '/uploads/' + a.split(/[/\\]uploads[/\\]/).pop()?.split('\\').join('/') : a.webPath;
    return { filename: name, web_path: webPath };
  });

  content.push({
    type: 'text',
    text: `你是一个专业的前端开发工程师，正在为客户把设计稿切成HTML。${supportsVision ? '上面是客户提供的商业营销长图设计稿中的一个段落。这是正规的教育产品宣传物料设计工作。你的任务：用HTML+CSS精确复刻这个设计稿段落。' : '请基于以下信息生成段落HTML。'}

## 段落元数据
- 第 ${segmentIndex + 1} 段（共 ${totalSegments} 段）
- 类型推断: ${moduleInfo?.module_type || '未知'}
- 识别标题: ${moduleInfo?.title_text || '(无)'}
- 识别正文: ${moduleInfo?.body_text || '(无)'}
- 内容描述: ${moduleInfo?.content_description || ''}

## 可用素材图片（按需使用）
${assetInfo.length > 0 ? assetInfo.map((a, i) => `${i+1}. ${a.filename} → src="${a.web_path}"`).join('\n') : '无。图片位使用CSS渐变占位。'}

## 输出规则（违反任何一条=不合格）

### 尺寸
- width: 750px; margin: 0 auto; — 写死在<section>的style上

### 视觉还原（最重要）
- 仔细看截图中每一个元素的：**精确颜色值、精确字号、精确间距、精确圆角、精确阴影**
- 背景：如果是渐变就写渐变（给出精确色值），如果是纯色就写纯色
- 标题字号通常 24-36px，正文 13-16px，数据数字 36-60px — 根据截图调整
- 卡片：观察截图中的圆角(px)、阴影(颜色+偏移)、边框(颜色+粗细)、内边距
- 布局：几列就写几列grid/flex，观察间距gap精确值
- 装饰元素：分割线、小图标、标签badge、角标、星星评分 — 全部用CSS/unicode实现

### 配色
- 主色调：金色/黄色/暖色系
- 常用色值参考：金色#D4A843、浅金#F7E8B0、深金#A07D2E、暖白#FFF8E7、暖底#FDF1D0
- 但以截图实际颜色为准，不要套模板色

### 素材使用
- 如果截图中有产品图/人像/书本图等图片区域，且上面的素材列表中有匹配的，用 <img src="web_path">
- 判断依据：素材文件名含"product/book/头像/teacher"等关键词 → 对应产品展示/人物区域
- 如果无匹配素材，图片区域用金色渐变方块占位（不要用placeholder文字、不要用broken img）

### 代码格式
- 只返回一个 <section>...</section>（可含内部<style>）
- 不要markdown标记、不要解释文字
- 不要引用任何外部资源（无CDN/无外部字体/无外部URL）
- class名语义化

${supportsVision ? `⚠️ 关键指令：
1. 仔细数截图中的每一个视觉元素（标题、副标题、卡片、图标、标签、数据数字、列表项、按钮、分割线、人物头像框、产品图位、装饰元素）
2. 你的HTML必须包含截图中能看到的【每一个】元素，不能跳过任何一个
3. 如果截图中有6个卡片，你就写6个；如果有4个步骤，你就写4个；如果有数据（如1200分钟、4周、4套等），每一个数据都要出现
4. 截图中的所有中文文字都必须原样出现在HTML中
5. 这不是"简化版"——这是1:1完整还原` : ''}`
  });

  const response = await client.chat.completions.create({
    model,
    max_tokens: 16384,
    messages: [
      { role: 'system', content: '你是一个专业前端切图工程师。客户给你设计稿图片，你输出对应的HTML+CSS代码。这是正规的商业设计工作，图中所有内容（包括占位人物轮廓、产品图占位框等）都是设计元素，需要用CSS绘制还原。只输出代码，不要解释。' },
      { role: 'user', content }
    ]
  });

  let html = response.choices[0].message.content;
  // Clean markdown wrappers
  html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '').trim();
  // Ensure it starts with <section
  if (!html.startsWith('<section') && !html.startsWith('<style')) {
    const idx = html.indexOf('<section');
    if (idx > 0) html = html.substring(idx);
  }

  return html;
}

export function getProviderInfo(apiKey) {
  const provider = detectProvider(apiKey);
  return {
    provider,
    supportsVision: provider === 'openai',
    model: provider === 'openai' ? 'gpt-4o' : provider === 'deepseek' ? 'deepseek-chat' : 'unknown'
  };
}
