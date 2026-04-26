/**
 * AIGC 合规工具 · 借鉴 clico/src/lib/aigc-checklists.ts
 *
 * 中国深度合成规定 (2023 年起施行) + PIPL + GB/T 42888 要求:
 *   1. AI 生成内容必须有"显著标识"(视觉水印 / 元数据 / 文本声明)
 *   2. 涉人像的合成需获被合成人授权
 *   3. 发布到抖音/视频号/小红书需勾平台 AIGC 标签
 *
 * wenai 实现策略:
 *   - 客户端 canvas 给图片打可视水印 (下载/分享前自动应用)
 *   - 所有 API 返回的生成结果带 aigcMetadata 字段
 *   - <AigcBanner /> 组件提示用户去平台标 AIGC
 *   - 提供平台披露文案直接复制
 */

export interface AigcMetadata {
  isAIGenerated: true;
  generator: string; // 'gpt-image-1' | 'wanx2.1-i2v' | 'gemini-2.5-flash' 等
  generatedAt: string; // ISO 时间戳
  module: string; // 'ai-photoshoot' | 'ai-video' | 'video-teardown' 等
  complianceNote: string;
}

export function buildAigcMetadata(generator: string, module: string): AigcMetadata {
  return {
    isAIGenerated: true,
    generator,
    generatedAt: new Date().toISOString(),
    module,
    complianceNote: '此内容由 AI 生成 · 发布到抖音/视频号/小红书需勾选平台 AIGC 标签',
  };
}

// 各平台官方 AIGC 标识入口 (规则可能更新,见 lastVerified)
export const PLATFORM_DISCLOSURE = {
  douyin: {
    name: '抖音',
    hint: '发布页 → 高级设置 → "我发布的为 AI 生成内容" 开关',
    captionLine: '本视频由 AI 生成 #AIGC',
  },
  wechat_channels: {
    name: '视频号',
    hint: '发布页底部 → "标识 AI 合成" 选项',
    captionLine: '由 AI 生成 / 合成 #AIGC',
  },
  xiaohongshu: {
    name: '小红书',
    hint: '发布页 → "AI 生成内容" 开关',
    captionLine: '#AI生成 部分内容由 AI 辅助创作',
  },
  tiktok: {
    name: 'TikTok',
    hint: 'Post page → AI-generated content toggle',
    captionLine: 'Made with AI · #AIGC',
  },
  amazon: {
    name: 'Amazon',
    hint: '主图必须真实,AI 生成图仅可用于场景图/lifestyle 副图,不可作主 SKU 图',
    captionLine: '',
  },
} as const;

/**
 * 客户端: 给图片 dataURL 打右下角水印,返回新的 dataURL
 *
 * 用法: 在用户点"下载"前调一下,把生成的图加上 "AI 生成 · Wenai" 字样
 */
export async function applyImageWatermark(
  imageDataUrl: string,
  label = 'AI 生成 · Wenai'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas 2d context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0);

        // 字号随图大小,最小 14px
        const fontSize = Math.max(14, Math.floor(img.width / 60));
        ctx.font = `bold ${fontSize}px -apple-system, "Segoe UI", "PingFang SC", sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        const padding = Math.max(12, Math.floor(img.width / 80));
        const x = img.width - padding;
        const y = img.height - padding;

        // 黑描边 + 白填充,任何背景都能看清
        ctx.lineWidth = Math.max(2, Math.floor(fontSize / 8));
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.strokeText(label, x, y);
        ctx.fillText(label, x, y);

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('image load failed'));
    img.src = imageDataUrl;
  });
}

/**
 * 用户文案 · "我应该去平台勾哪个开关" 的备忘
 * 拷给客户当 SOP 用
 */
export function getCompliancePlaybook(targetPlatforms: (keyof typeof PLATFORM_DISCLOSURE)[]): string {
  const lines = ['# AIGC 合规发布备忘 · Wenai 生成内容', ''];
  lines.push('依据《互联网信息服务深度合成管理规定》(2023.1 施行) 第 16-17 条,');
  lines.push('AI 生成内容发布到平台前必须做"显著标识"。具体到各平台:');
  lines.push('');
  for (const p of targetPlatforms) {
    const meta = PLATFORM_DISCLOSURE[p];
    lines.push(`## ${meta.name}`);
    lines.push(`- 操作: ${meta.hint}`);
    if (meta.captionLine) {
      lines.push(`- 文案: ${meta.captionLine}`);
    }
    lines.push('');
  }
  lines.push('---');
  lines.push('图片下载前 wenai 已自动加右下角"AI 生成 · Wenai"水印,');
  lines.push('视频/文本类内容请在发布时勾选平台 AIGC 标识开关 + 文案声明双重保险。');
  return lines.join('\n');
}
