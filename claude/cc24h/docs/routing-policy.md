# Commander Routing Policy

How Commander automatically maps user intent → workflow → roles.

## Routing Table

| User Intent Pattern | Workflow | Primary Role | Support Roles |
|---|---|---|---|
| New project / unfamiliar repo | repo-onboarding | 铁律官 | 破局官 |
| Vague idea / "I want to build X" | idea-to-plan | 破局官 | 增长官, 铁律官 |
| Implement / code / build / develop | build-feature | 快刀官 | 铁律官, 尺子官 |
| Bug / broken / error / fix | bug-triage-hotfix | 铁律官→快刀官 | 尺子官 |
| Refactor / restructure / clean up | refactor-safely | 铁律官→快刀官 | 尺子官 |
| Launch / ship / deploy / go live | launch-and-growth | 增长官 | 尺子官, 铁律官 |
| Overnight / auto / sleep / unattended | night-run | Commander | 快刀官 |
| Review / check / merge / recover | review-and-recover | 尺子官 | 铁律官 |
| Page / CTA / copy / conversion / marketing | launch-and-growth | 增长官 | 破局官 |
| Architecture / tech stack / design system | idea-to-plan (Phase 3) | 铁律官 | 破局官 |
| Priority / what to do first / scope | idea-to-plan (Phase 1) | 破局官 | — |
| Test / coverage / verify | build-feature (verify step) | 快刀官 | 尺子官 |
| Try as user / UX test / onboarding test | user-reality-test | 用户战场官 | 增长官, 尺子官 |
| Chatbot quality / AI hardening / demo→prod | chatbot-hardening | AI应用工程官 | 铁律官, 尺子官 |
| Dialog / conversation / intent / memory | chatbot-hardening | AI应用工程官 | 铁律官 |
| Tool calling / agent / MCP integration | chatbot-hardening | AI应用工程官 | 铁律官 |
| Would users actually use this? | user-reality-test | 用户战场官 | 破局官 |
| Start UI project / new frontend | design-system-bootstrap → build-feature | 增长官→快刀官 | 铁律官 |
| Design system / visual tokens / brand | design-system-bootstrap | 增长官 | 铁律官 |
| Check page / see result / screenshot | screenshot-loop | 快刀官 | 增长官 |
| Reference site / learn from / design like | reference-driven-design | 增长官 | 铁律官 |
| Mobile test / phone check / touch | mobile-qa | 用户战场官 | 快刀官 |
| Accessibility / WCAG / contrast / a11y | accessibility-audit | 尺子官 | 快刀官 |
| Performance / speed / bundle / Lighthouse | performance-audit | 铁律官 | 快刀官 |
| Production ready / full check / can we ship | production-readiness-audit | 尺子官 | all |
| Commercial viability / should we build / monetize | commercialization-council-review | Council | Commander selects roles |
| Pricing / how to charge / willingness to pay | commercialization-council-review | 定价官 | 用户洞察官 |
| Portfolio / which product first / prioritize | commercialization-council-review | 战略官 | 市场研究官, Red Team |
| Demo to product gap (business angle) | commercialization-council-review | 成品化总工 | Red Team |
| Pre-launch commercial review | commercialization-council-review | ALL Council | Red Team mandatory |
| Market / niche / industry research | market-research | 增长官 | 破局官 |
| Competitor / teardown / analyze rival | competitor-teardown | 增长官 | 破局官 |
| User voices / reviews / pain points | customer-voice-synthesis | 增长官 | 破局官 |
| Crawl / fetch / collect web pages | web-crawl-collect | 铁律官 | — |
| Extract data from page | page-structured-extract | 铁律官 | 增长官 |
| Audio → text / transcribe recording | audio-transcribe | 快刀官 | — |
| Video → text / transcribe video | video-transcribe | 快刀官 | — |
| Clean transcript / remove filler | transcript-cleanup | 快刀官 | — |
| Research → brief / actionable summary | research-to-brief | 增长官 | 破局官 |
| Repurpose content / multi-format | content-repurpose | 增长官 | 破局官 |
| Marketing / promote / content ops / 做营销 | campaign-brief-generator | 营销总指挥 | Full marketing team |
| XHS post / 小红书 / seed content | multi-channel-content-pack | 文案转化官 | 素材官, Red Team |
| Private domain / 朋友圈 / beta group | private-launch-pack | 渠道冷启动官 | 文案转化官 |
| Referral / share / 裂变 / viral | referral-campaign-pack | 活动裂变官 | 文案转化官, 用户心智官 |
| SEO content / keyword / 内容矩阵 | seo-content-matrix | 内容策划官 | 数据复盘官 |
| Comment reply / QA / 评论回复 | qa-comment-reply-pack | 文案转化官 | 用户心智官, Red Team |
| Marketing retro / 营销复盘 / what worked | marketing-retro-pack | 数据复盘官 | 营销总指挥, Red Team |
| Campaign brief / 营销方案 | campaign-brief-generator | 营销总指挥 | 用户心智官 |

