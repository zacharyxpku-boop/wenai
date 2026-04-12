/**
 * HTML Builder - Generates module HTML and final assembled page
 * Each module is a self-contained section with data-module-id attribute
 */

export function buildModuleHTML(module, tokens, assetsBasePath) {
  const c = module.content;
  const type = module.module_type_guess;

  switch (type) {
    case 'brand_header': return buildHeader(c, tokens);
    case 'pain_points': return buildPainPoints(c, tokens);
    case 'value_proposition': return buildValueProp(c, tokens);
    case 'expert_profile': return buildExpert(c, tokens);
    case 'product_contents': return buildProducts(c, tokens);
    case 'statistics': return buildStats(c, tokens);
    case 'testimonials': return buildTestimonials(c, tokens);
    case 'cta': return buildCTA(c, tokens);
    default: return `<section data-module-id="${module.module_id}" style="padding:40px;text-align:center;color:#666;">Unknown module type: ${type}</section>`;
  }
}

function sectionDivider() {
  return `<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:40px;">
    <span style="width:60px;height:1px;background:linear-gradient(90deg,transparent,#D4A843)"></span>
    <span style="width:6px;height:6px;background:#D4A843;border-radius:50%;box-shadow:0 0 6px rgba(212,168,67,0.35)"></span>
    <span style="width:60px;height:1px;background:linear-gradient(90deg,#D4A843,transparent)"></span>
  </div>`;
}

function sectionTitle(text) {
  return `<h2 style="text-align:center;font-size:32px;font-weight:800;letter-spacing:3px;margin-bottom:12px;background:linear-gradient(180deg,#F2D77E 0%,#D4A843 50%,#C5973E 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${text}</h2>
  ${sectionDivider()}`;
}

function buildHeader(c, t) {
  return `<section data-module-id="module_01" style="position:relative;width:${t.target_width}px;min-height:480px;background:linear-gradient(175deg,#1A1A2E 0%,#0D0D1A 40%,#151528 70%,#1A1A2E 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;padding:60px 40px;">
    <style>
      @keyframes shine{0%,100%{transform:translateX(-60%)}50%{transform:translateX(60%)}}
    </style>
    <div style="position:absolute;top:24px;left:24px;width:60px;height:60px;border-top:2px solid #D4A843;border-left:2px solid #D4A843;opacity:0.4"></div>
    <div style="position:absolute;top:24px;right:24px;width:60px;height:60px;border-top:2px solid #D4A843;border-right:2px solid #D4A843;opacity:0.4"></div>
    <div style="position:absolute;bottom:24px;left:24px;width:60px;height:60px;border-bottom:2px solid #D4A843;border-left:2px solid #D4A843;opacity:0.4"></div>
    <div style="position:absolute;bottom:24px;right:24px;width:60px;height:60px;border-bottom:2px solid #D4A843;border-right:2px solid #D4A843;opacity:0.4"></div>
    <div style="width:200px;height:2px;background:linear-gradient(90deg,transparent,#D4A843,transparent);margin-bottom:12px"></div>
    <div style="font-size:36px;margin-bottom:8px;filter:drop-shadow(0 0 12px rgba(212,168,67,0.5))">👑</div>
    <div style="font-size:14px;letter-spacing:8px;color:#D4A843;margin-bottom:24px;opacity:0.8">${c.sub_label || 'PREMIUM BRAND'}</div>
    <div style="position:relative;display:inline-block;">
      <h1 style="font-size:72px;font-weight:900;letter-spacing:12px;background:linear-gradient(180deg,#F2D77E 0%,#D4A843 30%,#C5973E 50%,#D4A843 70%,#F2D77E 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 2px 8px rgba(212,168,67,0.4));margin-bottom:20px;">${c.brand_name}</h1>
      <div style="position:absolute;top:0;left:-20%;width:140%;height:100%;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 45%,rgba(255,255,255,0.25) 50%,rgba(255,255,255,0.15) 55%,transparent 60%);pointer-events:none;animation:shine 4s ease-in-out infinite"></div>
    </div>
    <p style="font-size:22px;color:rgba(255,255,255,0.85);letter-spacing:6px;margin-bottom:28px;text-shadow:0 1px 4px rgba(0,0,0,0.5)">${c.tagline}</p>
    <div style="display:flex;align-items:center;gap:16px;">
      <span style="width:80px;height:1px;background:linear-gradient(90deg,transparent,#D4A843)"></span>
      <span style="width:10px;height:10px;background:#D4A843;transform:rotate(45deg);box-shadow:0 0 8px rgba(212,168,67,0.6)"></span>
      <span style="width:80px;height:1px;background:linear-gradient(90deg,#D4A843,transparent)"></span>
    </div>
  </section>`;
}

