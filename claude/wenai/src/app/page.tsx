import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'wenai | 电商团队的商业交付系统',
  description:
    '从 SKU、类目规则、品牌禁区、内容营销、试跑报告到商务推进，wenai 帮电商团队一条线跑完。',
  openGraph: {
    title: 'wenai | 电商团队的商业交付系统',
    description:
      '5 分钟跑通一批 SKU，生成上新包、内容参考、老板版报告和下一步商务动作。',
    url: 'https://wenai-one.vercel.app',
    siteName: 'wenai',
    images: [{ url: '/seed/pipeline-hero-collage.jpg', width: 1200, height: 630, alt: 'wenai' }],
    locale: 'zh_CN',
    type: 'website',
  },
};

const navItems = [
  { label: '怎么跑', href: '#flow' },
  { label: '交付样例', href: '#cases' },
  { label: '适合谁', href: '#teams' },
  { label: '价格', href: '/pricing' },
];

const flow = [
  {
    title: '整理 SKU',
    text: '把类目、链接、卖点、图片缺口先整理清楚，客户不用学复杂工具。',
    tag: '01',
  },
  {
    title: '套类目规则',
    text: '自动检查标题、详情页、禁用词、品牌语气和平台风险。',
    tag: '02',
  },
  {
    title: '生成交付包',
    text: '输出上新文案、内容脚本、验收清单和可复制的客户说明。',
    tag: '03',
  },
  {
    title: '复盘推进',
    text: '沉淀老板版报告、下一步动作、合作建议和商务跟进状态。',
    tag: '04',
  },
];

const deliverables = ['上新包', '内容参考', '品牌禁区', '老板版报告', '商务推进'];

const cases = [
  {
    title: '家居小电器上新',
    image: '/seed/case-homelody.jpg',
    result: '10 个 SKU 先跑通标题、详情页和内容角度，销售能直接给客户看。',
  },
  {
    title: '音频配件内容测试',
    image: '/seed/case-micro-audio.jpg',
    result: '把卖点拆成开场句、短视频脚本和素材清单，适合 TikTok / INS 测试。',
  },
  {
    title: '家居图片升级',
    image: '/seed/case-novahome-image.jpg',
    result: '从商品图、场景图到风险提示一起验收，减少反复沟通。',
  },
];