## Commercialization Council Routing

### When to invoke the full Council (commercialization-council-review)

| Trigger | Task Type | Red Team Required? |
|---|---|---|
| User says "该不该做这个产品" / "这个值不值得做" / "商业判断" | new-product-judgment | YES |
| User says "怎么卖" / "怎么收费" / "商业化" / "变现" | single-product-commercialization | Optional |
| User says "demo到成品" / "还差什么" / "能上线吗(商业角度)" | demo-to-product-diagnosis | YES |
| User says "上线前评审" / "联合验收" / "全面评估" | pre-launch-review | YES (all 10 roles) |
| User says "转化率" / "增长" / "冷启动" / "获客" | growth-optimization | Optional |
| User says "产品组合" / "优先级排序" / "做哪个先" / "portfolio" | portfolio-strategy | YES |

### When to invoke PARTIAL Council (subset of roles)

| Scenario | Roles to Invoke | Skip |
|---|---|---|
| Quick pricing check | 定价官 + 用户洞察官 | No Red Team, no full council |
| Market size question | 市场研究官 only | Single role, no debate |
| User psychology question | 用户洞察官 only | Single role, no debate |
| Trust/proof question | 案例官 only | Single role, no debate |
| AI readiness within council | AI工程官 + 成品化总工 | No business roles |

### When Red Team is MANDATORY

Red Team must be present when:
1. A GO/NO-GO decision is being made (new product, launch, kill)
2. Money is being committed (pricing, resource allocation, portfolio shift)
3. Multiple roles reach easy consensus (consensus without friction = likely groupthink)
4. The product is user's own creation (emotional attachment blindspot)

### When NOT to invoke the Council

- Bug fixes, code implementation, architecture decisions → use existing roles directly
- UI/UX implementation → use 增长官 + 快刀官
- Technical readiness → use production-readiness-audit (WF14)
- Pure research with no decision needed → use market-research skill directly

### Council vs Existing Workflow Overlap

| Question | Use Council? | Use Existing WF? |
|---|---|---|
| "Is this product commercially viable?" | YES → council | NO |
| "Is this code production-ready?" | NO | YES → production-readiness-audit |
| "How should the landing page look?" | NO | YES → launch-and-growth |
| "Should we build Product A or Product B first?" | YES → council (portfolio-strategy) | NO |
| "What's blocking this demo from shipping?" | YES → council (demo-to-product-diagnosis) | Also → production-readiness-audit for tech |

## Keyword Detection

Commander scans user input for these patterns:

### → commercialization-council-review
```
商业判断, 值不值得做, 该不该做, 怎么卖, 怎么收费, 商业化, 变现, 定价,
council, 委员会, 联合评审, 联合验收, 全面评估, 产品组合, portfolio,
做哪个先, 优先级排序, 商业可行, 冷启动, 获客, demo到成品, 商业角度
```

