'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';
import { applyImageWatermark } from '@/lib/aigc';
import { useActiveSkuId } from '@/lib/use-active-sku';
import { assessClientFile } from '@/lib/client-file-guard';
import { ActiveSkuBadge } from '@/components/ActiveSkuBadge';
import { buildPhotoshootStandardPackRoute } from '@/lib/standard-pack-routing';
import {
  resolvePrompt,
  CATEGORY_LABELS,
  SCENARIO_LABELS,
  STYLE_LABELS,
  SOP_PRESETS,
  type EcomCategory,
  type EcomScenario,
  type EcomStyle,
  type SopPreset,
} from '@/lib/ecom-prompts';

/**
 * AI 影棚 · gpt-image-1 旗舰模块 (5 模式闭环)
 *
 * 工作流参考: @冉胖子《赢麻了!电商模特AI换装新玩法》
 *   ① 模特生图   (model-generate) · 纯文字生成 AI 模特
 *   ② 模特换装   (outfit-swap)    · 模特图 + 服装图 → 上身效果
 *   ③ 模特换姿   (pose-change)    · 模特图 → 4 种平面拍照姿势
 *   ④ 模特换景   (scene-change)   · 模特图 → 居家/咖啡馆/影棚等场景
 *   ⑤ OOTD 拆解 (ootd-flatlay)   · 整体造型图 → 单品 ins 风平铺
 *
 * 替代真人模特拍摄 ¥3-8K/组 → AI ¥0.3-1.2/张
 * 配色: wenai dark + 金色 accent, 视觉参考 PhotoRoom + Pebblely + 即梦
 */

type Mode = 'model-generate' | 'outfit-swap' | 'pose-change' | 'scene-change' | 'ootd-flatlay' | 'platform-style' | 'full-detail-set' | 'hot-clone';
type Quality = 'low' | 'medium' | 'high';
type Size = '1024x1024' | '1024x1536' | '1536x1024';

interface GenImage {
  index: number;
  url: string;
  revisedPrompt: string | null;
  provider: string;
  model: string;
}

interface CostInfo {
  perImageUsd: number;
  totalUsd: number;
}

interface ModeMeta {
  title: string;
  icon: string;
  desc: string;
  cost: string;
  refSlots: { label: string; required: boolean; hint: string }[];
  promptHint: string;
}

function buildPhotoshootResultSummary(input: {
  images: GenImage[];
  modeLabel: string;
  productHint: string;
  quality: Quality;
  size: Size;
  fromCache: boolean;
  cost: CostInfo | null;
}): string {
  return [
    `mode: ${input.modeLabel}`,
    `product: ${input.productHint || '(not specified)'}`,
    `generated images: ${input.images.length}`,
    `quality: ${input.quality}`,
    `size: ${input.size}`,
    `cache: ${input.fromCache ? 'hit' : 'miss'}`,
    input.cost ? `cost usd: ${input.cost.totalUsd}` : '',
    `acceptance checklist: image count, platform fit, product fidelity, AIGC watermark, download/share readiness`,
  ].filter(Boolean).join('\n');
}

// ============================================================
// 5 模式元数据 + 文章实测 prompt 直采
// ============================================================
const MODES: Record<Mode, ModeMeta> = {
  'model-generate': {
    title: '模特生图',
    icon: '👩‍🎤',
    desc: '纯文字生成 AI 模特,免授权可商用',
    cost: '替代外模摄影 ¥1-3K/组',
    refSlots: [],
    promptHint: '描述模特特征、穿搭、姿势、场景。越具体越好。',
  },
  'outfit-swap': {
    title: '模特换装',
    icon: '👗',
    desc: '把服装图换到模特身上,一键上身',
    cost: '替代真人试装 ¥3-8K/组',
    refSlots: [
      { label: '模特图', required: true, hint: '已有的人物图(可用模式①生成)' },
      { label: '服装图', required: true, hint: '平铺/挂拍/官方图都行' },
    ],
    promptHint: '默认: 把图二的服装换到图一的模特身上。可加细节: 强调质感/光影/廓形。',
  },
  'pose-change': {
    title: '模特换姿',
    icon: '🤸',
    desc: '保人物不变,生成 4 种平面拍照姿势',
    cost: '替代多次拍摄 ¥2-5K/组',
    refSlots: [
      { label: '模特图', required: true, hint: '上传一张完整造型,生成多组动作' },
    ],
    promptHint: '默认: 保持人物不变,换 4 种平面模特拍照姿势。可指定: 走路/坐姿/侧身等。',
  },
  'scene-change': {
    title: '模特换景',
    icon: '🌆',
    desc: '一组造型 → 多场景批量出图',
    cost: '替代外景拍摄 ¥3-10K/组',
    refSlots: [
      { label: '模特图', required: true, hint: '一张造型图,自动适配场景动作' },
    ],
    promptHint: '默认: 保持人物不变,更换场景(居家/咖啡馆/商业摄影棚/街头),并匹配相应动作。',
  },
  'ootd-flatlay': {
    title: 'OOTD 拆解',
    icon: '🛍️',
    desc: '整体造型 → 单品 ins 风平铺图',
    cost: '替代单品拍摄 ¥500-2K/SKU',
    refSlots: [
      { label: '整体造型图', required: true, hint: '上身的整套穿搭' },
    ],
    promptHint: '默认: 拆成发饰/上衣/项链/裙子/鞋/袜,纯白底 ins 风,顶部花体 OOTD 标题。',
  },
  'platform-style': {
    title: '平台调性',
    icon: '🌐',
    desc: '产品图 → 4 平台 (Amazon / 淘宝 / 拼多多 / 独立站) 调性',
    cost: '替代美工反复改稿 ¥2-5K/月',
    refSlots: [
      { label: '产品图', required: true, hint: '白底/带背景都可,自动按平台审美重做' },
    ],
    promptHint: '默认 4 平台四宫格出图。可指定: "只要 Amazon" / "拼多多+独立站"。',
  },
  'full-detail-set': {
    title: '全套详情',
    icon: '📑',
    desc: '产品图 → 12 张完整详情(主/45°/场景/细节/材质/使用/对比/参数/包装)',
    cost: '替代专业商拍 ¥3-10K/SKU',
    refSlots: [
      { label: '产品图', required: true, hint: '一张产品图自动衍生整套详情页' },
    ],
    promptHint: '可补充: 卖点 / 核心参数 / 目标平台。AI 自动分配 12 个机位。',
  },
  'hot-clone': {
    title: '高转化结构参考',
    icon: '🔥',
    desc: '你的产品 + 参考截图 → 提炼构图逻辑, 生成差异化主图方案',
    cost: '参考行业结构 · 替代美工初稿拆解 ¥1-3K/次',
    refSlots: [
      { label: '你的产品图', required: true, hint: '白底/带背景都行' },
      { label: '参考主图', required: true, hint: '可用行业样例或竞品截图, 仅提炼结构' },
    ],
    promptHint: '默认: 分析图二的构图逻辑、光影方向和信息层级, 为图一产品生成差异化主图。不要照抄品牌、文案、价格或独特装饰元素。',
  },
};