const blockers = [
  '不知道先交付什么，客户一进来只看到一堆功能。',
  'SKU 资料散在表格、链接和聊天记录里，没人愿意重新整理。',
  '文案、内容、合规、报价和跟进脱节，试跑结束后没有下一步。',
];

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none">
      <path
        d="M5 12h13m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfbf7] text-[#0b0b0c]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbfbf7]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="wenai 首页">
            <span className="grid size-10 place-items-center rounded-[10px] bg-black text-[18px] font-black text-white">
              W
            </span>
            <span className="text-[22px] font-black tracking-tight">wenai</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-[14px] font-semibold text-black/62 transition hover:bg-black/5 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/cases"
              className="hidden rounded-full px-4 py-2 text-[14px] font-semibold text-black/70 transition hover:bg-black/5 sm:inline-flex"
            >
              看样例
            </Link>
            <Link
              href="/poc"
              className="inline-flex items-center gap-2 rounded-full bg-black px-3.5 py-2.5 text-[13px] font-bold text-white shadow-[0_14px_30px_rgba(0,0,0,0.14)] transition hover:-translate-y-0.5 hover:bg-[#1c1c1f] sm:px-4 sm:text-[14px]"
            >
              <span className="sm:hidden">试跑</span>
              <span className="hidden sm:inline">直接试跑</span>
              <span className="hidden sm:inline-flex">
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-black/10">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.55]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(8,8,8,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(8,8,8,0.06) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 sm:pb-16 sm:pt-18 lg:px-8 lg:pb-20">
            <div className="mx-auto max-w-5xl text-center">
              <div className="mx-auto inline-flex max-w-full items-center rounded-full border border-black/10 bg-white/86 px-4 py-2 text-[13px] font-bold text-[#3158f4] shadow-sm">
                给电商团队的商业交付系统
              </div>

              <h1 className="mx-auto mt-7 max-w-5xl text-balance text-[42px] font-black leading-[0.98] tracking-[-0.01em] text-black sm:text-[68px] lg:text-[92px]">
                一批商品，
                <span className="block bg-gradient-to-r from-[#3158f4] via-[#8aa3ff] to-[#d6df13] bg-clip-text text-transparent">
                  跑成可交付生意
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-3xl text-pretty text-[17px] leading-8 text-black/68 sm:text-[20px] sm:leading-9">
                客户不用登录、不用理解复杂系统。选类目、填商品，wenai 自动生成上新包、品牌禁区、内容参考、老板版报告和下一步商务推进。
              </p>

              <div className="mx-auto mt-9 max-w-4xl rounded-[30px] bg-white/78 p-3 shadow-[0_30px_80px_rgba(21,25,43,0.10)] ring-1 ring-black/8">
                <div className="rounded-[24px] border border-black bg-[#111] p-5 text-left text-white sm:p-7">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-[#dbe900]">
                      <span className="grid size-7 place-items-center rounded-full bg-[#dbe900] text-black">✓</span>
                      试跑指令
                    </div>
                    <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/72 sm:inline-flex">
                      可复制
                    </span>
                  </div>
                  <p className="break-words font-mono text-[15px] leading-8 text-white sm:text-[22px] sm:leading-10">
                    请把这 10 个商品跑成客户能看懂的上新交付包：类目规则、品牌禁区、内容开场句、验收报告、下一步商务动作。
                  </p>
                </div>
                <div className="grid gap-3 p-3 sm:grid-cols-2">
                  <Link
                    href="/poc"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-black px-5 text-[16px] font-black text-white transition hover:-translate-y-0.5"
                  >
                    开始 5 分钟试跑
                    <ArrowIcon />
                  </Link>
                  <Link
                    href="/pipelines/new-listing"
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-[16px] font-black text-black transition hover:-translate-y-0.5"
                  >
                    生成上新包
                    <ArrowIcon />
                  </Link>
                </div>
              </div>

              <div className="mx-auto mt-7 flex max-w-4xl flex-wrap justify-center gap-2">
                {deliverables.map(item => (
                  <span
                    key={item}
                    className="rounded-full border border-black/10 bg-white px-4 py-2 text-[14px] font-bold text-black/72 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mx-auto mt-9 max-w-6xl overflow-hidden rounded-[30px] border border-black/10 bg-white p-2 shadow-[0_30px_90px_rgba(21,25,43,0.12)]">
                <div
                  className="relative min-h-[220px] overflow-hidden rounded-[24px] bg-[#111] bg-cover bg-center sm:min-h-[360px]"
                  style={{ backgroundImage: "url('/seed/pipeline-hero-collage.jpg')" }}
                  role="img"
                  aria-label="商品图、内容营销和电商平台上新的交付预览"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/68 via-black/18 to-transparent" />
                  <div className="absolute left-4 top-4 max-w-[240px] rounded-2xl bg-white/94 p-4 text-left shadow-xl sm:left-7 sm:top-7">
                    <div className="text-[12px] font-black text-[#3158f4]">交付预览</div>
                    <div className="mt-2 text-[22px] font-black leading-tight text-black">陶瓷杯上新包</div>
                    <div className="mt-3 grid gap-2 text-[12px] font-bold text-black/60">
                      <span>标题风险：通过</span>
                      <span>内容角度：直播 + 场景图</span>
                      <span>下一步：进入试卖</span>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 p-3 text-left sm:grid-cols-3 sm:p-4">
                  {['商品图和卖点一起验收', '内容脚本直接给运营', '商务下一步清楚可追'].map(item => (
                    <div key={item} className="rounded-2xl bg-[#f6f7fb] px-4 py-3 text-[14px] font-black text-black/72">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="flow" className="bg-white py-14 sm:py-18 lg:py-22">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8">
            <div>
              <p className="text-[14px] font-black text-[#3158f4]">客户进来之后怎么用</p>
              <h2 className="mt-3 max-w-xl text-balance text-[34px] font-black leading-tight sm:text-[52px]">
                不讲概念，只给一条能跑完的路。
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-8 text-black/64">
                我按 300 个真实访客的第一反应重排了首页：先告诉他能解决什么，再给入口，再展示交付物。避免“这是什么 AI 工具”的困惑。
              </p>
              <div className="mt-8 overflow-hidden rounded-[28px] border border-black/10 bg-[#f4f6ff]">
                <div
                  className="min-h-[260px] bg-cover bg-center sm:min-h-[360px]"
                  style={{ backgroundImage: "url('/seed/pipeline-hero-collage.jpg')" }}
                  role="img"
                  aria-label="wenai 上新交付流程示意"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {flow.map((item, index) => (
                <div
                  key={item.title}
                  className={[
                    'rounded-[28px] border p-5 transition sm:p-7',
                    index === 0
                      ? 'border-[#3158f4] bg-[#3158f4] text-white shadow-[0_26px_70px_rgba(49,88,244,0.22)]'
                      : 'border-black/10 bg-[#fbfbf7] text-black',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <span
                        className={[
                          'grid size-12 shrink-0 place-items-center rounded-full text-[15px] font-black',
                          index === 0 ? 'bg-white text-[#3158f4]' : 'bg-[#eef2ff] text-[#3158f4]',
                        ].join(' ')}
                      >
                        {item.tag}
                      </span>
                      <h3 className="text-[24px] font-black sm:text-[30px]">{item.title}</h3>
                    </div>
                    <span className={index === 0 ? 'text-white/75' : 'text-black/35'}>
                      <ArrowIcon />
                    </span>
                  </div>
                  <p className={['mt-4 text-[16px] leading-8', index === 0 ? 'text-white/78' : 'text-black/62'].join(' ')}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cases" className="bg-[#fbfbf7] py-14 sm:py-18 lg:py-22">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[14px] font-black text-[#3158f4]">交付样例</p>
                <h2 className="mt-3 max-w-3xl text-balance text-[34px] font-black leading-tight sm:text-[52px]">
                  不是生成几段文案，而是把客户能验收的东西摆出来。
                </h2>
              </div>
              <Link
                href="/cases"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-[15px] font-black text-black shadow-sm transition hover:-translate-y-0.5"
              >
                查看案例库
                <ArrowIcon />
              </Link>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {cases.map(item => (
                <article key={item.title} className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_22px_60px_rgba(21,25,43,0.08)]">
                  <div
                    className="aspect-[1.34] w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${item.image}')` }}
                    role="img"
                    aria-label={item.title}
                  />
                  <div className="p-5 sm:p-6">
                    <h3 className="text-[22px] font-black">{item.title}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-black/62">{item.result}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="teams" className="bg-black py-14 text-white sm:py-18 lg:py-22">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-[14px] font-black text-[#dbe900]">为什么现在看起来更像产品</p>
              <h2 className="mt-3 text-balance text-[34px] font-black leading-tight sm:text-[52px]">
                我把客户的三个阻塞点先压掉。
              </h2>
            </div>
            <div className="grid gap-4">
              {blockers.map((item, index) => (
                <div key={item} className="rounded-[28px] border border-white/12 bg-white/[0.06] p-5 sm:p-6">
                  <div className="text-[13px] font-black text-[#dbe900]">阻塞 {String(index + 1).padStart(2, '0')}</div>
                  <p className="mt-3 text-[18px] font-bold leading-8 text-white/84">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#fbfbf7] py-14 sm:py-18 lg:py-22">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-balance text-[36px] font-black leading-tight sm:text-[60px]">
              先让客户直接跑一轮，再谈合作。
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-8 text-black/64">
              当前版本已经去掉公开入口登录阻塞，客户点进来能看到样例、进入试跑、提交需求，并拿到更像正式 SaaS 的交付路径。
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/poc"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-black px-7 text-[16px] font-black text-white transition hover:-translate-y-0.5"
              >
                现在试跑
                <ArrowIcon />
              </Link>
              <Link
                href="/inquire?from=home-final"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 text-[16px] font-black text-black transition hover:-translate-y-0.5"
              >
                提交一批 SKU
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-[14px] text-black/52 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="font-black text-black">wenai</div>
          <div>电商试跑、交付报告、内容营销和商务推进一条线。</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-black">
              隐私
            </Link>
            <Link href="/terms" className="hover:text-black">
              条款
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