### → repo-onboarding
```
接手, 了解, 分析, 读懂, onboard, 新项目, 第一次看, 什么情况
```

### → idea-to-plan
```
想法, 想做, 做一个, 规划, 从零, plan, 新需求, 目标
```

### → build-feature
```
实现, 写代码, 做功能, 开发, 写, build, implement, 干活, 领任务
```

### → bug-triage-hotfix
```
bug, 报错, 挂了, 不工作, 异常, 失败, error, broken, fix, 修
```

### → refactor-safely
```
重构, 整理, 拆, 迁移, 解耦, 统一, refactor, clean, restructure
```

### → launch-and-growth
```
上线, 发布, 部署, launch, ship, 首页, 文案, CTA, 营销, GTM, 增长
```

### → night-run
```
夜间, 今晚, 自动跑, overnight, 无人值守, 去睡了, 持续推进
```

### → review-and-recover
```
review, 收口, 审查, 合并, merge, 恢复, 结果, 进度, 检查, 早上
```

### → user-reality-test
```
用户视角, 试试, 试用, 体验, onboarding, 用户会不会, 流失, 摩擦, friction, reality test, 真实用户
```

### → chatbot-hardening
```
chatbot, 对话质量, AI上线, demo到生产, 工具调用, 记忆, 意图识别, 对话状态, agent稳定, hardening
```

### → serp-landscape-scan
```
搜索排名, SERP, 谁在做, 竞争格局, 关键词排名, 赛道扫描
```

### → pricing-teardown
```
定价, 价格对比, pricing, 怎么收费, 价格策略
```

### → positioning-compare
```
定位对比, 卖点对比, 差异化, positioning, 他们怎么说
```

### → site-map-crawl
```
网站结构, 页面列表, sitemap, 导航结构, 有哪些页面
```

### → faq-extractor
```
FAQ, 常见问题, 用户常问, 问答提取
```

### → lead-list-builder
```
渠道, 社区列表, 目录, 合作方, 分发渠道, directories
```

### → meeting-transcribe
```
会议录音, 会议转写, meeting recording, 会议纪要
```

### → meeting-action-extract
```
会议待办, action items, 会议决定, follow up, 会后任务
```

### → video-highlight-extract
```
精彩片段, 视频亮点, highlights, 值得剪辑, 短视频素材
```

### → content-calendar-draft
```
内容日历, 发布计划, content calendar, 发什么内容, 内容规划
```

### → outreach-brief-builder
```
推广素材, 合作推广, outreach, 联络方案, PR材料
```

### → support-signal-summarizer
```
用户反馈总结, 工单分析, support signals, 投诉趋势, 功能需求统计
```

### → market-research
```
研究, 赛道, 市场, 调研, 行业, market, niche, landscape, 机会
```

### → competitor-teardown
```
竞品, 对手, 拆解, competitor, teardown, 分析竞争, 打法, rival
```

### → customer-voice-synthesis
```
用户反馈, 评论, 痛点, 声音, 社区, reviews, voice, 知乎, reddit, 需求
```

### → web-crawl-collect
```
抓取, 采集, crawl, fetch, 收集, 网页, 公开信息, URL
```

### → page-structured-extract
```
提取, extract, 结构化, 字段, 价格, 功能列表, 产品页
```

### → audio-transcribe
```
录音, 音频, 转文字, transcribe, audio, 语音, 听写, 会议录音
```

### → video-transcribe
```
视频, 逐字稿, video, 转写视频, 视频内容, 视频转文字
```

### → transcript-cleanup
```
清理, 转写稿, 整理, cleanup, 口头语, 断句, 逐字稿整理
```

### → research-to-brief
```
brief, 摘要, 整理成, 可执行, 产品brief, 增长brief, 销售
```

### → content-repurpose
```
首页文案, 博客, 社媒, 视频脚本, 一鱼多吃, repurpose, 内容转化
```

## gstack Routing (Independent Dev Team)

