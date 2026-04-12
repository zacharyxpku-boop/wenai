/**
 * High-Quality Module Templates
 * Pre-designed, production-grade HTML/CSS for each module type.
 * AI only fills in content — design quality is guaranteed by these templates.
 */

// ─── Shared Design System CSS ───
export const DESIGN_SYSTEM_CSS = `
<style>
:root {
  --gold-1: #F7E8B0;
  --gold-2: #D4A843;
  --gold-3: #C5973E;
  --gold-4: #A07D2E;
  --gold-5: #876B25;
  --gold-gradient: linear-gradient(135deg, #F7E8B0 0%, #D4A843 30%, #C5973E 60%, #A07D2E 100%);
  --gold-shine: linear-gradient(90deg, transparent 0%, rgba(247,232,176,0.4) 50%, transparent 100%);
  --gold-text: linear-gradient(180deg, #F7E8B0, #D4A843, #C5973E);
  --gold-border: linear-gradient(135deg, #D4A843, #A07D2E);
  --dark-1: #0A0A14;
  --dark-2: #12121F;
  --dark-3: #1A1A2E;
  --dark-4: #22223A;
  --dark-5: #2A2A45;
  --white: #FFFFFF;
  --white-90: rgba(255,255,255,0.9);
  --white-70: rgba(255,255,255,0.7);
  --white-50: rgba(255,255,255,0.5);
  --white-30: rgba(255,255,255,0.3);
  --white-10: rgba(255,255,255,0.1);
  --white-05: rgba(255,255,255,0.05);
  --font: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  --font-serif: "Noto Serif SC", "Source Han Serif SC", "PingFang SC", serif;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 20px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 40px rgba(0,0,0,0.5);
  --shadow-gold: 0 4px 20px rgba(212,168,67,0.25);
}
.module { width: 750px; margin: 0 auto; position: relative; overflow: hidden; font-family: var(--font); }
.module * { box-sizing: border-box; }
.gold-text {
  background: var(--gold-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.gold-bar {
  width: 60px; height: 3px; margin: 16px auto;
  background: var(--gold-gradient); border-radius: 2px;
}
.gold-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--gold-2); display: inline-block;
  box-shadow: 0 0 8px rgba(212,168,67,0.5);
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.shimmer {
  background: linear-gradient(90deg, var(--gold-4) 0%, var(--gold-1) 25%, var(--gold-2) 50%, var(--gold-1) 75%, var(--gold-4) 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 4s ease-in-out infinite;
}
</style>`;

// ─── Module: Header ───
export function renderHeader(data) {
  return `<section class="module" style="background: var(--dark-1); padding: 60px 40px 50px; text-align: center;">
  <!-- Decorative corner elements -->
  <div style="position:absolute;top:20px;left:20px;width:40px;height:40px;border-top:2px solid var(--gold-3);border-left:2px solid var(--gold-3);opacity:0.5;"></div>
  <div style="position:absolute;top:20px;right:20px;width:40px;height:40px;border-top:2px solid var(--gold-3);border-right:2px solid var(--gold-3);opacity:0.5;"></div>
  <div style="position:absolute;bottom:20px;left:20px;width:40px;height:40px;border-bottom:2px solid var(--gold-3);border-left:2px solid var(--gold-3);opacity:0.5;"></div>
  <div style="position:absolute;bottom:20px;right:20px;width:40px;height:40px;border-bottom:2px solid var(--gold-3);border-right:2px solid var(--gold-3);opacity:0.5;"></div>

  <!-- Top ornament -->
  <div style="margin-bottom:24px;">
    <span style="display:inline-block;width:80px;height:1px;background:var(--gold-gradient);vertical-align:middle;"></span>
    <span style="display:inline-block;width:10px;height:10px;border:1.5px solid var(--gold-2);transform:rotate(45deg);margin:0 12px;vertical-align:middle;"></span>
    <span style="display:inline-block;width:80px;height:1px;background:var(--gold-gradient);vertical-align:middle;"></span>
  </div>

  <h1 class="shimmer" style="font-family:var(--font-serif);font-size:48px;font-weight:900;letter-spacing:8px;line-height:1.3;margin-bottom:8px;">
    ${data.title || '标题'}
  </h1>
  <div class="gold-bar"></div>
  <p style="font-size:18px;color:var(--gold-3);letter-spacing:4px;margin-top:16px;font-weight:300;">
    ${data.subtitle || '副标题'}
  </p>

  <!-- Bottom ornament -->
  <div style="margin-top:32px;">
    <span style="display:inline-block;width:120px;height:1px;background:linear-gradient(90deg,transparent,var(--gold-3),transparent);"></span>
  </div>
</section>`;
}