function buildPainPoints(c, t) {
  const cards = (c.items || []).map(item => `
    <div style="background:linear-gradient(135deg,rgba(30,30,55,0.95),rgba(20,20,42,0.95));border:1px solid rgba(212,168,67,0.3);border-radius:12px;padding:28px 24px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#D4A843,transparent)"></div>
      <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#2a2a4a,#1e1e3a);border:2px solid rgba(212,168,67,0.3);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px">${item.icon}</div>
      <p style="font-size:15px;color:rgba(255,255,255,0.85);line-height:1.5;white-space:pre-line">${item.text}</p>
    </div>`).join('');

  return `<section data-module-id="module_02" style="background:linear-gradient(180deg,#0D0D1A,#141428,#0D0D1A);padding:56px 40px 60px;">
    ${sectionTitle(c.section_title)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">${cards}</div>
  </section>`;
}

function buildValueProp(c, t) {
  const cards = (c.items || []).map(item => `
    <div style="background:linear-gradient(145deg,rgba(40,35,20,0.7),rgba(30,25,15,0.8));border:1px solid rgba(212,168,67,0.25);border-radius:12px;padding:30px 24px;text-align:center;position:relative;overflow:hidden;">
      <div style="position:absolute;bottom:0;left:20%;right:20%;height:2px;background:linear-gradient(90deg,transparent,#D4A843,transparent)"></div>
      <div style="font-size:36px;margin-bottom:14px;filter:drop-shadow(0 2px 8px rgba(212,168,67,0.3))">${item.icon}</div>
      <h3 style="font-size:17px;font-weight:700;color:#F2D77E;margin-bottom:8px">${item.title}</h3>
      <p style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.5">${item.desc}</p>
    </div>`).join('');

  return `<section data-module-id="module_03" style="background:linear-gradient(180deg,#0D0D1A,#1A1A2E,#0D0D1A);padding:56px 40px 60px;">
    ${sectionTitle(c.section_title)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">${cards}</div>
  </section>`;
}

function buildExpert(c, t) {
  const avatarStyle = c.avatar_image
    ? `background-image:url('${c.avatar_image}');background-size:cover;background-position:center;`
    : `background:linear-gradient(145deg,#C5973E,#A07D2E);font-size:32px;font-weight:800;color:#0D0D1A;display:flex;align-items:center;justify-content:center;`;

  const avatarContent = c.avatar_image ? '' : (c.initial || c.name?.charAt(0) || '师');

  const creds = (c.credentials || []).map(cr =>
    `<li style="font-size:14px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:8px;">
      <span style="color:#D4A843;font-size:12px;">✦</span>${cr}
    </li>`).join('');

  return `<section data-module-id="module_04" style="background:linear-gradient(180deg,#0D0D1A,#12122a,#0D0D1A);padding:56px 40px 60px;">
    ${sectionTitle(c.section_title)}
    <div style="max-width:520px;margin:0 auto;background:linear-gradient(145deg,rgba(28,28,52,0.95),rgba(18,18,38,0.95));border:1px solid rgba(212,168,67,0.3);border-radius:16px;padding:40px 36px;display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;">
      <div style="position:absolute;top:-1px;left:30%;right:30%;height:3px;background:linear-gradient(90deg,transparent,#D4A843,transparent);border-radius:0 0 4px 4px;"></div>
      <div style="width:90px;height:90px;border-radius:50%;border:3px solid #D4A843;${avatarStyle}margin-bottom:20px;box-shadow:0 4px 20px rgba(212,168,67,0.3);">${avatarContent}</div>
      <div style="font-size:24px;font-weight:700;color:#fff;margin-bottom:16px;">${c.name}</div>
      <ul style="list-style:none;display:flex;flex-direction:column;gap:10px;">${creds}</ul>
    </div>
  </section>`;
}