Commander dispatches to gstack when tasks require browser-based QA, PR workflows, or design systems.

| User Intent Pattern | gstack Skill | Fallback cc24h Role |
|---|---|---|
| Real browser test / click through / QA | /qa or /qa-only | 用户战场官 |
| Ship PR / push + review + merge | /ship | 快刀官 + 尺子官 |
| PR code review (prod bug focus) | /review | 尺子官 |
| Debug / root cause / investigate error | /investigate | 铁律官 + 快刀官 |
| Design system / component library | /design-consultation | 增长官 + 铁律官 |
| Design audit with fix loop | /design-review | 增长官 + 尺子官 |
| Product idea brainstorm (YC style) | /office-hours | 破局官 |
| CEO-level plan review | /plan-ceo-review | 破局官 |
| Architecture plan review | /plan-eng-review | 铁律官 |
| Design plan scoring | /plan-design-review | 增长官 |
| Adversarial code review / second opinion | /codex | 尺子官 |
| Post-ship doc updates | /document-release | 快刀官 |
| Weekly retro / shipping stats | /retro | Commander |
| Be careful / destructive warning | /careful | — |
| Lock edits to directory | /freeze | — |
| Maximum safety mode | /guard | — |

### → design-system-bootstrap
```
设计系统, 视觉规范, design system, 品牌色, 配色, 字体, design tokens, 不要AI默认风格, 先定视觉
```

### → screenshot-loop
```
截图, 看看效果, screenshot, 页面长什么样, 视觉QA, 检查UI, 看看手机上, 效果图
```

### → reference-driven-design
```
参考网站, 学习设计, reference, 像XX一样, 设计参考, 视觉参考, 提取设计
```

### → mobile-qa
```
手机测试, 移动端, mobile, 触控, 响应式, 手机体验, 手机上能用吗
```

### → accessibility-audit
```
无障碍, 可访问性, accessibility, WCAG, 对比度, 键盘导航, 屏幕阅读器, a11y
```

### → performance-audit
```
性能, 加载速度, performance, bundle, Core Web Vitals, Lighthouse, 首屏, LCP
```

### → production-readiness-audit
```
能上线吗, 准出, production ready, 全面检查, 上线审查, 发布检查, readiness
```

### gstack Keyword Detection
```
浏览器测试, 真机测试, 点击测试, browser QA, dogfood, 试用流程
ship, 发PR, 推送, 合并, create PR, push and merge
设计系统, design system, 组件库, component library
根因分析, root cause, investigate, 查原因, debug
对手意见, second opinion, adversarial review, codex
```

## Automated AI Marketing Team Routing

### When to invoke the full Marketing Team (marketing-campaign-pipeline)

| Trigger | Pipeline Start | Marketing Red Team Required? |
|---|---|---|
| Council outputs GO decision with growth recommendation | campaign-brief-generator | YES for final review |
| User says "做营销" / "推广" / "内容运营" / "冷启动" | campaign-brief-generator | Optional |
| User says "小红书发布包" / "种草内容" | multi-channel-content-pack (XHS) | Optional |
| User says "私域启动" / "内测群" / "朋友圈首发" | private-launch-pack | Optional |
| User says "裂变" / "分享机制" / "合盘分享" | referral-campaign-pack | YES |
| User says "SEO内容" / "内容矩阵" / "长尾流量" | seo-content-matrix | Optional |
| User says "评论回复" / "问答弹药" / "知乎回答" | qa-comment-reply-pack | Optional |
| User says "营销复盘" / "内容效果" / "哪个有效" | marketing-retro-pack | YES |
| Commander detects post-launch phase with no marketing activity | campaign-brief-generator | Optional |

### When to invoke PARTIAL Marketing Team (subset of roles)