// ─── Module: Hero / Data Highlight ───
export function renderHero(data) {
  return `<section class="module" style="background:linear-gradient(180deg, var(--dark-2) 0%, var(--dark-3) 100%);padding:50px 40px;text-align:center;">
  <!-- Ambient glow -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;height:200px;background:radial-gradient(ellipse, rgba(212,168,67,0.08) 0%, transparent 70%);pointer-events:none;"></div>

  ${data.image ? `<div style="margin-bottom:24px;"><img src="${data.image}" style="max-width:90%;max-height:280px;object-fit:contain;border-radius:12px;box-shadow:var(--shadow-lg);" alt=""></div>` : `
  <div style="width:90%;max-width:600px;margin:0 auto 24px;padding:60px 40px;background:linear-gradient(135deg,rgba(212,168,67,0.06),rgba(212,168,67,0.02));border:1px solid rgba(212,168,67,0.15);border-radius:16px;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(212,168,67,0.02) 10px,rgba(212,168,67,0.02) 20px);"></div>
    <p class="gold-text" style="font-size:42px;font-weight:900;font-family:var(--font-serif);position:relative;letter-spacing:2px;">${data.highlight || '数据亮点'}</p>
    ${data.description ? `<p style="color:var(--white-50);font-size:14px;margin-top:12px;position:relative;">${data.description}</p>` : ''}
  </div>`}
</section>`;
}

// ─── Module: Pain Points ───
export function renderPainPoints(data) {
  const items = data.items || ['痛点1', '痛点2', '痛点3', '痛点4'];
  return `<section class="module" style="background:var(--dark-2);padding:48px 36px;">
  <div style="background:var(--dark-3);border:1px solid rgba(212,168,67,0.12);border-radius:16px;padding:36px 32px;box-shadow:var(--shadow-md);">
    <h2 style="font-size:24px;font-weight:800;color:var(--white);margin-bottom:24px;font-family:var(--font-serif);">
      ${data.title || '你是否有这些问题？'}
    </h2>
    ${items.map(item => `
    <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px;">
      <span class="gold-dot" style="margin-top:8px;flex-shrink:0;"></span>
      <p style="font-size:15px;color:var(--white-70);line-height:1.7;">${item}</p>
    </div>`).join('')}
  </div>
</section>`;
}

// ─── Module: Value Props / Features ───
export function renderValueProps(data) {
  const items = data.items || [{title:'特色1',desc:''},{title:'特色2',desc:''},{title:'特色3',desc:''},{title:'特色4',desc:''}];
  return `<section class="module" style="background:var(--dark-1);padding:48px 32px;">
  <h2 class="gold-text" style="font-size:28px;font-weight:900;text-align:center;margin-bottom:8px;font-family:var(--font-serif);">${data.title || '核心优势'}</h2>
  <div class="gold-bar"></div>

  <!-- Gold accent banner -->
  <div style="margin:24px 0 28px;padding:14px 24px;background:linear-gradient(90deg,var(--gold-2),var(--gold-3));border-radius:4px;">
    <p style="font-size:14px;color:var(--dark-1);font-weight:600;">${data.banner || '介绍产品功能和优势。'}</p>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
    ${items.map((item, i) => `
    <div style="padding:20px 18px;background:var(--dark-3);border:1px solid rgba(212,168,67,0.1);border-radius:12px;transition:all 0.2s;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;width:100%;height:2px;background:var(--gold-gradient);"></div>
      <p style="font-size:15px;font-weight:700;color:var(--white-90);">${item.title || '功能特色' + (i+1)}</p>
      ${item.desc ? `<p style="font-size:12px;color:var(--white-50);margin-top:6px;line-height:1.5;">${item.desc}</p>` : ''}
    </div>`).join('')}
  </div>
</section>`;
}

// ─── Module: Steps / Method ───
export function renderSteps(data) {
  const steps = data.steps || [{title:'步骤一',desc:'描述步骤内容。'},{title:'步骤二',desc:'描述步骤内容。'},{title:'步骤三',desc:'描述步骤内容。'},{title:'步骤四',desc:'描述步骤内容。'}];
  return `<section class="module" style="background:var(--dark-2);padding:48px 36px;">
  <h2 class="gold-text" style="font-size:26px;font-weight:900;text-align:center;font-family:var(--font-serif);">${data.title || '方法步骤'}</h2>
  <p style="text-align:center;font-size:14px;color:var(--white-50);margin-top:8px;margin-bottom:32px;">${data.subtitle || '轻松掌握，扎实基础'}</p>

  ${steps.map((s, i) => `
  <div style="display:flex;align-items:flex-start;gap:18px;margin-bottom:${i < steps.length - 1 ? '28px' : '0'};position:relative;">
    ${i < steps.length - 1 ? `<div style="position:absolute;left:19px;top:44px;bottom:-28px;width:1px;background:linear-gradient(180deg,var(--gold-3),transparent);"></div>` : ''}
    <div style="width:40px;height:40px;border-radius:50%;background:var(--gold-gradient);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--shadow-gold);">
      <span style="font-size:18px;font-weight:900;color:var(--dark-1);">${i + 1}</span>
    </div>
    <div style="flex:1;padding-top:4px;">
      <p style="font-size:16px;font-weight:700;color:var(--white-90);margin-bottom:4px;">${s.title}</p>
      <p style="font-size:13px;color:var(--white-50);line-height:1.6;">${s.desc}</p>
    </div>
  </div>`).join('')}
</section>`;
}