// 文章实测 prompt 模板 (来自冉胖子工作流) · 用户填的 extraPrompt 会拼到尾部
const PROMPT_TEMPLATES: Record<Mode, (extra: string) => string> = {
  'model-generate': extra => [
    '8K超清,真人感。全身照片,广角镜头,平视视角。',
    extra || '一位身材匀称、气质甜酷风格的时尚女模特,亚洲面孔,马尾发型,粉黑格纹短款衬衫配黑色百褶短裙,黑色厚底乐福鞋。',
    '光线均匀柔和,皮肤纹理真实,毛发清晰,杂志大片质感。背景为纯白色。',
  ].join(' '),

  'outfit-swap': extra => [
    '把图二的服装换到图一的模特身上。智能参考强度 100。',
    '完整保留模特面部、发型、体型、姿势,仅替换身上的服装为图二的款式。',
    '服装的版型、面料质感、颜色、印花、装饰细节(如纽扣/拉链/抽绳/印花)必须 1:1 还原图二。',
    '光影自然贴合模特身形,8K 超清电商大片质感。',
    extra ? `额外要求: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'pose-change': extra => [
    '保持人物的面部、发型、服装、体型完全不变,生成 4 种不同的平面模特拍照姿势。',
    '姿势包括: 正面站姿、45° 侧身、行走中、半身回眸特写。',
    '动作自然优雅,符合时尚杂志大片审美,光线均匀柔和。',
    '每个姿势独立成图,背景统一,8K 超清。',
    extra ? `特别要求: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'scene-change': extra => [
    '保持人物的面部、发型、服装、体型完全不变,更换不同场景,并匹配相应的动作。',
    '场景分别为: 居家(沙发/温暖灯光)、咖啡馆(自然光/木质桌椅)、商业摄影棚(白底/专业打光)、街头(都市建筑/日系街拍光)。',
    '每个场景的人物动作要自然贴合环境(居家放松、咖啡馆侧坐、影棚正面、街头行走)。',
    '8K 高清,光影真实,景深虚化突出人物。',
    extra ? `补充: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'ootd-flatlay': extra => [
    '将图片人物的时尚穿搭拆解成各个单品,以 ins 风格摆放在一个纯白色背景上。',
    '拆解清单: 发饰、上衣、领带/项链(如有)、外套(如有)、裙子/裤子、鞋子、袜子、包包(如有)、其他配饰。',
    '每件单品独立摆放,间距均匀,排列美观,从上到下、从左到右有节奏感。',
    '顶部用英文手写花体写"OOTD",字号适中,居中。',
    '光线均匀柔和,产品质感真实,8K 超清电商平铺图。',
    extra ? `特殊要求: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'platform-style': extra => [
    '将上传的产品图按四个电商平台的视觉调性重新出图,以 2x2 四宫格呈现:',
    '• 左上 Amazon 风格: 纯白背景,产品居中 45° 俯视,Amazon listing 规范,极简高级,柔和投影,产品占画面 80%,英文标签风。',
    '• 右上 淘宝/天猫 风格: 精致场景图,木质或大理石质感道具,自然光,小资生活美学,高饱和但不俗气,带轻微氛围光。',
    '• 左下 拼多多 风格: 高视觉冲击力,大字促销标签留白(顶部和底部预留促销贴位置),亮色背景,产品占画面 90%,价格冲击感强,接地气。',
    '• 右下 独立站/Shopify 风格: 大片质感,品牌叙事感,留白多,景深虚化,生活方式摄影,高级感优先于产品本身。',
    '四种风格差异明显,但产品本体特征(颜色/形状/材质)严格一致。每张 1024×1024 子格,8K 超清。',
    extra ? `补充: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'full-detail-set': extra => [
    '基于上传的产品图,生成完整的电商详情页图集,12 张图分别为(以 3x4 或 4x3 网格拼合呈现,每格独立标号):',
    '① 主图 - 纯白背景 45° 俯视,产品占 80%,Amazon 规范',
    '② 主图 B - 正面平视,展示产品正面特征',
    '③ 场景图 - 真实使用环境的 lifestyle 摄影',
    '④ 细节微距 - 材质/工艺特写',
    '⑤ 材质纹理图 - 表面纹理放大,质感凸显',
    '⑥ 使用图 - 人手互动使用瞬间',
    '⑦ 对比图 - 与旧款/竞品/普通版对比示意',
    '⑧ 参数说明图 - 在产品旁边标注尺寸/重量/容量等参数(中文标注)',
    '⑨ 规格组合图 - 多色/多规格并排展示',
    '⑩ 包装外观 - 产品的包装盒/袋外观',
    '⑪ 包装内含 - 拆箱后所有配件平铺',
    '⑫ 品牌调性图 - 突出品牌质感的氛围图',
    '产品本体特征 1:1 还原上传图,12 张图风格统一,8K 高清。',
    extra ? `卖点和参数补充: ${extra}` : '',
  ].filter(Boolean).join(' '),

  'hot-clone': extra => [
    '生成一张电商主图,核心要求: 参考图二的信息层级、镜头距离、光影方向和卖点表达方式, 但重新设计构图、道具、色彩和文字排版。',
    '把图一(我的产品)作为主角,产品本体特征(形状/颜色/材质)严格保留图一不变。',
    '注意: 不要照抄竞品的品牌名、logo、促销价格数字、独特装饰元素或可识别版式,这些必须替换为原创表达或留空。',
    '目标是生成同类目高转化候选方案, 与参考图保持明显差异, 便于人工终审。',
    '8K 超清,电商主图规范。',
    extra ? `特殊要求: ${extra}` : '',
  ].filter(Boolean).join(' '),
};

// ============================================================
// Component
// ============================================================
export default function AIPhotoshootPage() {
  const [mode, setMode] = useState<Mode>('outfit-swap');

  // 多图垫图 (按 mode 决定槽位数)
  const [refImages, setRefImages] = useState<(string | null)[]>([null, null]);

  // 用户额外细节
  const [extraPrompt, setExtraPrompt] = useState('');

  // 从 ?prompt= 预填 (从 video-teardown 跳过来时带着 scene prompt)
  // 只在 mount 时读一次, 不依赖 query 变化
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const incoming = sp.get('prompt');
    if (incoming) {
      setExtraPrompt(incoming.slice(0, 800)); // 截断保护
    }
  }, []);

  // 行业模板状态 (ecom-prompts 包办)
  const [showEcomPanel, setShowEcomPanel] = useState(false);
  const [ecomCategory, setEcomCategory] = useState<EcomCategory>('apparel');
  const [ecomScenario, setEcomScenario] = useState<EcomScenario>('main-image');
  const [ecomStyle, setEcomStyle] = useState<EcomStyle>('taobao');
  const [productHint, setProductHint] = useState('');

  // 仅展示和影棚相关的图像场景 (排除 video-* 因为本页是出图)
  const PHOTO_SCENARIOS: EcomScenario[] = [
    'main-image', 'detail-set', 'lifestyle', 'model-on', 'flat-lay',
    'close-up', 'before-after', 'package-shot', 'unboxing',
  ];

  // SOP 一键预设 · 选了之后, 默认场景/风格 全配好,只等用户填一句话产品
  const applySop = (sop: SopPreset) => {
    setEcomCategory(sop.category);
    setEcomStyle(sop.defaultStyle);
    if (sop.scenarios.length > 0) {
      const firstPhotoScenario = sop.scenarios.find(s => !s.startsWith('video-'));
      if (firstPhotoScenario) setEcomScenario(firstPhotoScenario);
    }
    setShowEcomPanel(true);
  };

  const applyEcomTemplate = () => {
    const resolved = resolvePrompt({
      category: ecomCategory,
      scenario: ecomScenario,
      style: ecomStyle,
      productHint,
      extraDetails: extraPrompt,
    });
    setExtraPrompt(resolved.prompt);
    // 按场景调整 mode (有垫图需求的切到对应模式)
    if (ecomScenario === 'model-on') setMode('outfit-swap');
    else if (ecomScenario === 'before-after') setMode('hot-clone');
    else if (ecomScenario === 'flat-lay') setMode('ootd-flatlay');
    else if (ecomScenario === 'detail-set') setMode('full-detail-set');
    else if (ecomScenario === 'lifestyle' || ecomScenario === 'package-shot' || ecomScenario === 'unboxing' || ecomScenario === 'close-up') setMode('platform-style');
    else setMode('model-generate');
    // 比例切换
    const ratio = resolved.recommendedRatio;
    if (ratio === '1:1') setSize('1024x1024');
    else if (ratio === '3:4' || ratio === '9:16' || ratio === '4:5' || ratio === '2:3') setSize('1024x1536');
    else if (ratio === '16:9' || ratio === '4:3' || ratio === '3:2' || ratio === '5:4') setSize('1536x1024');
  };

  // 输出参数
  const [quality, setQuality] = useState<Quality>('medium');
  const [size, setSize] = useState<Size>('1024x1536');
  const [n, setN] = useState(2);

  // 状态
  const [running, setRunning] = useState(false);
  const [images, setImages] = useState<GenImage[]>([]);
  const [error, setError] = useState('');
  const [cost, setCost] = useState<CostInfo | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showFinalPrompt, setShowFinalPrompt] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const meta = MODES[mode];
  const requiredSlots = meta.refSlots.length;

  const handleFile = (file: File, slot: number) => {
    const guard = assessClientFile(file, {
      kind: 'image',
      largeBytes: 5 * 1024 * 1024,
      hardBytes: 12 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });
    if (guard.message) setError(guard.message);
    if (!guard.ok) {
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setRefImages(prev => {
        const next = [...prev];
        next[slot] = result;
        return next;
      });
      if (!guard.shouldOptimize) setError('');
    };
    reader.readAsDataURL(file);
  };

  const removeRef = (slot: number) => {
    setRefImages(prev => {
      const next = [...prev];
      next[slot] = null;
      return next;
    });
    const input = fileInputRefs.current[slot];
    if (input) input.value = '';
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setImages([]);
    setError('');
    setRefImages(MODES[m].refSlots.map(() => null));
  };

  const handleGenerate = async () => {
    // 校验必填垫图
    for (let i = 0; i < requiredSlots; i++) {
      if (meta.refSlots[i].required && !refImages[i]) {
        setError(`请上传 ${meta.refSlots[i].label}`);
        return;
      }
    }

    setRunning(true);
    setError('');
    setImages([]);
    setCost(null);
    setSavedSku(false);

    try {
      const refList = refImages.slice(0, requiredSlots).filter((x): x is string => !!x);
      const finalMode: 'generate' | 'edit' = refList.length > 0 ? 'edit' : 'generate';
      const prompt = PROMPT_TEMPLATES[mode](extraPrompt.trim());

      const res = await fetch('/api/openai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: finalMode,
          scenario: mode,
          prompt,
          referenceImages: refList,
          size,
          quality,
          n,
          fromPipeline: false,
          skuId: activeSkuId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setImages(data.images || []);
      if (data.cost) setCost(data.cost);
      setFromCache(data.fromCache === true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setRunning(false);
    }
  };

  const downloadImage = async (url: string, idx: number) => {
    // AIGC 合规: 下载前打可视水印 (深度合成规定 第 16 条)
    let finalUrl = url;
    try {
      if (url.startsWith('data:image')) {
        finalUrl = await applyImageWatermark(url);
      }
    } catch (err) {
      console.warn('[watermark] failed, fallback to raw', err);
    }
    const a = document.createElement('a');
    a.href = finalUrl;
    a.download = `wenai-${mode}-${Date.now()}-${idx}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const activeSkuId = useActiveSkuId();

  const [savingSku, setSavingSku] = useState(false);
  const [savedSku, setSavedSku] = useState(false);

  const saveToSkuLibrary = async () => {
    if (images.length === 0) return;
    setSavingSku(true);
    try {
      const meta = MODES[mode];
      const res = await fetch('/api/user/sku-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productHint?.slice(0, 80) || `${meta.title} 产出 ${new Date().toLocaleDateString('zh-CN')}`,
          category: '已出图',
          status: 'photoshoot-done',
          notes: `影棚模式: ${meta.title} · ${images.length} 张 · 产品提示: ${productHint || '(空)'}`,
          modules: ['ai-photoshoot'],
          performance: { imageCount: images.length },
        }),
      });
      if (res.ok) setSavedSku(true);
    } catch {} finally {
      setSavingSku(false);
    }
  };

  const handleShare = async () => {
    if (images.length === 0) return;
    setSharing(true);
    try {
      // 拼成 Markdown · /share/[id] 页用 ReactMarkdown 渲染 ![]() 图片
      const modeMeta = MODES[mode];
      const lines = [
        `## ${modeMeta.icon} ${modeMeta.title}`,
        '',
        productHint ? `**产品**: ${productHint}` : '',
        extraPrompt ? `**额外要求**: ${extraPrompt.slice(0, 200)}` : '',
        '',
        `生成 ${images.length} 张:`,
        '',
        ...images.map((img, i) => `![${modeMeta.title} ${i + 1}](${img.url})\n`),
        '',
        '---',
        '',
        '> 由 [wenai AI 影棚](/pipelines/ai-photoshoot) 生成候选图 · 7 天有效',
      ].filter(Boolean).join('\n');

      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: 'ai-photoshoot',
          title: `${modeMeta.title} · ${productHint || '电商图集'}`,
          content: lines,
          source: 'module',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const url = `${window.location.origin}/share/${data.id}`;
      setShareUrl(url);
      // 自动复制到剪贴板
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : '分享失败');
    } finally {
      setSharing(false);
    }
  };

  const downloadAllZip = async () => {
    if (images.length === 0) return;
    const zip = new JSZip();
    for (const img of images) {
      if (img.url.startsWith('data:image')) {
        // 给 zip 内每张图也打水印
        let watermarked = img.url;
        try {
          watermarked = await applyImageWatermark(img.url);
        } catch {}
        const b64 = watermarked.split(',')[1];
        zip.file(`wenai-${mode}-${img.index + 1}.png`, b64, { base64: true });
      }
    }
    // 附 AIGC 合规说明
    zip.file(
      'AIGC-合规说明.txt',
      [
        '本压缩包内的图片均由 AI 生成 · Wenai',
        '已自动添加右下角"AI 生成 · Wenai"水印',
        '',
        '依据《互联网信息服务深度合成管理规定》(2023.1 施行) 第 16-17 条:',
        '发布到抖音/视频号/小红书/TikTok 时,需在平台勾选 AIGC 标识开关。',
        '',
        '抖音: 发布页 → 高级设置 → AI 生成内容 开关',
        '视频号: 发布页底部 → 标识 AI 合成 选项',
        '小红书: 发布页 → AI 生成内容 开关',
        'TikTok: Post page → AI-generated content toggle',
        '',
        `生成时间: ${new Date().toISOString()}`,
        `模式: ${mode}`,
      ].join('\n'),
    );
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wenai-${mode}-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const finalPrompt = PROMPT_TEMPLATES[mode](extraPrompt.trim());
  const estCostUsd = ({ low: 0.011, medium: 0.042, high: 0.167 }[quality] * n);
  const standardPackHref = buildPhotoshootStandardPackRoute({
    modeLabel: meta.title,
    productHint,
    prompt: finalPrompt,
    quality,
    size,
    count: n,
  });
  const resultStandardPackHref = images.length > 0
    ? buildPhotoshootStandardPackRoute({
        modeLabel: meta.title,
        productHint,
        prompt: finalPrompt,
        quality,
        size,
        count: images.length,
        resultSummary: buildPhotoshootResultSummary({
          images,
          modeLabel: meta.title,
          productHint,
          quality,
          size,
          fromCache,
          cost,
        }),
      })
    : '';

  return (
    <div className="min-h-screen bg-bg-root">
      {/* Hero */}
      <div className="border-b border-border-subtle bg-gradient-to-b from-bg-surface/50 to-transparent">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-[0.2em]">
              AI PHOTOSHOOT · gpt-image-1
            </span>
            <span className="text-[9px] font-mono text-accent/70 px-2 py-0.5 border border-accent/30 rounded-full">
              8 模式闭环
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3 font-[family-name:var(--font-outfit)]">
            AI 影棚 · 替你出 ¥5000 一组的电商图
            <ActiveSkuBadge skuId={activeSkuId} />
          </h1>
          <p className="text-[13px] lg:text-[14px] text-text-secondary leading-relaxed max-w-[760px]">
            生成 AI 模特 → 模特换装 → 换姿 → 换景 → OOTD 拆解,完整闭环。
            <span className="text-accent">同一张模特图复用一整年</span>,告别真人拍摄 ¥3-8K/组成本。
          </p>

          {/* 一键 SOP · 真·包办 · 选预设 → 填一句产品 → 出全套 */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] font-mono text-accent uppercase tracking-wider">
                🎯 一键预设 · 选准品类直接走流水线
              </span>
              <div className="flex-1 h-px bg-accent/20" />
              <span className="text-[10px] font-mono text-text-tertiary">
                {SOP_PRESETS.length} 套行业模板
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {SOP_PRESETS.slice(0, 8).map(sop => (
                <button
                  key={sop.id}
                  onClick={() => applySop(sop)}
                  className="group text-left border border-border-subtle hover:border-accent/60 bg-bg-surface/40 hover:bg-bg-surface rounded-lg p-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(200,151,90,0.12)]"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-mono text-accent">
                      {CATEGORY_LABELS[sop.category].split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-mono text-text-tertiary px-1 py-0.5 border border-border-subtle rounded">
                      {sop.scenarios.length} 件
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-text-primary group-hover:text-accent transition-colors mb-1 leading-tight">
                    {sop.title}
                  </div>
                  <div className="text-[10px] text-text-tertiary leading-relaxed line-clamp-2">
                    {sop.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 行业模板 · prompt 包办 */}
          <div className="mt-5 border border-accent/30 bg-accent/5 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowEcomPanel(s => !s)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono text-accent uppercase tracking-wider">
                  ⚡ 行业模板 · 不会写 prompt 直接选
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  品类 × 场景 × 平台 三选一就行
                </span>
              </div>
              <span className="text-[14px] text-accent">{showEcomPanel ? '−' : '+'}</span>
            </button>
            {showEcomPanel && (
              <div className="border-t border-accent/30 p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1 block">
                      ① 我卖什么品类
                    </label>
                    <select
                      value={ecomCategory}
                      onChange={e => setEcomCategory(e.target.value as EcomCategory)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] focus:border-accent/60 outline-none"
                    >
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1 block">
                      ② 我要什么图
                    </label>
                    <select
                      value={ecomScenario}
                      onChange={e => setEcomScenario(e.target.value as EcomScenario)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] focus:border-accent/60 outline-none"
                    >
                      {PHOTO_SCENARIOS.map(s => (
                        <option key={s} value={s}>{SCENARIO_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1 block">
                      ③ 投哪平台
                    </label>
                    <select
                      value={ecomStyle}
                      onChange={e => setEcomStyle(e.target.value as EcomStyle)}
                      className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] focus:border-accent/60 outline-none"
                    >
                      {Object.entries(STYLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-1 block">
                    ④ 一句话告诉系统你的产品(可选,留空也能跑通用模板)
                  </label>
                  <input
                    type="text"
                    value={productHint}
                    onChange={e => setProductHint(e.target.value)}
                    placeholder="例: 粉色露肩 T 恤 / 智能蓝牙耳机黑色 / 红枣山药八珍糕 50g"
                    className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] focus:border-accent/60 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[10px] font-mono text-text-tertiary leading-relaxed">
                    点应用 → 系统自动拼出 100+ 字工业级 prompt 喂下去 + 自动切对应模式 + 自动调比例
                  </p>
                  <button
                    onClick={applyEcomTemplate}
                    className="px-4 py-2 bg-accent text-bg-root text-[12px] font-semibold rounded hover:bg-accent-hover"
                  >
                    应用模板 →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {(Object.keys(MODES) as Mode[]).map(m => {
              const mm = MODES[m];
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-accent text-bg-root shadow-lg'
                      : 'border border-border-subtle text-text-secondary hover:border-accent/40 hover:text-text-primary'
                  }`}
                >
                  <span className="text-base">{mm.icon}</span>
                  <span>{mm.title}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-mono text-text-tertiary mt-3">
            {meta.icon} {meta.desc} · <span className="text-accent">{meta.cost}</span>
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        {/* LEFT · Sticky control panel */}
        <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
          {/* Reference uploads */}
          {requiredSlots > 0 && (
            <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
                ① 垫图 ({requiredSlots} 张)
              </div>
              {meta.refSlots.map((slot, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-text-secondary">
                      {slot.label} {slot.required && <span className="text-error">*</span>}
                    </span>
                    <span className="text-[9px] font-mono text-text-tertiary">{slot.hint}</span>
                  </div>
                  {refImages[i] ? (
                    <div className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={refImages[i] as string} alt={slot.label} className="w-full rounded-md border border-border-default max-h-[200px] object-contain bg-bg-root" />
                      <button
                        onClick={() => removeRef(i)}
                        className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-bg-root/80 backdrop-blur text-[10px] font-mono text-text-primary rounded hover:bg-error/20 hover:text-error"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <label
                      className="block border-2 border-dashed border-border-default hover:border-accent/60 rounded-md p-4 text-center cursor-pointer transition-colors"
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => {
                        e.preventDefault();
                        const f = e.dataTransfer.files?.[0];
                        if (f && f.type.startsWith('image/')) handleFile(f, i);
                      }}
                    >
                      <input
                        ref={el => { fileInputRefs.current[i] = el; }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f, i);
                        }}
                      />
                      <div className="text-xl mb-1">📤</div>
                      <p className="text-[11px] text-text-primary font-semibold">点击或拖放</p>
                      <p className="text-[9px] font-mono text-text-tertiary">PNG/JPG/WebP ≤10MB</p>
                    </label>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* 额外 prompt */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-2">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              {requiredSlots > 0 ? '②' : '①'} 额外细节 (可选)
            </div>
            <textarea
              value={extraPrompt}
              onChange={e => setExtraPrompt(e.target.value)}
              placeholder={meta.promptHint}
              rows={3}
              className="w-full px-3 py-2 bg-bg-surface border border-border-default rounded text-[12px] resize-none focus:border-accent/60 outline-none"
            />
            <button
              onClick={() => setShowFinalPrompt(s => !s)}
              className="text-[10px] font-mono text-text-tertiary hover:text-accent"
            >
              {showFinalPrompt ? '▼ 隐藏完整 prompt' : '▶ 查看完整 prompt'}
            </button>
            {showFinalPrompt && (
              <pre className="text-[10px] font-mono text-text-secondary bg-bg-root border border-border-subtle rounded p-2 max-h-[140px] overflow-y-auto whitespace-pre-wrap">
                {finalPrompt}
              </pre>
            )}
          </section>

          {/* 输出参数 */}
          <section className="border border-border-subtle rounded-lg p-4 bg-bg-surface/30 space-y-3">
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">
              输出参数
            </div>
            <Field label="质量">
              <Pills
                options={[
                  { id: 'low', cn: '低 $0.011' },
                  { id: 'medium', cn: '中 $0.042' },
                  { id: 'high', cn: '高 $0.167' },
                ]}
                value={quality}
                onChange={v => setQuality(v as Quality)}
              />
            </Field>
            <Field label="尺寸">
              <Pills
                options={[
                  { id: '1024x1024', cn: '方形' },
                  { id: '1024x1536', cn: '竖图(模特推荐)' },
                  { id: '1536x1024', cn: '横图' },
                ]}
                value={size}
                onChange={v => setSize(v as Size)}
              />
            </Field>
            <Field label="数量">
              <Pills
                options={[1, 2, 3, 4].map(x => ({ id: String(x), cn: `${x} 张` }))}
                value={String(n)}
                onChange={v => setN(parseInt(v, 10))}
              />
            </Field>
            <div className="text-[10px] font-mono text-text-tertiary tabular-nums pt-1 border-t border-border-subtle">
              预估成本: ${estCostUsd.toFixed(3)} ≈ ¥{(estCostUsd * 7.2).toFixed(2)}
            </div>
          </section>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleGenerate}
              disabled={running}
              className="w-full py-3.5 bg-accent text-bg-root rounded-lg text-[14px] font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {running ? '生成中... (15-40 秒)' : `🎬 开始生成 · ${n} 张`}
            </button>
            <Link
              href={standardPackHref}
              className="w-full py-3.5 rounded-lg text-[12px] font-bold text-center border border-cat-content/40 text-cat-content hover:bg-cat-content/10 transition-colors"
            >
              生成影棚 SOP 标品包
            </Link>
          </div>

          {error && (
            <div className="p-3 border border-error/40 bg-error/5 rounded text-[11px] text-error">
              ✗ {error}
            </div>
          )}
        </aside>

        {/* RIGHT · Result */}
        <main className="space-y-4 min-h-[600px]">
          {running && (
            <>
              {/* 流转进度提示条 */}
              <div className="mb-4 border border-accent/40 bg-accent/5 rounded-lg p-4 flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-[14px]">
                    {MODES[mode].icon}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-text-primary mb-0.5">
                    {MODES[mode].title} · 调用 GPT Image 2 中
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary tabular-nums">
                    HappyHorse 异步任务 · 通常 30-60 秒 · 实时轮询任务状态
                  </div>
                </div>
                <div className="text-[10px] font-mono text-accent/70 tabular-nums hidden md:block">
                  {n} 张 · {size}
                </div>
              </div>
              {/* 骨架占位 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: n }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-lg bg-gradient-to-br from-bg-surface via-bg-raised to-bg-surface border border-border-subtle relative overflow-hidden"
                  >
                    {/* shimmer 扫光效果 */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[10px] font-mono text-accent/60 uppercase tracking-wider mb-1">
                          slot {i + 1} / {n}
                        </div>
                        <div className="w-1.5 h-1.5 mx-auto rounded-full bg-accent animate-pulse-dot" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!running && images.length === 0 && <EmptyState mode={mode} />}

          {!running && images.length > 0 && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[14px] font-bold text-text-primary flex items-center gap-2 flex-wrap">
                    生成完成 · {images.length} 张
                    {fromCache && (
                      <span className="text-[9px] font-mono text-success border border-success/40 bg-success/10 rounded px-1.5 py-0.5">
                        ⚡ 缓存命中 · 未消耗 quota
                      </span>
                    )}
                  </div>
                  {fromCache ? (
                    <div className="text-[10px] font-mono text-success mt-0.5 tabular-nums">
                      同 prompt + 同垫图 + 同尺寸 7 天内已生过 · ¥0 复用 · 想强刷加 ?fresh=1
                    </div>
                  ) : cost && (
                    <div className="text-[10px] font-mono text-text-tertiary mt-0.5 tabular-nums">
                      实际成本: ${cost.totalUsd} ≈ ¥{(cost.totalUsd * 7.2).toFixed(2)} · 真人拍摄需 ¥{({
                        'model-generate': '1000-3000',
                        'outfit-swap': '3000-8000',
                        'pose-change': '2000-5000',
                        'scene-change': '3000-10000',
                        'ootd-flatlay': '500-2000',
                        'platform-style': '2000-5000',
                        'full-detail-set': '3000-10000',
                        'hot-clone': '1000-3000',
                      } as Record<Mode, string>)[mode]}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link
                    href={resultStandardPackHref}
                    className="px-3 py-1.5 border border-cat-content/40 text-cat-content text-[11px] font-mono rounded hover:bg-cat-content/10"
                  >
                    生成素材验收标品包
                  </Link>
                  <button
                    onClick={saveToSkuLibrary}
                    disabled={savingSku || savedSku}
                    className={`px-3 py-1.5 text-[11px] font-mono rounded transition-colors ${
                      savedSku
                        ? 'border border-success/40 bg-success/10 text-success'
                        : 'border border-accent/40 text-accent hover:bg-accent/10'
                    } disabled:opacity-50`}
                  >
                    {savedSku ? '✓ 已入 SKU 库' : savingSku ? '保存中...' : '📦 入 SKU 库'}
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="px-3 py-1.5 border border-accent/40 text-accent text-[11px] font-mono rounded hover:bg-accent/10 disabled:opacity-50"
                  >
                    {sharing ? '分享中...' : '🔗 公开分享'}
                  </button>
                  <button
                    onClick={downloadAllZip}
                    className="px-3 py-1.5 border border-accent/40 text-accent text-[11px] font-mono rounded hover:bg-accent/10"
                  >
                    📦 全部 ZIP
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-3 py-1.5 border border-border-default text-text-primary text-[11px] font-mono rounded hover:border-accent/40"
                  >
                    🔄 再生一组
                  </button>
                </div>
              </div>

              {shareUrl && (
                <div className="border border-success/40 bg-success/5 rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap animate-fade-up">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-success uppercase tracking-wider mb-1.5">
                      ✓ 分享链接已复制 · 7 天有效
                    </div>
                    <code className="text-[11px] font-mono text-text-primary block break-all bg-bg-root/50 border border-border-subtle rounded px-2 py-1.5">
                      {shareUrl}
                    </code>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-accent border border-accent/30 hover:bg-accent/10 rounded px-2 py-1"
                      >
                        🔗 打开 →
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(shareUrl)}
                        className="text-[10px] font-mono text-text-secondary border border-border-default hover:border-accent/40 rounded px-2 py-1"
                      >
                        📋 再次复制
                      </button>
                      <button
                        onClick={() => setShareUrl(null)}
                        className="ml-auto text-[10px] font-mono text-text-tertiary hover:text-text-primary"
                      >
                        ✗ 关闭
                      </button>
                    </div>
                  </div>
                  {/* QR 码 · 手机扫一扫直接打开分享页 */}
                  <div className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=8&data=${encodeURIComponent(shareUrl)}`}
                      alt="扫码看图"
                      className="w-[120px] h-[120px] rounded bg-white p-1"
                      width={120}
                      height={120}
                    />
                    <span className="text-[9px] font-mono text-text-tertiary">手机扫一扫</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`group relative rounded-lg border border-border-subtle overflow-hidden hover:border-accent/60 hover:shadow-[0_12px_40px_rgba(200,151,90,0.18)] transition-all duration-300 hover:-translate-y-1 animate-fade-up stagger-${Math.min(idx + 1, 6)}`}
                    style={idx > 5 ? { animationDelay: `${0.05 + idx * 0.05}s` } : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`AI 生成 ${idx + 1}`}
                      className="w-full h-auto block cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.02]"
                      onClick={() => setPreviewImage(img.url)}
                    />
                    {/* 角标 */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-bg-root/70 backdrop-blur-sm rounded text-[9px] font-mono text-accent uppercase tracking-wider">
                      #{idx + 1} · {img.provider}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-root/95 via-bg-root/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end gap-2">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setPreviewImage(img.url)}
                          className="text-[10px] font-mono px-2.5 py-1 bg-bg-root/90 backdrop-blur-sm text-text-primary rounded hover:bg-accent hover:text-bg-root transition-colors"
                        >
                          🔍 放大
                        </button>
                        <button
                          onClick={() => downloadImage(img.url, idx)}
                          className="text-[10px] font-mono px-2.5 py-1 bg-bg-root/90 backdrop-blur-sm text-text-primary rounded hover:bg-accent hover:text-bg-root transition-colors"
                        >
                          ⬇ 下载
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Workflow next-step hint */}
              <NextStepHint mode={mode} onSwitch={switchMode} />

              {/* Cost compare */}
              <div className="border border-success/30 bg-success/5 rounded-lg p-4 mt-4">
                <div className="text-[11px] font-mono text-success uppercase tracking-wider mb-2">
                  💰 成本对比
                </div>
                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div>
                    <div className="text-text-tertiary">真人摄影 + 后期</div>
                    <div className="text-text-primary font-bold text-lg">
                      ¥{({
                        'model-generate': '1000-3000',
                        'outfit-swap': '3000-8000',
                        'pose-change': '2000-5000',
                        'scene-change': '3000-10000',
                        'ootd-flatlay': '500-2000',
                        'platform-style': '2000-5000',
                        'full-detail-set': '3000-10000',
                        'hot-clone': '1000-3000',
                      } as Record<Mode, string>)[mode]}
                    </div>
                    <div className="text-text-tertiary text-[10px] mt-0.5">需 1-3 天 · 拍完只能用一次</div>
                  </div>
                  <div>
                    <div className="text-success">AI 影棚 · 本次</div>
                    <div className="text-success font-bold text-lg">
                      ¥{((cost?.totalUsd || 0) * 7.2).toFixed(2)}
                    </div>
                    <div className="text-success/70 text-[10px] mt-0.5">
                      30 秒 · 不满意秒重生 · 可无限复用
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-bg-root/95 backdrop-blur z-50 flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewImage} alt="preview" className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-text-primary text-2xl hover:text-accent"
          >
            ✗
          </button>
        </div>
      )}

      {/* Footer / cross-link */}
      <div className="max-w-[1280px] mx-auto px-6 py-10 border-t border-border-subtle mt-10">
        <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3">
          其他模块
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pipelines/new-listing" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            新品上架 Pipeline →
          </Link>
          <Link href="/pipelines/influencer-outbound" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            达人外联 Pipeline →
          </Link>
          <Link href="/pipelines/product-image" className="px-3 py-1.5 border border-border-subtle rounded text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent">
            产品图 (wanx · 中文 prompt) →
          </Link>
          <Link href="/inquire?from=ai-photoshoot" className="px-3 py-1.5 border border-accent/30 rounded text-[11px] font-mono text-accent hover:bg-accent/10">
            企业批量定制 →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Subcomponents
// ============================================================
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono text-text-secondary mb-1">{label}</div>
      {children}
    </div>
  );
}

function Pills({
  options,
  value,
  onChange,
}: {
  options: { id: string; cn: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
              active
                ? 'bg-accent text-bg-root'
                : 'border border-border-subtle text-text-secondary hover:border-accent/40 hover:text-text-primary'
            }`}
          >
            {o.cn}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ mode }: { mode: Mode }) {
  const samples: Record<Mode, { emoji: string; title: string; desc: string }[]> = {
    'model-generate': [
      { emoji: '👩', title: '日系甜酷女模', desc: '亚洲面孔 · 马尾 · 格纹衬衫 · 百褶裙 · 厚底鞋' },
      { emoji: '🧑', title: '欧美街头男模', desc: '混血面孔 · 短发 · 工装外套 · 牛仔裤 · 马丁靴' },
      { emoji: '👵', title: '银发轻熟女模', desc: '50+ 优雅气质 · 大牌走秀风' },
    ],
    'outfit-swap': [
      { emoji: '👗', title: '连衣裙上身', desc: '模特图 + 平铺连衣裙 → 上身效果' },
      { emoji: '🧥', title: '外套换装', desc: '同一模特换不同外套对比' },
      { emoji: '👚', title: '衬衫多色', desc: '一件款式 5 个颜色,模特同姿势对比' },
    ],
    'pose-change': [
      { emoji: '🚶', title: '站坐走回眸', desc: '一张造型 → 4 种姿势' },
      { emoji: '📸', title: '杂志大片', desc: '正面 / 侧面 / 背面 / 特写' },
      { emoji: '🎭', title: '动作多变', desc: '保人物不变,只改动作' },
    ],
    'scene-change': [
      { emoji: '🏠', title: '居家场景', desc: '沙发 / 阳台 / 厨房' },
      { emoji: '☕', title: '咖啡馆', desc: '木质桌椅 / 自然光 / 文艺感' },
      { emoji: '🌃', title: '街拍', desc: '日系街头 / 巴黎 / 东京' },
    ],
    'ootd-flatlay': [
      { emoji: '🛍️', title: '完整造型拆解', desc: '上衣 + 裙子 + 鞋 + 配饰平铺' },
      { emoji: '💍', title: 'ins 风排版', desc: '纯白底 + OOTD 花体标题' },
      { emoji: '🎨', title: '电商单品图', desc: '每件单独立项,适合详情页' },
    ],
    'platform-style': [
      { emoji: '🟧', title: 'Amazon 极简', desc: '白底 45° · listing 规范' },
      { emoji: '🟦', title: '淘宝精致', desc: '木质道具 · 自然光 · 小资美学' },
      { emoji: '🟥', title: '拼多多冲击', desc: '高饱和 · 大字促销 · 接地气' },
    ],
    'full-detail-set': [
      { emoji: '①', title: '主图组', desc: '白底 + 45° + 正面平视 3 张' },
      { emoji: '⑥', title: '场景使用组', desc: '生活场景 + 人手互动 3 张' },
      { emoji: '⑫', title: '参数包装组', desc: '参数标注 + 包装外观 + 拆箱内含' },
    ],
    'hot-clone': [
      { emoji: '🔥', title: '参考高转化结构', desc: '提炼同类目主图的信息层级和卖点表达' },
      { emoji: '🎯', title: '生成差异化方案', desc: '产品本体保留,构图/排版/道具重新设计' },
      { emoji: '⚖️', title: '保留终审边界', desc: '避免照抄 logo/品牌名/促销价和独特版式' },
    ],
  };
  const meta = MODES[mode];
  return (
    <div className="border border-dashed border-border-default rounded-lg p-8">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{meta.icon}</div>
        <h3 className="text-[16px] font-bold text-text-primary mb-1">{meta.title} · 示例</h3>
        <p className="text-[12px] text-text-tertiary">左侧填好后右下角按钮开始生成</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {samples[mode].map((s, i) => (
          <div key={i} className="border border-border-subtle rounded-lg p-3 bg-bg-surface/30">
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="text-[12px] font-semibold text-text-primary mb-1">{s.title}</div>
            <div className="text-[11px] text-text-tertiary leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 闭环引导: 生成完一张图后建议下一步
function NextStepHint({ mode, onSwitch }: { mode: Mode; onSwitch: (m: Mode) => void }) {
  const next: Record<Mode, { mode: Mode; cta: string } | null> = {
    'model-generate': { mode: 'outfit-swap', cta: '下载这张模特图后,去模特换装给 ta 换衣服' },
    'outfit-swap': { mode: 'pose-change', cta: '换装完成 → 去模特换姿生成 4 个角度' },
    'pose-change': { mode: 'scene-change', cta: '姿势齐了 → 去模特换景把 ta 放进不同场景' },
    'scene-change': { mode: 'ootd-flatlay', cta: '场景拍完 → 去 OOTD 拆解一套出 8 张单品图' },
    'ootd-flatlay': { mode: 'platform-style', cta: '单品出齐 → 去平台调性按 Amazon/淘宝/拼多多重做主图' },
    'platform-style': { mode: 'full-detail-set', cta: '主图选定 → 去全套详情一键生成 12 张完整详情页' },
    'full-detail-set': { mode: 'hot-clone', cta: '参考行业结构 → 生成差异化主图候选' },
    'hot-clone': null,
  };
  const n = next[mode];
  if (!n) return null;
  return (
    <div className="border border-accent/30 bg-accent/5 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="text-[12px] text-text-secondary">
        <span className="text-accent font-semibold">闭环工作流 →</span> {n.cta}
      </div>
      <button
        onClick={() => onSwitch(n.mode)}
        className="text-[11px] font-mono px-3 py-1.5 bg-accent text-bg-root rounded hover:bg-accent-hover"
      >
        {MODES[n.mode].icon} {MODES[n.mode].title} →
      </button>
    </div>
  );
}