| Scenario | Roles to Invoke | Skip |
|---|---|---|
| Quick content draft for one platform | mkt-conversion-copy + mkt-creative-asset | No full team, no Red Team |
| Channel priority question only | mkt-channel-launch only | Single role |
| User persona clarification | mkt-audience-insight only | Single role |
| Content angle brainstorm | mkt-content-strategy only | Single role |
| Feedback analysis | mkt-analyst only | Single role |
| Copy review for AI-slop | mkt-red-team only | Quality gate, no full team |

### When Marketing Red Team is MANDATORY

Marketing Red Team must be present when:
1. A full campaign is being launched (GO/NO-GO on content batch)
2. New channel entry (first time posting on a platform)
3. Referral/viral mechanics going live
4. Content makes claims about accuracy or results
5. Any content that touches pricing or payment
6. Easy consensus among other marketing roles (groupthink risk)

### Marketing Team vs Council vs Existing Workflows

| Question | Use Marketing Team? | Use Council? | Use Existing WF? |
|---|---|---|---|
| "Should we market this product?" | NO | YES (council decides) | NO |
| "Generate XHS posts for MiraLife" | YES (content pack) | NO | NO |
| "What should our value proposition be?" | NO | YES (council decides) | NO |
| "Write 5 title variants for this post" | YES (conversion copy) | NO | NO |
| "Is our landing page converting?" | Partial (analyst) | NO | YES (launch-and-growth) |
| "What channel should we focus on?" | YES (channel lead) | If strategic question → YES | NO |
| "Design the referral mechanism" | YES (referral campaign) | NO | Also check viral-loop-check |

### Council-to-Marketing Handoff Protocol

When Council produces a GO verdict:
1. Commander extracts: target user, value proposition, priority, stage, boundaries
2. Commander invokes Campaign Director (mkt-campaign-director) with Council verdict
3. Campaign Director generates campaign brief
4. Campaign Director dispatches relevant marketing roles
5. Marketing team runs 5-step internal protocol (independent → challenge → synthesize)
6. Campaign Director returns unified brief to Commander
7. Commander approves or sends back for revision

### Marketing-to-Council Escalation

Marketing Team MUST escalate back to Council when:
1. Value proposition cannot be translated into shareable language
2. Target user does not match available channels
3. Trust/evidence is insufficient for any credible marketing
4. Pricing direction creates marketing impossibility
5. Market feedback contradicts Council assumptions

### Marketing Team Keyword Detection

#### -> campaign-brief-generator
```
营销战役, campaign brief, 营销计划, 推广计划, 做营销, 开始推广, 营销方案
```

#### -> content-angle-generator
```
内容角度, 选题, content angles, 写什么, 发什么, 内容策划, 角度树
```

#### -> multi-channel-content-pack
```
发布包, 小红书, 知乎回答, 公众号文章, 多平台, content pack, 种草, 发帖
```

#### -> asset-brief-pack
```
封面, 截图, 素材, 配图, 雷达图, 对比图, asset brief, 视觉素材
```

#### -> private-launch-pack
```
私域, 朋友圈, 内测群, 私聊邀请, 微信群, private launch, 冷启动, 首发
```

#### -> referral-campaign-pack
```
裂变, 分享, 合盘分享, 邀请, referral, 转发, 拉新, 病毒传播, viral
```

#### -> seo-content-matrix
```
SEO, 长尾, 关键词, 内容矩阵, 搜索流量, organic, 文章矩阵, 内容规划
```

#### -> qa-comment-reply-pack
```
评论回复, 问答, 首评, 追评, 异议处理, QA, 知乎回答, 弹药库, 话术
```

#### -> marketing-retro-pack
```
营销复盘, 效果分析, 哪个有效, 继续还是停, retro, 数据回流, 表现分析
```

## Community Skill Layers (Production Quality Pipeline)

Commander uses community skills as a 5-layer quality pipeline. These are **not** standalone workflows — they are **injected into existing workflows** at the right moment.

### Layer 1 — Design Direction (Before Code)