// ─── Module: CTA (Call to Action) ───
export function renderCTA(data) {
  return `<section class="module" style="background:linear-gradient(180deg,var(--dark-1),var(--dark-2));padding:56px 40px;text-align:center;">
  <!-- Ambient glow -->
  <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:500px;height:300px;background:radial-gradient(ellipse,rgba(212,168,67,0.1),transparent 70%);pointer-events:none;"></div>

  <h2 class="shimmer" style="font-size:32px;font-weight:900;font-family:var(--font-serif);margin-bottom:10px;position:relative;">${data.title || '立即行动'}</h2>
  <p style="font-size:16px;color:var(--gold-3);margin-bottom:36px;position:relative;">${data.subtitle || '不要错过'}</p>

  <div style="display:inline-block;padding:16px 56px;background:var(--gold-gradient);border-radius:40px;box-shadow:0 4px 24px rgba(212,168,67,0.4);cursor:pointer;position:relative;overflow:hidden;">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.2) 50%,transparent 100%);animation:shimmer 3s ease-in-out infinite;background-size:200% auto;"></div>
    <span style="font-size:18px;font-weight:800;color:var(--dark-1);letter-spacing:2px;position:relative;">${data.button_text || '了解更多'}</span>
  </div>
</section>`;
}

// ─── Module: Teacher Profile ───
export function renderTeacherProfile(data) {
  const initial = (data.name || '师')[0];
  return `<section class="module" style="background:var(--dark-2);padding:40px 36px;">
  <div style="display:flex;gap:24px;align-items:center;">
    ${data.image ? `<img src="${data.image}" style="width:88px;height:88px;border-radius:50%;object-fit:cover;border:3px solid var(--gold-2);box-shadow:var(--shadow-gold);flex-shrink:0;" alt="">` :
    `<div style="width:88px;height:88px;border-radius:50%;background:var(--gold-gradient);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--shadow-gold);border:3px solid var(--gold-2);">
      <span style="font-size:36px;font-weight:900;color:var(--dark-1);font-family:var(--font-serif);">${initial}</span>
    </div>`}
    <div>
      <h3 style="font-size:22px;font-weight:800;color:var(--white);margin-bottom:4px;">${data.name || '导师'}</h3>
      <p style="font-size:14px;color:var(--gold-3);margin-bottom:6px;">${data.title_text || '资深名师'}</p>
      <p style="font-size:13px;color:var(--white-50);line-height:1.6;">${data.description || '提供专业指导'}</p>
    </div>
  </div>
</section>`;
}

// ─── Module: Product Display ───
export function renderProduct(data) {
  return `<section class="module" style="background:var(--dark-3);padding:40px 32px;">
  <div style="display:flex;gap:24px;align-items:center;">
    <div style="flex:0 0 48%;border-radius:12px;overflow:hidden;position:relative;">
      ${data.image ? `<img src="${data.image}" style="width:100%;display:block;border-radius:12px;box-shadow:var(--shadow-lg);" alt="">` :
      `<div style="width:100%;padding-top:120%;background:linear-gradient(135deg,var(--gold-4),var(--gold-2),var(--gold-1));border-radius:12px;position:relative;box-shadow:var(--shadow-lg);">
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(0,0,0,0.05) 20px,rgba(0,0,0,0.05) 40px);border-radius:12px;"></div>
        <p style="position:absolute;bottom:20px;left:0;right:0;text-align:center;font-size:13px;color:var(--dark-1);font-weight:600;">产品图片</p>
      </div>`}
    </div>
    <div style="flex:1;">
      <h3 class="gold-text" style="font-size:24px;font-weight:900;margin-bottom:12px;font-family:var(--font-serif);">${data.title || '产品介绍'}</h3>
      <p style="font-size:14px;color:var(--white-70);line-height:1.8;margin-bottom:20px;">${data.description || '详细产品信息以及购买方式。'}</p>
      <div style="display:inline-block;padding:10px 28px;background:var(--gold-gradient);border-radius:6px;box-shadow:var(--shadow-gold);">
        <span style="font-size:14px;font-weight:700;color:var(--dark-1);">${data.button_text || '购买链接'}</span>
      </div>
    </div>
  </div>
</section>`;
}