function buildProducts(c, t) {
  const items = (c.items || []).map(item => `
    <div style="background:linear-gradient(135deg,rgba(28,28,52,0.9),rgba(18,18,40,0.95));border:1px solid rgba(212,168,67,0.3);border-radius:12px;padding:28px 30px;display:flex;align-items:center;gap:24px;position:relative;overflow:hidden;">
      <div style="position:absolute;left:0;top:15%;bottom:15%;width:3px;background:linear-gradient(180deg,transparent,#D4A843,transparent)"></div>
      <div style="font-size:48px;flex-shrink:0;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3))">${item.emoji}</div>
      <div>
        <h3 style="font-size:18px;font-weight:700;color:#F2D77E;margin-bottom:6px">${item.title}</h3>
        <p style="font-size:14px;color:rgba(255,255,255,0.55);line-height:1.5">${item.desc}</p>
      </div>
    </div>`).join('');

  return `<section data-module-id="module_05" style="background:linear-gradient(180deg,#0D0D1A,#1A1A2E,#0D0D1A);padding:56px 40px 60px;">
    ${sectionTitle(c.section_title)}
    <div style="display:flex;flex-direction:column;gap:20px;">${items}</div>
  </section>`;
}

function buildStats(c, t) {
  const statCards = (c.stats || []).map(s => `
    <div style="background:linear-gradient(145deg,rgba(35,30,18,0.8),rgba(25,22,14,0.9));border:1px solid rgba(212,168,67,0.2);border-radius:12px;padding:28px 20px;text-align:center;">
      <div style="font-size:44px;font-weight:900;background:linear-gradient(180deg,#F2D77E,#D4A843 60%,#C5973E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1;margin-bottom:8px">${s.number}</div>
      <div style="font-size:14px;color:rgba(255,255,255,0.55)">${s.label}</div>
    </div>`).join('');

  const progressBars = (c.progress || []).map(p => `
    <div style="display:flex;align-items:center;gap:14px;">
      <span style="font-size:13px;color:rgba(255,255,255,0.85);width:120px;flex-shrink:0;text-align:right">${p.label}</span>
      <div style="flex:1;height:14px;background:rgba(255,255,255,0.06);border-radius:7px;overflow:hidden">
        <div style="height:100%;width:${p.value}%;border-radius:7px;background:linear-gradient(90deg,#A07D2E,#D4A843,#F2D77E);box-shadow:0 0 10px rgba(212,168,67,0.35)"></div>
      </div>
      <span style="font-size:13px;color:#F2D77E;width:42px;font-weight:700">${p.value}%</span>
    </div>`).join('');

  return `<section data-module-id="module_06" style="background:linear-gradient(180deg,#0D0D1A,#141430,#0D0D1A);padding:56px 40px 60px;">
    ${sectionTitle(c.section_title)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:36px">${statCards}</div>
    <div style="display:flex;flex-direction:column;gap:16px">${progressBars}</div>
  </section>`;
}