| Skill | When Commander Invokes | Within Workflow |
|---|---|---|
| `/frontend-design` | Start of any UI task | design-system-bootstrap, build-feature (UI) |
| `/web-artifacts-builder` | Building complex multi-component artifacts | build-feature (React/Tailwind) |
| `/oiloil-ui-ux-guide` | UX review or design guidance needed | design-system-bootstrap, screenshot-loop |

**Mandatory**: Commander MUST invoke `/frontend-design` before writing ANY UI component code.

### Layer 2 — Code Quality (During Implementation)

| Skill | When Commander Invokes | Within Workflow |
|---|---|---|
| `/vercel-react-best-practices` | Writing/reviewing React/Next.js code | build-feature, refactor-safely |
| `/vercel-composition-patterns` | Component architecture decisions | build-feature, refactor-safely |

**Auto-trigger**: These skills load automatically when React code is detected in context.

### Layer 3 — Polish & Accessibility (After First Pass)

| Skill | When Commander Invokes | Within Workflow |
|---|---|---|
| `/baseline-ui` | After UI component created — remove AI slop | screenshot-loop, build-feature |
| `/fixing-accessibility` | Keyboard/ARIA/focus/semantic check | accessibility-audit, production-readiness-audit |
| `/fixing-motion-performance` | Animation stutter/jank/performance | performance-audit, screenshot-loop |
| `/fixing-metadata` | SEO/OG/meta tags check | launch-and-growth, production-readiness-audit |
| `/vercel-web-design-guidelines` | Full UI standards compliance review | production-readiness-audit, review-and-recover |
| `/accessibility` | Comprehensive axe-core + jsx-a11y audit | accessibility-audit |

**Mandatory chain for UI tasks**: `/frontend-design` → code → `/baseline-ui` → `/fixing-accessibility` → `/fixing-motion-performance`

### Layer 4 — Testing & QA (Automated Verification)

| Skill | When Commander Invokes | Within Workflow |
|---|---|---|
| `/playwright-ui-testing` | Full test suite (16 sub-skills, ~482 cases) | production-readiness-audit, user-reality-test |
| `/agent-browser` | Real browser interaction/automation | user-reality-test, screenshot-loop, mobile-qa |

Sub-skills in playwright-ui-testing:
- `/test-a11y` — Accessibility testing
- `/test-forms` — Form validation testing
- `/test-responsive` — Responsive layout testing
- `/test-flows` — User flow testing
- `/test-perf` — Performance testing
- `/test-security` — Security testing
- `/test-seo` — SEO testing
- `/test-states` — Component state testing
- `/test-cross-browser` — Cross-browser testing
- `/test-consistency` — Visual consistency testing
- `/test-conversion` — Conversion funnel testing
- `/test-heatmap` — Heatmap analysis
- `/test-links` — Link validation
- `/test-regression` — Regression testing
- `/test-ux-writing` — UX copy testing
- `/test-all` — Run all test suites

### Layer 5 — Release & Iteration

| Skill | When Commander Invokes | Within Workflow |
|---|---|---|
| `/firecrawl` | Web research during dev, scrape/crawl/search | market-research, competitor-teardown, reference-driven-design |
| `/remotion` | Programmatic video creation (demos, launches) | content-repurpose, launch-and-growth |

### New System Skills Keyword Detection

#### → deploy
```
部署, 发布到线上, 上线部署, deploy, CI/CD, GitHub Actions, push to production, 自动发布, pipeline
```

#### → cross-session-learning
```
学到了什么, 记住这个模式, 经验总结, pattern library, 跨session, 积累, 不要每次从零开始
```

#### → gstack-auto-qa
```
自动QA, 浏览器验证, 自动截图验证, auto QA, browser verify, visual verify
```

### Community Skill Keyword Detection

#### → frontend-design
```
UI设计, 界面设计, 前端设计, 做个页面, 写个组件, frontend design, UI direction, 视觉方向
```

#### → baseline-ui
```
AI味, 默认风格, 去掉AI感, 不够精致, UI打磨, polish, baseline, 太模板化
```

