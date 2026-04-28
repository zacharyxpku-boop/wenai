/**
 * AIGC 合规速查 · 移植自 clico-clean MOAT-10
 *
 * wenai 价值: 跨境商家用 AI 生成主图/口播/种草帖, 各平台 AIGC 披露规则不同
 *   不标 → 限流降权 (抖音/视频号) 或显示 "Detected, not declared" 损信任 (Meta)
 *   一键复制披露语, 直接粘到 caption 框
 *
 * 数据载体: 纯静态结构, 0 LLM, 0 外网, 0 cost-cap 占用
 *
 * 数据维护: lastVerified 是核验日, 超 90 天 needsReview 返 true, UI 飘 "需复核"
 *           不阻塞展示 — 商家自己反查官方链接
 *
 * SEO 金矿: 索引 "抖音 AI 视频标识规则" / "TikTok AI content disclosure" 等中长尾
 */

export type PlatformId =
  | 'douyin'
  | 'tiktok'
  | 'wechat_channels'
  | 'xiaohongshu'
  | 'youtube_shorts'
  | 'instagram_reels';

export type AigcRequirement = {
  key: string;
  label: string;
  summary: string;
  disclosureText?: string;
  sourceUrl: string;
  steps?: string[];
  riskIfSkipped?: string;
};

export type PlatformChecklist = {
  id: PlatformId;
  name: string;
  region: 'CN' | 'Global';
  operator: string;
  lastVerified: string;
  requirements: AigcRequirement[];
};

