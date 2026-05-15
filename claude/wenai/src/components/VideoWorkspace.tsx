'use client';

import { useState, useEffect, useCallback } from 'react';

interface SectionResult {
  content: string;
  loading: boolean;
  error: string;
}

const VIDEO_TYPES = [
  { value: 'product-review', label: '产品测评' },
  { value: 'unboxing', label: '开箱视频' },
  { value: 'tutorial', label: '教程/教学' },
  { value: 'lifestyle', label: '生活方式/种草' },
];

const PLATFORMS = [
  { value: 'douyin', label: '抖音' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'kuaishou', label: '快手' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'youtube', label: 'YouTube Shorts' },
];

const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  'product-review': [
    '开头3秒hook（痛点/惊讶/对比）',
    '产品外观360度展示',
    '核心功能逐一演示',
    '使用前后对比',
    '价格/性价比总结',
    '添加字幕和关键词标注',
    '背景音乐匹配节奏',
    '结尾CTA（关注/评论/链接）',
  ],
  'unboxing': [
    '悬念封面/标题',
    '包装外观展示',
    '拆箱过程（保持连贯）',
    '配件清点',
    '初次使用体验',
    '第一印象总结',
    '添加拆箱音效/ASMR',
    '引导观众互动',
  ],
  'tutorial': [
    '开头说明学习目标',
    '步骤编号和字幕',
    '关键操作放慢/特写',
    '常见错误提醒',
    '最终效果展示',
    '补充注意事项',
    '添加进度条/章节标记',
    '引导收藏/转发',
  ],
  'lifestyle': [
    '场景化开头（日常/旅行/居家）',
    '自然融入产品展示',
    '真实使用感受',
    '多角度/多场景切换',
    '情感共鸣点',
    '调色滤镜统一',
    '搭配符合氛围的BGM',
    '软性CTA',
  ],
};

const EXPORT_PLANS: Record<string, { ratio: string; duration: string; notes: string }> = {
  douyin: { ratio: '9:16 (1080x1920)', duration: '15-60s 最佳', notes: '前3秒决定完播率，标题含关键词' },
  tiktok: { ratio: '9:16 (1080x1920)', duration: '15-60s 最佳', notes: '前 2 秒必须有钩子，可结合热门声音' },
  kuaishou: { ratio: '9:16 (1080x1920)', duration: '15-57s 最佳', notes: '真实感优先，避免过度包装' },
  xiaohongshu: { ratio: '3:4 / 9:16', duration: '30-90s', notes: '封面图决定点击率，文案详细' },
  'youtube': { ratio: '9:16 (1080x1920)', duration: '15-60s', notes: '前 3 秒放钩子，结尾补结束画面' },
};

const STORAGE_KEY = 'wenai_video_workspace';