// ─── Module: Data / Stats ───
export function renderStats(data) {
  const stats = data.items || [{number:'583',label:'题解析'},{number:'93%',label:'提高率'},{number:'7',label:'科目覆盖'}];
  return `<section class="module" style="background:var(--dark-1);padding:48px 32px;text-align:center;">
  ${data.title ? `<h2 class="gold-text" style="font-size:24px;font-weight:800;margin-bottom:32px;font-family:var(--font-serif);">${data.title}</h2>` : ''}
  <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">
    ${stats.map(s => `
    <div style="flex:1;min-width:140px;max-width:200px;padding:28px 16px;background:var(--dark-3);border:1px solid rgba(212,168,67,0.12);border-radius:16px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:2px;background:var(--gold-gradient);"></div>
      <p class="shimmer" style="font-size:36px;font-weight:900;font-family:var(--font-serif);margin-bottom:8px;">${s.number}</p>
      <p style="font-size:13px;color:var(--white-50);">${s.label}</p>
    </div>`).join('')}
  </div>
</section>`;
}

// ─── Module: Testimonials ───
export function renderTestimonials(data) {
  const items = data.items || [{text:'评价内容',author:'家长A'},{text:'评价内容',author:'家长B'}];
  return `<section class="module" style="background:var(--dark-2);padding:48px 32px;">
  ${data.title ? `<h2 class="gold-text" style="font-size:24px;font-weight:800;text-align:center;margin-bottom:32px;font-family:var(--font-serif);">${data.title}</h2>` : ''}
  ${items.map(item => `
  <div style="margin-bottom:16px;padding:24px;background:var(--dark-3);border-left:3px solid var(--gold-2);border-radius:0 12px 12px 0;box-shadow:var(--shadow-sm);position:relative;">
    <div style="position:absolute;top:12px;right:16px;font-size:32px;color:rgba(212,168,67,0.15);font-family:serif;">"</div>
    <p style="font-size:14px;color:var(--white-70);line-height:1.8;margin-bottom:12px;">${item.text}</p>
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="color:var(--gold-2);font-size:12px;">★★★★★</span>
      <span style="font-size:12px;color:var(--white-50);">— ${item.author}</span>
    </div>
  </div>`).join('')}
</section>`;
}

// ─── Module: FAQ ───
export function renderFAQ(data) {
  const items = data.items || [{q:'问答 1'},{q:'问答 2'},{q:'问答 3'}];
  return `<section class="module" style="background:var(--dark-2);padding:40px 32px;">
  ${data.title ? `<h2 class="gold-text" style="font-size:22px;font-weight:800;text-align:center;margin-bottom:28px;font-family:var(--font-serif);">${data.title}</h2>` : ''}
  ${items.map((item, i) => `
  <div style="padding:18px 20px;background:var(--dark-3);border:1px solid var(--white-05);border-radius:10px;margin-bottom:${i < items.length - 1 ? '10px' : '0'};display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:15px;color:var(--white-70);font-weight:500;">${item.q}</span>
    <span style="font-size:20px;color:var(--gold-2);font-weight:300;">+</span>
  </div>`).join('')}
</section>`;
}

// ─── Module: Divider ───
export function renderDivider() {
  return `<section class="module" style="background:var(--dark-1);padding:24px 0;text-align:center;">
  <div style="width:200px;height:1px;margin:0 auto;background:linear-gradient(90deg,transparent,var(--gold-3),transparent);"></div>
</section>`;
}

// ─── Module type → renderer mapping ───
const RENDERERS = {
  header: renderHeader,
  hero: renderHero,
  data_highlight: renderHero,
  pain_points: renderPainPoints,
  value_props: renderValueProps,
  features: renderValueProps,
  steps: renderSteps,
  method: renderSteps,
  cta: renderCTA,
  call_to_action: renderCTA,
  teacher_profile: renderTeacherProfile,
  profile: renderTeacherProfile,
  product: renderProduct,
  product_content: renderProduct,
  book_display: renderProduct,
  data_stats: renderStats,
  stats: renderStats,
  testimonials: renderTestimonials,
  faq: renderFAQ,
  divider: renderDivider,
  guarantee: renderCTA,
  comparison: renderValueProps,
  pricing: renderProduct,
};

/**
 * Render a module by type with content data
 */
export function renderModule(moduleType, data) {
  const renderer = RENDERERS[moduleType] || RENDERERS.hero;
  return renderer(data);
}

/**
 * Build full page HTML from modules
 */
export function buildFullPageHTML(modules) {
  const moduleHTMLs = modules.map(m => renderModule(m.type, m.data));

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=750">
<title>长图预览</title>
${DESIGN_SYSTEM_CSS}
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: var(--dark-1);
  display: flex; justify-content: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.page { width: 750px; }
</style>
</head>
<body>
<div class="page">
${moduleHTMLs.join('\n')}
</div>
</body>
</html>`;
}