export const AIGC_CHECKLISTS: PlatformChecklist[] = [
  {
    id: 'douyin',
    name: '抖音',
    region: 'CN',
    operator: '北京微播视界科技有限公司',
    lastVerified: '2026-04-20',
    requirements: [
      {
        key: 'douyin_label',
        label: '发布页打开"疑似 AI 生成内容"标签',
        summary: '发布时在"高级设置"里勾选"内容由 AI 合成 / AI 生成"。',
        disclosureText: '本视频由 AI 合成,仅供参考。',
        sourceUrl: 'https://www.douyin.com/rule/billboard?id=7352155787977052954',
        steps: [
          '点击发布按钮进入发布页',
          '拉到最下方"更多"/"高级设置"',
          '打开"内容声明" → 勾选"疑似 AI 生成内容"',
          '在视频描述开头再手打一句披露语 (双保险)',
        ],
        riskIfSkipped: '平台识别到未标注的 AIGC 内容会限流、降权推荐。重复违规可能封号。',
      },
      {
        key: 'douyin_caption',
        label: '描述文案内显式披露',
        summary: 'caption 开头或结尾写明"本视频由 AI 生成 / AI 合成" (约 10-20 字)。',
        disclosureText: '【AI 合成】本视频内容由 AI 辅助生成,仅供参考。',
        sourceUrl: 'https://www.12377.cn/wxxx/2023/e99b3b08_web.html',
        riskIfSkipped: '用户举报后需在 24 小时内举证已披露,caption 是最容易自证的载体。',
      },
      {
        key: 'douyin_realperson',
        label: '人像 / 真人形象处理',
        summary: '若视频中出现真人形象 (包括合成的),需 AI 人物底图授权或真人书面同意。',
        sourceUrl: 'https://www.gov.cn/zhengce/zhengceku/2023-08/15/content_6897286.htm',
        riskIfSkipped: '涉人像的 AIGC 未获授权属于《深度合成》第 14 条违规,可被平台永封并承担民事责任。',
      },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    region: 'Global',
    operator: 'TikTok Inc. (ByteDance)',
    lastVerified: '2026-04-20',
    requirements: [
      {
        key: 'tiktok_aigc_toggle',
        label: 'AI-generated content toggle',
        summary: 'Post 页面打开 "AI-generated content" 开关,TikTok 会自动在视频上加 AIGC 标签。',
        disclosureText: 'This video contains AI-generated content.',
        sourceUrl: 'https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content',
        steps: [
          'Post 页面 → More options',
          'Toggle on "AI-generated content"',
          '确认 caption 没有被折叠关键词',
        ],
        riskIfSkipped: 'TikTok 2024-05 起对未标 AI 内容降权,多次违规会限制账号功能。',
      },
      {
        key: 'tiktok_c2pa',
        label: 'C2PA 自动识别 (适用于 SynthID/Veo 生成)',
        summary: '用 Google Veo 或 OpenAI Sora 生成的素材自带 C2PA credentials,TikTok 会自动打 AI 标签 (但你仍应手动开 toggle 做双保险)。',
        sourceUrl: 'https://newsroom.tiktok.com/en-us/partnering-with-our-industry-to-advance-ai-transparency-and-literacy',
      },
    ],
  },
  {
    id: 'wechat_channels',
    name: '微信视频号',
    region: 'CN',
    operator: '深圳市腾讯计算机系统有限公司',
    lastVerified: '2026-04-20',
    requirements: [
      {
        key: 'channels_label',
        label: '发布页选择"AI 生成内容"',
        summary: '视频号发布页 2024-02 起新增"内容声明" 一栏,AI 合成视频必须勾选。',
        disclosureText: '本视频为 AI 合成内容。',
        sourceUrl: 'https://channels.weixin.qq.com/rule/rule_detail?id=1162',
        steps: [
          '发布 → 下拉到"更多设置"',
          '"内容声明" → 勾选"视频由 AI 合成"',
        ],
        riskIfSkipped: '视频号对未披露 AIGC 内容采用"下架 + 扣分"策略。账号功能可能被冻结 3-7 天。',
      },
      {
        key: 'channels_no_bypass',
        label: '绝不使用第三方 bypass 标签工具',
        summary: '市面上有"帮你规避 AIGC 识别"的灰产工具,使用即违约,封号风险 100%。',
        sourceUrl: 'https://channels.weixin.qq.com/rule/rule_detail?id=1098',
        riskIfSkipped: '腾讯风控检测到会直接封停视频号 + 关联微信号风控。',
      },
    ],
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    region: 'CN',
    operator: '上海行吟信息科技有限公司',
    lastVerified: '2026-04-20',
    requirements: [
      {
        key: 'xhs_tag',
        label: '笔记发布时开启"AI 生成内容"标签',
        summary: '小红书 2024-10 起强制要求 AI 合成笔记打 AIGC 标签,位置在发布页"添加话题" 下方。',
        disclosureText: '本笔记含 AI 生成内容。',
        sourceUrl: 'https://www.xiaohongshu.com/crown/community/ai_post',
        steps: [
          '发布页 → "更多"',
          '"内容属性" → 打开 "AI 生成内容"',
          'caption 里写"AI 生成"或加话题 #AI创作',
        ],
        riskIfSkipped: '未披露的 AIGC 笔记不上"发现页" (流量池)。重度违规的账号会被限制商业化入口。',
      },
      {
        key: 'xhs_realperson',
        label: '合成真人形象须获得 UGC 授权',
        summary: '用平台内其他用户的面部作为训练素材的 AIGC 会直接违规。',
        sourceUrl: 'https://www.xiaohongshu.com/crown/community/video_post',
      },
    ],
  },
  {
    id: 'youtube_shorts',
    name: 'YouTube Shorts',
    region: 'Global',
    operator: 'YouTube / Google',
    lastVerified: '2026-04-20',
    requirements: [
      {
        key: 'yt_altered_content',
        label: 'Studio 里勾选 "altered or synthetic content"',
        summary: 'YouTube Studio 在 details 页新增 "Altered content" 选项,AIGC 必勾。',
        disclosureText: 'Contains synthetic or AI-altered content.',
        sourceUrl: 'https://support.google.com/youtube/answer/14328491',
        steps: [
          'Studio → Create → Upload or edit video',
          'Details 页 → "Altered content" section',
          '勾 "Yes, altered or synthetic" 并勾选具体子项',
        ],
        riskIfSkipped: '未披露视频会显示"该创作者未披露",严重影响观众信任。',
      },
      {
        key: 'yt_face_voice',
        label: 'Face / voice 合成另需真人授权',
        summary: 'AI 合成人脸 / 配音的视频,真人可通过 YouTube Privacy Complaint 流程要求下架。',
        sourceUrl: 'https://support.google.com/youtube/answer/14185430',
      },
    ],
  },
  {
    id: 'instagram_reels',
    name: 'Instagram Reels',
    region: 'Global',
    operator: 'Meta Platforms',
    lastVerified: '2026-04-20',
    requirements: [
      {
        key: 'ig_aiinfo',
        label: '发布时打开 "AI info" 标签',
        summary: 'Meta 2024-05 起对 AIGC 内容自动打 "AI info" 标签,但创作者应主动在 Advanced Settings 里确认。',
        disclosureText: 'Made with AI tools.',
        sourceUrl: 'https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/',
        steps: [
          'Post reel → Advanced settings',
          '"Label as AI-generated" 打开',
          'Caption 里加 #AI 或 #MadeWithAI',
        ],
        riskIfSkipped: 'Meta 检测到 C2PA signature 但创作者未标注会显示为 "AI info · Detected" 而不是 "Labeled by creator",降低账号信任分。',
      },
    ],
  },
];

export function getChecklistById(id: string): PlatformChecklist | null {
  return AIGC_CHECKLISTS.find((c) => c.id === id) ?? null;
}

const STALE_DAYS = 90;

export function needsReview(checklist: PlatformChecklist): boolean {
  const verified = new Date(checklist.lastVerified).getTime();
  if (isNaN(verified)) return true;
  const age = Date.now() - verified;
  return age > STALE_DAYS * 24 * 3600 * 1000;
}

export function daysSinceVerified(checklist: PlatformChecklist): number {
  const verified = new Date(checklist.lastVerified).getTime();
  if (isNaN(verified)) return -1;
  return Math.floor((Date.now() - verified) / (24 * 3600 * 1000));
}

export function listChecklists(opts?: { region?: 'CN' | 'Global' }): PlatformChecklist[] {
  let list = AIGC_CHECKLISTS;
  if (opts?.region) list = list.filter(c => c.region === opts.region);
  return list.slice().sort((a, b) => {
    if (a.region === b.region) return a.name.localeCompare(b.name);
    return a.region === 'CN' ? -1 : 1;
  });
}