export default function VideoWorkspace() {
  // Section 1: Script Generator
  const [productInfo, setProductInfo] = useState('');
  const [scriptResult, setScriptResult] = useState<SectionResult>({ content: '', loading: false, error: '' });

  // Section 2: Trending Analysis
  const [trendPlatform, setTrendPlatform] = useState('douyin');
  const [trendResult, setTrendResult] = useState<SectionResult>({ content: '', loading: false, error: '' });

  // Section 3: Editing Checklist
  const [videoType, setVideoType] = useState('product-review');
  const [checklist, setChecklist] = useState<{ text: string; checked: boolean }[]>([]);

  // Section 4: Export Plan
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['douyin', 'tiktok']);

  const [activeSection, setActiveSection] = useState<number>(0);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.productInfo) setProductInfo(data.productInfo);
        if (data.scriptResult?.content) setScriptResult(prev => ({ ...prev, content: data.scriptResult.content }));
        if (data.trendPlatform) setTrendPlatform(data.trendPlatform);
        if (data.trendResult?.content) setTrendResult(prev => ({ ...prev, content: data.trendResult.content }));
        if (data.videoType) setVideoType(data.videoType);
        if (data.checklist) setChecklist(data.checklist);
        if (data.selectedPlatforms) setSelectedPlatforms(data.selectedPlatforms);
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  const saveState = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        productInfo,
        scriptResult: { content: scriptResult.content },
        trendPlatform,
        trendResult: { content: trendResult.content },
        videoType,
        checklist,
        selectedPlatforms,
      }));
    } catch { /* ignore */ }
  }, [productInfo, scriptResult.content, trendPlatform, trendResult.content, videoType, checklist, selectedPlatforms]);

  useEffect(() => { saveState(); }, [saveState]);

  // Initialize checklist when video type changes
  useEffect(() => {
    const items = CHECKLIST_TEMPLATES[videoType] || [];
    setChecklist(items.map(text => ({ text, checked: false })));
  }, [videoType]);

  const callAI = async (
    prompt: string,
    input: string,
    setter: React.Dispatch<React.SetStateAction<SectionResult>>
  ) => {
    setter(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: 'video', prompt, input }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '请求失败');
      }
      const data = await res.json();
      setter({ content: data.content || '', loading: false, error: '' });
    } catch (err) {
      setter(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : '未知错误' }));
    }
  };

  const generateScript = () => {
    if (!productInfo.trim()) return;
    callAI(
      '你是一个专业的短视频脚本编导。请根据以下产品信息，生成一个带时间戳的视频脚本：\n\n要求：\n1. 标注每个镜头的时间段（如 00:00-00:03）\n2. 包含画面描述、文案/口播、字幕建议\n3. 标注转场效果\n4. 总时长控制在60秒以内\n5. 前3秒必须有强hook\n\n产品信息：',
      productInfo,
      setScriptResult
    );
  };

  const analyzeTrends = () => {
    const platformLabel = PLATFORMS.find(p => p.value === trendPlatform)?.label || trendPlatform;
    callAI(
      `你是一个${platformLabel}短视频运营专家。请分析当前${platformLabel}平台的热门视频格式和趋势：\n\n要求：\n1. 当前热门的5种视频格式/模板\n2. 每种格式的结构拆解\n3. 推荐的BGM风格\n4. 爆款标题公式（3个）\n5. 发布时间建议\n6. 标签策略\n\n分析平台：`,
      platformLabel,
      setTrendResult
    );
  };

  const toggleCheckItem = (index: number) => {
    setChecklist(prev => prev.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    ));
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const sections = [
    { title: '视频脚本', subtitle: '生成结构' },
    { title: '趋势分析', subtitle: '平台格式' },
    { title: '剪辑清单', subtitle: '交付复核' },
    { title: '导出方案', subtitle: '平台规格' },
  ];

  const completedChecks = checklist.filter(c => c.checked).length;

  return (
    <div className="flex flex-col h-full animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-text-primary font-[family-name:var(--font-outfit)]">
            视频内容工作台
          </h2>
          <p className="text-[11px] font-mono text-text-tertiary mt-1">
            脚本、趋势、剪辑清单和导出规格放在同一处，方便内容团队交接。
          </p>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto">
        {sections.map((sec, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
              activeSection === i
                ? 'text-accent bg-accent-dim border border-accent/30'
                : 'text-text-tertiary border border-border-subtle hover:text-text-primary hover:border-border-default'
            }`}
          >
            {sec.title}
            <span className="ml-1.5 text-[9px] opacity-60">{sec.subtitle}</span>
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Section 0: Script Generator */}
        {activeSection === 0 && (
          <div className="flex flex-col lg:flex-row gap-4 h-full animate-fade-up">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-text-tertiary">商品信息</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <textarea
                value={productInfo}
                onChange={e => setProductInfo(e.target.value)}
                placeholder="输入产品信息（名称、卖点、目标人群、价格、平台）..."
                className="flex-1 min-h-[200px] bg-bg-surface border border-border-subtle rounded-md p-4 text-[13px] text-text-primary placeholder-text-tertiary resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] font-mono text-text-tertiary">
                  {productInfo.length > 0 ? `${productInfo.length} 字` : '描述你的商品'}
                </span>
                <button
                  onClick={generateScript}
                  disabled={scriptResult.loading || !productInfo.trim()}
                  className="px-5 py-2 bg-accent text-bg-root rounded-md font-medium text-[13px] hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-[family-name:var(--font-outfit)]"
                >
                  {scriptResult.loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                        <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      生成中...
                    </span>
                  ) : '生成脚本'}
                </button>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center py-6">
              <div className="w-px flex-1 bg-border-subtle" />
              <span className="text-[10px] font-mono text-text-tertiary my-2">&rarr;</span>
              <div className="w-px flex-1 bg-border-subtle" />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-text-tertiary">脚本输出</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <div className="flex-1 min-h-[200px] bg-bg-surface border border-border-subtle rounded-md p-4 overflow-y-auto">
                {scriptResult.error && (
                  <div className="text-[12px] font-mono text-red-400 p-3 bg-red-400/8 border border-red-400/20 rounded-md mb-3">
                    {scriptResult.error}
                  </div>
                )}
                {scriptResult.content ? (
                  <div className="text-[13px] text-text-secondary whitespace-pre-wrap leading-[1.7]">{scriptResult.content}</div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-text-tertiary text-[12px] font-mono">生成后的脚本会显示在这里</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Trending Analysis */}
        {activeSection === 1 && (
          <div className="flex flex-col lg:flex-row gap-4 h-full animate-fade-up">
            <div className="lg:w-[280px] flex-shrink-0 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-text-tertiary">平台</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <div className="space-y-1.5">
                {PLATFORMS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setTrendPlatform(p.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-[12px] font-mono transition-colors ${
                      trendPlatform === p.value
                        ? 'text-accent bg-accent-dim border border-accent/30'
                        : 'text-text-secondary border border-border-subtle hover:text-text-primary hover:border-border-default'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <button
                onClick={analyzeTrends}
                disabled={trendResult.loading}
                className="w-full px-5 py-2.5 bg-accent text-bg-root rounded-md font-medium text-[13px] hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-[family-name:var(--font-outfit)] mt-2"
              >
                {trendResult.loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    分析中...
                  </span>
                ) : '分析趋势'}
              </button>
            </div>

            <div className="hidden lg:flex flex-col items-center py-6">
              <div className="w-px flex-1 bg-border-subtle" />
              <span className="text-[10px] font-mono text-text-tertiary my-2">&rarr;</span>
              <div className="w-px flex-1 bg-border-subtle" />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono text-text-tertiary">趋势报告</span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <div className="flex-1 min-h-[200px] bg-bg-surface border border-border-subtle rounded-md p-4 overflow-y-auto">
                {trendResult.error && (
                  <div className="text-[12px] font-mono text-red-400 p-3 bg-red-400/8 border border-red-400/20 rounded-md mb-3">
                    {trendResult.error}
                  </div>
                )}
                {trendResult.content ? (
                  <div className="text-[13px] text-text-secondary whitespace-pre-wrap leading-[1.7]">{trendResult.content}</div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-text-tertiary text-[12px] font-mono">选择平台后生成趋势分析</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Editing Checklist */}
        {activeSection === 2 && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-[11px] font-mono text-text-tertiary">视频类型</label>
              <select
                value={videoType}
                onChange={e => setVideoType(e.target.value)}
                className="bg-bg-surface border border-border-subtle rounded-md px-3 py-1.5 text-[12px] font-mono text-text-primary appearance-none cursor-pointer"
              >
                {VIDEO_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="flex-1" />
              <span className="text-[10px] font-mono text-text-tertiary">
                已完成 {completedChecks}/{checklist.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-border-subtle rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: checklist.length > 0 ? `${(completedChecks / checklist.length) * 100}%` : '0%' }}
              />
            </div>

            <div className="space-y-1.5 max-w-lg">
              {checklist.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleCheckItem(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                    item.checked
                      ? 'bg-accent-dim/50 border border-accent/20'
                      : 'bg-bg-surface border border-border-subtle hover:border-border-default'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-accent border-accent'
                      : 'border-border-subtle'
                  }`}>
                    {item.checked && (
                      <svg className="w-2.5 h-2.5 text-bg-root" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[13px] transition-colors ${
                    item.checked ? 'text-text-tertiary line-through' : 'text-text-secondary'
                  }`}>
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Export Plan */}
        {activeSection === 3 && (
          <div className="animate-fade-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-mono text-text-tertiary">目标平台</span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {PLATFORMS.map(p => (
                <button
                  key={p.value}
                  onClick={() => togglePlatform(p.value)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-mono transition-colors ${
                    selectedPlatforms.includes(p.value)
                      ? 'text-accent bg-accent-dim border border-accent/30'
                      : 'text-text-tertiary border border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {selectedPlatforms.map(pv => {
                const plan = EXPORT_PLANS[pv];
                const platform = PLATFORMS.find(p => p.value === pv);
                if (!plan || !platform) return null;
                return (
                  <div key={pv} className="bg-bg-surface border border-border-subtle rounded-md p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-[13px] font-medium text-text-primary font-[family-name:var(--font-outfit)]">
                        {platform.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-text-tertiary block mb-1">画幅比例</span>
                        <span className="text-[12px] text-text-secondary font-mono">{plan.ratio}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-text-tertiary block mb-1">建议时长</span>
                        <span className="text-[12px] text-text-secondary font-mono">{plan.duration}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-text-tertiary block mb-1">注意事项</span>
                        <span className="text-[12px] text-text-secondary">{plan.notes}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {selectedPlatforms.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-tertiary text-[12px] font-mono">选择平台后查看导出要求</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