function buildTestimonials(c, t) {
  const cards = (c.items || []).map(item => `
    <div style="background:linear-gradient(135deg,rgba(28,28,50,0.9),rgba(18,18,38,0.95));border:1px solid rgba(212,168,67,0.3);border-radius:12px;padding:28px 30px;position:relative;">
      <div style="position:absolute;top:12px;left:20px;font-size:48px;color:#D4A843;opacity:0.25;font-family:Georgia,serif;line-height:1">\u201C</div>
      <div style="font-size:16px;color:#D4A843;margin-bottom:10px;letter-spacing:2px">★★★★★</div>
      <p style="font-size:15px;color:rgba(255,255,255,0.85);line-height:1.6;margin-bottom:12px;font-style:italic">${item.text}</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.55);text-align:right">${item.author}</p>
    </div>`).join('');

  return `<section data-module-id="module_07" style="background:linear-gradient(180deg,#0D0D1A,#1A1A2E,#0D0D1A);padding:56px 40px 60px;">
    ${sectionTitle(c.section_title)}
    <div style="display:flex;flex-direction:column;gap:20px">${cards}</div>
  </section>`;
}

function buildCTA(c, t) {
  const perks = (c.perks || []).map(p =>
    `<span style="font-size:14px;color:rgba(255,255,255,0.55);display:flex;align-items:center;gap:6px">
      <span style="color:#D4A843;font-weight:700">✓</span>${p}
    </span>`).join('');

  return `<section data-module-id="module_08" style="background:linear-gradient(180deg,#0D0D1A,#151530 40%,#1A1A2E);padding:56px 40px 48px;text-align:center;position:relative;">
    <style>@keyframes btn-shine{0%{left:-50%}100%{left:150%}}</style>
    <div style="display:inline-block;background:linear-gradient(135deg,#C62828,#E53935);color:#fff;font-size:14px;font-weight:700;padding:6px 24px;border-radius:20px;margin-bottom:24px;letter-spacing:2px;box-shadow:0 2px 12px rgba(198,40,40,0.4)">${c.badge}</div>
    <div style="margin-bottom:28px">
      <span style="font-size:20px;color:rgba(255,255,255,0.55);text-decoration:line-through;margin-right:12px">${c.original_price}</span><br>
      <span style="font-size:24px;font-weight:700;color:#D4A843">¥</span><span style="font-size:56px;font-weight:900;background:linear-gradient(180deg,#F2D77E,#D4A843 50%,#C5973E);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 2px 6px rgba(212,168,67,0.35))">${c.price}</span>
    </div>
    <div style="margin-bottom:28px">
      <div style="display:inline-block;background:linear-gradient(135deg,#C5973E,#D4A843 40%,#F2D77E);color:#0D0D1A;font-size:22px;font-weight:800;padding:16px 80px;border-radius:50px;letter-spacing:4px;box-shadow:0 4px 24px rgba(212,168,67,0.4),inset 0 1px 0 rgba(255,255,255,0.3);cursor:pointer;position:relative;overflow:hidden;">
        ${c.cta_text}
        <div style="position:absolute;top:0;left:-50%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:btn-shine 3s ease-in-out infinite"></div>
      </div>
    </div>
    <div style="display:flex;justify-content:center;gap:32px;margin-bottom:40px">${perks}</div>
    <div style="padding-top:28px;border-top:1px solid rgba(212,168,67,0.15)">
      <div style="font-size:18px;font-weight:700;background:linear-gradient(180deg,#F2D77E,#D4A843);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:4px;margin-bottom:6px">${c.brand_name}</div>
      <p style="font-size:12px;color:rgba(255,255,255,0.55)">${c.footer_text}</p>
    </div>
  </section>`;
}

export function buildFinalHTML(moduleHTMLs, tokens) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${tokens.target_width}">
<title>长图预览</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0a0a12;
  font-family: ${tokens.fonts};
  display: flex; justify-content: center;
  color: #fff; line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
.container { width: ${tokens.target_width}px; }
</style>
</head>
<body>
<div class="container">
${moduleHTMLs.join('\n')}
</div>
</body>
</html>`;
}