#### → fixing-accessibility
```
无障碍修复, 键盘导航, ARIA, focus, 语义化, 标签, 表单标签, fix a11y
```

#### → fixing-motion-performance
```
动画卡顿, 动效性能, jank, 掉帧, animation perf, motion, 动画优化
```

#### → fixing-metadata
```
SEO, meta标签, OG标签, 社交分享, metadata, 页面标题, 描述
```

#### → vercel-react-best-practices
```
React性能, 请求瀑布流, bundle优化, useMemo, Next.js优化, react perf, waterfall
```

#### → vercel-composition-patterns
```
组件模式, compound component, boolean props, 组件架构, composition, 组件设计
```

#### → vercel-web-design-guidelines
```
UI标准, 设计规范检查, Web Interface Guidelines, 100条规则, UI audit, design guidelines
```

#### → playwright-ui-testing
```
UI测试, 自动化测试, playwright, 功能测试, 回归测试, 全面测试, test suite, 482
```

#### → agent-browser
```
浏览器自动化, 自动点击, 自动填表, 截图, browser automation, headless
```

#### → firecrawl
```
网页抓取, web scraping, 抓网页, 爬虫, crawl site, fetch URL, 网站数据
```

#### → remotion
```
程序化视频, 产品视频, demo视频, React视频, remotion, 视频生成
```

## Mandatory Routing Rules

These routes are NOT optional — Commander MUST enforce them:

### Must run community skill pipeline (L1→L3):
- Before ANY UI component is submitted, run the chain: `/frontend-design` → code → `/baseline-ui` → `/fixing-accessibility` → `/fixing-motion-performance`
- This chain is embedded into build-feature and screenshot-loop workflows for UI tasks

### Must run design-system-bootstrap:
- Before ANY UI/frontend project starts coding
- When user says "build a website/app/page" and no design-system.md exists in target project
- Must invoke `/frontend-design` + `/oiloil-ui-ux-guide` as part of bootstrap

### Must run screenshot-loop:
- After ANY UI component is created or modified
- Before submitting ANY UI-related task in build-feature
- As part of production-readiness-audit
- Must invoke `/baseline-ui` as part of each screenshot review cycle

### Must run production-readiness-audit:
- Before ANY launch-and-growth workflow completes
- When user says "launch" / "ship" / "上线" / "发布"
- Cannot be bypassed without Commander escalation
- Must include: `/vercel-web-design-guidelines` + `/fixing-accessibility` + `/fixing-metadata` + `/playwright-ui-testing`
- If React project: must also run `/vercel-react-best-practices`

### Must invoke 用户战场官 (user-reality-test):
- Before any consumer-facing product launches
- When conversion drops or UX complaints surface
- As part of production-readiness-audit

### Must invoke AI应用工程官 (chatbot-hardening):
- Before any AI/chatbot/agent feature goes live
- When dialog quality issues are reported
- As part of production-readiness-audit (if AI features exist)

### Must pause and ask user:
- Task touches auth/payment/migration/secrets
- Product direction change
- Merge to main/production
- NOT READY verdict from production-readiness-audit

## Semantic Intent Classification (Upgrade from Keyword Matching)

Keyword matching fails on Chinese because the same word has different intents in different contexts.
Commander MUST classify intent semantically, not just by keyword.

### Intent Categories

| Category | User MEANS | Route To | NOT To |
|----------|-----------|----------|--------|
| BUILD_UI | "做个页面/组件" | design-system-bootstrap (if no DS) → build-feature | - |
| IMPROVE_UI | "好看一点/优化UI/不够精致" | screenshot-loop → baseline-ui fixes | refactor-safely |
| CHECK_QUALITY | "检查/能上线吗/看看效果" | production-readiness-audit OR screenshot-loop | review-and-recover |
| FIX_SPECIFIC | "这个chatbot不够好/对话有问题" | chatbot-hardening | bug-triage-hotfix |
| RESEARCH | "研究/了解/分析市场" | market-research OR competitor-teardown | build-feature |
| PLAN | "想做/有个想法/规划" | idea-to-plan | build-feature |

### Chinese Disambiguation Rules

| User Says | Keyword Match | Correct Intent | How to Decide |
|-----------|--------------|----------------|---------------|
| "做个好看的页面" | "做" → build | BUILD_UI + "好看" = needs design-system first | If "好看/漂亮/精致" present → force design-system-bootstrap gate |
| "优化一下UI" | "优化" → refactor | IMPROVE_UI = needs visual check first | If "UI/界面/页面" present → route to screenshot-loop, NOT refactor |
| "检查一下能不能上线" | "检查" → review | CHECK_QUALITY = needs full audit | If "上线/发布/ship" present → route to production-readiness-audit |
| "这个chatbot还不够好" | "不够好" → bug | FIX_SPECIFIC for AI product | If "chatbot/AI/对话/agent" present → route to chatbot-hardening |
| "页面太AI味了" | "AI味" → ? | IMPROVE_UI with anti-AI focus | If "AI味/太模板/太generic" → force baseline-ui + screenshot-loop |

### Auto-Inject Rules (Context-Sensitive)

When routing to build-feature for ANY UI task, Commander MUST auto-inject:

```
QUALITY_PIPELINE:
  1. Read design-system.md BEFORE writing any CSS/TSX
  2. Read .claude/skills/oiloil-ui-ux-guide/SKILL.md#anti-ai-defaults BEFORE writing styles
  3. Apply motion-design patterns (entrance stagger, scroll reveals, hover states)
  4. After writing CSS: grep for 'Inter|Roboto|purple|gradient' in changed files
  5. Run screenshot-loop (preview_screenshot at 3 viewports) BEFORE submit
  6. Run mobile-qa checks (preview_resize mobile + preview_inspect touch targets)
```

### Negative Triggers (Skill Wasn't Used = Bug)

| Condition | Required Skill | If Missing |
|-----------|---------------|-----------|
| UI task completed, no screenshot taken | screenshot-loop | BLOCK submit |
| CSS/TSX written, no Anti-AI check | baseline-ui | PostToolUse hook catches this |
| React component created, no best-practices check | vercel-react-best-practices | Warning in prompt |
| Page built, no mobile check | mobile-qa | BLOCK submit |
| Product launching, no user-reality-test | user-reality-test | BLOCK launch |

## Ambiguity Resolution

When input matches multiple workflows:

1. **Idea + Build**: Default to idea-to-plan first (plan before execute)
2. **Bug + Refactor**: Default to bug-triage-hotfix first (fix before restructure)
3. **Build + Review**: Default to review-and-recover first (review existing before new work)
4. **Launch + Build**: Check if there are pending build tasks → build-feature; if all done → launch-and-growth

## Escalation Rules

### Must pause and ask user:
- Task touches auth/payment/migration/secrets
- Product direction change (new target user, new business model)
- Multiple valid approaches with different cost/risk profiles
- Merge to main/production branch
- Install new dependency >1MB
- Delete data or drop schema

### Auto-proceed (no user confirmation needed):
- Planning and analysis (repo-onboarding, idea-to-plan phases 1-3)
- Low-risk implementation in isolated worktree
- Running tests and verification
- Writing/updating docs
- Creating branches
- Generating task YAML
- Writing handoffs and worklogs
- Review verdicts (but merge needs confirmation)

## Parallel Decision Matrix

| Condition | Decision |
|---|---|
| Two tasks, files_touched disjoint | ✅ Parallel |
| Two tasks, same directory | ⚠️ Check file-level overlap |
| Two tasks, same file | ❌ Sequential |
| Build + review (different tasks) | ✅ Parallel |
| Two refactor batches | ❌ Sequential (verify between) |
| Night-run tasks | ✅ Parallel (within max-parallel limit) |
| Idea-to-plan phases | ❌ Sequential (each phase needs previous output) |
