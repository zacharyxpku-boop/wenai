import { test, expect, type Download, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const tiktokCsv = [
  'Record ID,Platform,Campaign name,Ad name,Ad ID,Tracking code,Cell ID,Date,Impressions,Clicks,Spend,Orders,Revenue,Likes,Comments,Shares,Saves,Note',
  'rec-001,tiktok,Spring Test,Hook A,ad-001,tk-hook-a,cell-a,2026-05-15,3200,132,67,7,221,140,18,22,31,scale sample',
].join('\n');

const platformCsvCases = [
  {
    platform: 'Amazon',
    expected: 'Amazon',
    csv: [
      'Record ID,Platform,campaign_name,ad_group_name,keyword,Tracking code,Cell ID,Date,impressions,clicks,spend,sales,acos,orders,Note',
      'rec-001,amazon,SP Test,Desk Setup Keywords,cable organizer,amz-keyword-a,cell-a,2026-05-15,3200,126,180,640,0.28,8,scale sample',
    ].join('\n'),
  },
  {
    platform: 'Shopify',
    expected: 'Shopify',
    csv: [
      'Record ID,Platform,utm_source,utm_campaign,Product title,Variant SKU,Tracking code,Cell ID,Date,sessions,orders,total_sales,conversion_rate,aov,Note',
      'rec-001,shopify,tiktok,spring_hook_test,Product Landing A,SKU-001,shop-landing-a,cell-a,2026-05-15,1800,6,360,0.033,60,validate sample',
    ].join('\n'),
  },
  {
    platform: 'Meta',
    expected: 'Meta Ads',
    csv: [
      'Record ID,Platform,campaign_name,adset_name,ad_name,Tracking code,Cell ID,Date,impressions,clicks,spend,purchases,purchase_roas,cost_per_result,Note',
      'rec-001,meta_ads,Spring Test,UGC Hooks,Desk Hook A,meta-hook-a,cell-a,2026-05-15,2600,118,96,7,315,13.71,scale sample',
    ].join('\n'),
  },
  {
    platform: 'Google',
    expected: 'Google Ads',
    csv: [
      'Record ID,Platform,campaign,ad_group,keyword,Tracking code,Cell ID,Date,impressions,clicks,cost,conversions,conversion_value,cost_per_conversion,Note',
      'rec-001,google_ads,Search Test,Problem Keywords,desk cable organizer,google-keyword-a,cell-a,2026-05-15,2400,110,88,6,330,14.67,scale sample',
    ].join('\n'),
  },
] as const;

async function clearApp(page: Page) {
  await page.context().clearCookies();
  await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await page.evaluate(() => window.localStorage.clear());
}

async function startFrom3cTemplate(page: Page) {
  await clearApp(page);
  await page.goto('/dashboard');
  await page.getByRole('button', { name: /创建第一个实验项目|复制模板/ }).first().click();
  try {
    await page.waitForURL(/\/factory/, { timeout: 15_000 });
  } catch {
    await page.goto('/factory');
  }
  await expect(page.getByRole('button', { name: '导入 CSV' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /第一步：上传你的 .* 表现数据 CSV/ })).toBeVisible();
}

async function enableStarterTier(page: Page) {
  await page.evaluate(() => window.localStorage.setItem('wenai_subscription_state_v1', JSON.stringify({ tier: 'Starter', updatedAt: new Date().toISOString() })));
  await page.goto('/factory', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: '导入 CSV' })).toBeVisible();
}

async function importCsvAndGenerateDecision(page: Page, csv = tiktokCsv, expectedPlatform = 'TikTok', expectedMarker = 'rec-001') {
  const csvEditor = page.locator('textarea').first();
  const uploadFile = {
    name: `${expectedPlatform.toLowerCase().replace(/\s+/g, '-')}-sample.csv`,
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf8'),
  };
  await page.getByTestId('primary-csv-upload').setInputFiles(uploadFile, { timeout: 5_000 }).catch(async () => {
    await csvEditor.fill(csv);
    await page.getByRole('button', { name: '本地预览' }).click();
  });
  await expect
    .poll(async () => csvEditor.inputValue(), { timeout: 3_000 })
    .toContain(expectedMarker)
    .catch(async () => {
      await csvEditor.fill(csv);
      await page.getByRole('button', { name: '本地预览' }).click();
  });
  await expect(page.getByText(new RegExp(`已识别为 ${expectedPlatform}，\\d+ 个字段已自动匹配`))).toBeVisible();
  await expect(page.locator('.border-rose-200, .bg-rose-50').filter({ hasText: '未匹配' })).toHaveCount(0);
  const generateDecision = page.getByRole('button', { name: '生成决策摘要' });
  await expect(generateDecision).toBeEnabled();
  await generateDecision.evaluate(button => (button as HTMLButtonElement).click());
  await expect(page.getByText(/决策已生成/)).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#decision-summary')).toBeInViewport({ timeout: 10_000 });
}

async function readDownloadedText(download: Download, label: string) {
  const target = path.join(process.cwd(), 'test-results', `${Date.now()}-${label}.txt`);
  await download.saveAs(target);
  return readFile(target, 'utf8');
}

test.describe.serial('Wenai 完整用户旅程', () => {
  test('测试 A：首次用户冷启动', async ({ page }) => {
    await clearApp(page);
    await page.goto('/dashboard');

    await expect(page.getByRole('button', { name: '创建第一个实验项目' })).toBeVisible();
    await expect(page.getByRole('button', { name: /3C 数码/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /服装/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /美妆/ })).toBeVisible();

    await startFrom3cTemplate(page);
  });

  test('测试 B：CSV 导入到决策生成', async ({ page }) => {
    await startFrom3cTemplate(page);
    await importCsvAndGenerateDecision(page);

    await expect(page.locator('#decision-summary h3')).toContainText(/建议暂停投放|建议小范围放大|建议继续测试|建议重做承接|建议观察 3 天/);
    await expect(page.locator('#decision-summary')).toContainText(/高置信|中置信|低置信/);
    await expect(page.locator('#decision-summary')).toContainText(/基于 .+ 次曝光、.+ 次点击、\$\d/);
    await expect(page.locator('#decision-summary')).toContainText(/CTR\s+\d+\.\d%/);
    await expect(page.locator('#decision-summary')).toContainText(/ROAS\s+\d+\.\d{2}/);
  });

  for (const platformCase of platformCsvCases) {
    test(`测试 B-${platformCase.platform}：${platformCase.platform} 导入到导出闭环`, async ({ page }) => {
      await startFrom3cTemplate(page);
      await enableStarterTier(page);
      await importCsvAndGenerateDecision(page, platformCase.csv, platformCase.expected, 'rec-001');

      await expect(page.locator('#decision-summary h3')).toContainText(/建议暂停投放|建议小范围放大|建议继续测试|建议重做承接|建议观察 3 天/);
      await expect(page.locator('#decision-summary')).toContainText(/CTR\s+\d+\.\d%/);
      await expect(page.locator('#decision-summary')).toContainText(/ROAS\s+\d+\.\d{2}/);

      const reportDownload = page.waitForEvent('download');
      await page.getByRole('button', { name: '导出脱敏报告' }).click();
      await reportDownload;

      const briefDownloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: '导出生产需求 Brief' }).click();
      const briefDownload = await briefDownloadPromise;
      const briefText = await readDownloadedText(briefDownload, `${platformCase.platform}-brief`);
      expect(briefText).toContain('Hook 文案');
      expect(briefText).toContain('CTA 具体话术');
      expect(briefText).not.toMatch(/undefined|NaN|null/);
    });
  }

  test('测试 C：决策到导出到分享', async ({ page }) => {
    await startFrom3cTemplate(page);
    await enableStarterTier(page);
    await importCsvAndGenerateDecision(page);

    const reportDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '导出脱敏报告' }).click();
    const downloadedReport = await reportDownload;
    const reportText = await readDownloadedText(downloadedReport, 'decision-report');
    expect(reportText).toContain('项目背景');
    expect(reportText).toContain('核心结论');
    expect(reportText).toContain('下一步');
    expect(reportText).not.toMatch(/undefined|NaN|null/);

    const briefDownloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: '导出生产需求 Brief' }).click();
    const briefDownload = await briefDownloadPromise;
    const briefText = await readDownloadedText(briefDownload, 'decision-brief');
    expect(briefText).toContain('Hook 文案');
    expect(briefText).toMatch(/Hook 文案：.{10,}/);
    expect(briefText).toContain('Angle');
    expect(briefText).toContain('Offer 保留策略');
    expect(briefText).toContain('CTA 具体话术');
    expect(briefText).toContain('Format 规格');
  });

  test('测试 C2：视频生产前端闭环', async ({ page }) => {
    await startFrom3cTemplate(page);
    await importCsvAndGenerateDecision(page);

    const workflow = page.getByTestId('video-production-workflow');
    const hookInput = workflow.getByRole('textbox', { name: 'Hook' });
    await expect(workflow.getByText('视频生产工作流')).toBeVisible();
    await expect(workflow.getByText('把决策转成可执行视频任务')).toBeVisible();
    await expect(hookInput).toHaveValue(/.+/);

    await hookInput.fill('三秒看懂这个配件为什么能减少桌面混乱');
    await workflow.getByRole('button', { name: '确认分镜' }).click();
    await expect(workflow.getByText('分镜已确认', { exact: true })).toBeVisible();

    const videoDownloadPromise = page.waitForEvent('download');
    await workflow.getByRole('button', { name: '导出视频任务包' }).click();
    const videoDownload = await videoDownloadPromise;
    const videoBrief = await readDownloadedText(videoDownload, 'video-brief');
    expect(videoBrief).toContain('视频生产任务包');
    expect(videoBrief).toContain('三秒看懂这个配件为什么能减少桌面混乱');
    expect(videoBrief).toContain('镜头清单');
    expect(videoBrief).toContain('质量检查');

    await workflow.getByPlaceholder('粘贴成片或素材链接').fill('https://assets.example.com/video-001.mp4');
    await workflow.getByRole('button', { name: '标记素材已回写' }).click();
    await expect(workflow.getByText('素材已回写', { exact: true })).toBeVisible();
    await expect(workflow.getByText('素材链接已回写到当前项目。', { exact: true })).toBeVisible();
  });

  test('测试 D：复制模板与自增长闭环', async ({ page }) => {
    await startFrom3cTemplate(page);
    await importCsvAndGenerateDecision(page);

    await page.getByRole('button', { name: '复制模板创建工作台' }).first().click();
    await expect(page).toHaveURL(/\/factory/, { timeout: 5000 });
    await expect(page.getByText(/决策模板/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: '导入 CSV' })).toBeVisible();
  });

  test('测试 E：公开报告页与无登录访问', async ({ browser, page }) => {
    await startFrom3cTemplate(page);
    await importCsvAndGenerateDecision(page);
    const reportDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: '导出脱敏报告' }).click();
    await reportDownload;
    let shareUrl = '';
    await expect.poll(async () => {
      const values = await page.locator('input[readonly]').evaluateAll(inputs =>
        inputs.map(input => (input as HTMLInputElement).value)
      );
      shareUrl = values.find(value => value.includes('/report/')) || '';
      return shareUrl;
    }, { timeout: 10_000 }).toContain('/report/');
    expect(shareUrl).toContain('/report/');

    const incognito = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const reportPage = await incognito.newPage();
    await reportPage.goto(shareUrl);
    await expect(reportPage.getByText(/来自 .+ 的决策模板/)).toBeVisible();
    await expect(reportPage.getByText('决策结论')).toBeVisible();
    await expect(reportPage.getByRole('button', { name: '复制这个决策模板，创建我的工作台' })).toBeVisible();
    await reportPage.getByRole('button', { name: '复制这个决策模板，创建我的工作台' }).click();
    await expect(reportPage.getByText(/已创建工作台|打开 Wenai 导入你的 CSV 继续跑/)).toBeVisible({ timeout: 10_000 });
    try {
      await reportPage.waitForURL(/\/factory/, { timeout: 10_000 });
    } catch {
      await reportPage.goto('/factory');
    }
    await expect(reportPage.getByRole('button', { name: '导入 CSV' })).toBeVisible();
    await incognito.close();
  });

  test('测试 F：付费墙触发', async ({ page }) => {
    await startFrom3cTemplate(page);
    await page.locator('textarea').first().fill(tiktokCsv);

    for (let index = 0; index < 3; index += 1) {
      await page.getByRole('button', { name: '导入并刷新决策' }).click();
      await expect(page.getByText(/决策已生成/)).toBeVisible();
    }

    await page.getByRole('button', { name: '导入并刷新决策' }).click();
    await expect(page.getByText('Free 档每月限 3 次导入', { exact: true })).toBeVisible();
    await expect(page.getByText(/Starter 档即将上线/)).toBeVisible();
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
    await expect(page.getByRole('button', { name: '继续使用 Free 档' })).toBeVisible();
    await page.getByRole('button', { name: '继续使用 Free 档' }).click();
    await expect(page.getByText('Free 档每月限 3 次导入')).toBeHidden();
    await expect(page.getByRole('button', { name: '导入并刷新决策' })).toBeVisible();
  });

  test('测试 G1：空 CSV 文件上传错误态', async ({ page }) => {
    await startFrom3cTemplate(page);
    await page.locator('textarea').first().fill('');
    await page.getByRole('button', { name: '导入并刷新决策' }).click();
    await expect(page.getByText('文件为空，请上传包含数据的 CSV')).toBeVisible();
    await expect(page.getByRole('button', { name: /下载示例 CSV 模板/ }).first()).toBeVisible();
  });

  test('测试 G2：非 UTF-8 乱码错误态', async ({ page }) => {
    await startFrom3cTemplate(page);
    await page.locator('textarea').first().fill('Campaign name,Clicks,Spend\n����,12,30');
    await page.getByRole('button', { name: '导入并刷新决策' }).click();
    await expect(page.getByText('编码识别失败，请保存为 UTF-8 格式后重试').first()).toBeVisible();
  });

  test('测试 G3：异常表头未识别错误态', async ({ page }) => {
    await startFrom3cTemplate(page);
    await page.locator('textarea').first().fill('奇怪字段,另一个字段,###\nA,B,C');
    await page.getByRole('button', { name: '导入并刷新决策' }).click();
    await expect(page.getByText(/字段匹配度 0%|未识别到标准字段|请确认 CSV 平台格式|未检测到有效表现数据/).first()).toBeVisible();
  });

  test('测试 G4：脏数据拒绝生成决策', async ({ page }) => {
    await startFrom3cTemplate(page);
    const dirtyCsv = [
      'Record ID,Platform,Campaign name,Ad name,Tracking code,Cell ID,Date,Impressions,Clicks,Spend,Orders,Revenue,Note',
      'rec-bad,tiktok,Dirty Test,Hook Bad,dirty,cell-a,2099-01-01,1200,-5,not-money,1,20,bad row',
    ].join('\n');
    await page.locator('textarea').first().fill(dirtyCsv);
    await page.getByRole('button', { name: '导入并刷新决策' }).click();
    await expect(page.getByText(/数据质量不满足决策条件|未检测到有效表现数据|字段匹配度 0%/).first()).toBeVisible();
  });

  test('测试 H：移动端主路径无横向溢出', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await startFrom3cTemplate(page);
    await importCsvAndGenerateDecision(page);
    await expect(page.locator('#decision-summary')).toBeVisible();
    await expect(page.locator('#decision-summary').getByRole('button', { name: '导出脱敏报告' })).toHaveClass(/w-full/);
    const evidenceToggle = page.locator('#decision-summary button', { hasText: /证据链/ });
    await expect(evidenceToggle).toBeVisible();
    await evidenceToggle.click();
    const evidenceGrid = page.locator('#decision-summary [data-testid="decision-evidence-grid"]');
    await expect(evidenceGrid).toBeVisible({ timeout: 5_000 });
    await expect(evidenceGrid).toHaveClass(/grid-cols-2/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test('测试 I：旧公开功能入口统一承接到升级页', async ({ page }) => {
    const legacyPaths = ['/demo', '/tools', '/docs', '/status', '/roadmap', '/enterprise', '/inquire', '/pipelines/product-image', '/product/video', '/me'];

    for (const legacyPath of legacyPaths) {
      await page.goto(legacyPath);
      await expect(page).toHaveURL(/\/upgrade\?from=/);
      await expect(page.getByRole('heading', { name: '该功能正在升级，请前往首页体验新功能。' })).toBeVisible();
      const upgradePanel = page.getByTestId('upgrade-panel');
      await expect(upgradePanel.getByRole('link', { name: '进入工作台' })).toBeVisible();
      await expect(upgradePanel.getByRole('link', { name: '导入 CSV' })).toBeVisible();
    }
  });

  test('测试 J：定价页收集早鸟商业化线索', async ({ page }) => {
    await clearApp(page);
    await page.goto('/pricing');

    await page.getByRole('button', { name: '获取早鸟优惠' }).click();
    await expect(page.getByText('Starter 即将上线，留下邮箱获取早鸟优惠')).toBeVisible();
    await page.getByPlaceholder('you@company.com').fill('seller@example.com');
    await page.getByRole('button', { name: '提交' }).click();
    await expect(page.getByText('已记录。Starter/Growth 上线后会优先通知你。当前仍为 Free 试用。')).toBeVisible();

    const leads = await page.evaluate(() => JSON.parse(window.localStorage.getItem('wenai_early_bird_emails') || '[]') as Array<Record<string, string>>);
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      email: 'seller@example.com',
      tier: 'Starter',
      source: 'pricing',
    });
  });

  test('测试 K：结账入口不展示假支付成功，只承接早鸟登记', async ({ page }) => {
    await clearApp(page);
    await page.goto('/pricing/checkout?plan=starter');

    await expect(page).toHaveURL(/\/pricing\/checkout\?plan=starter/);
    await expect(page.getByRole('heading', { name: 'Starter 付费通道即将开放' })).toBeVisible();
    await expect(page.getByText('当前不会进行扣款，也不会改变你的 Free 试用档位。')).toBeVisible();
    await expect(page.getByText(/支付成功/)).toHaveCount(0);

    await page.getByRole('button', { name: '获取早鸟优惠' }).click();
    await page.getByPlaceholder('you@company.com').fill('checkout-lead@example.com');
    await page.getByRole('button', { name: '提交' }).click();
    await expect(page.getByText('已记录。Starter/Growth 上线后会优先通知你。当前仍为 Free 试用。')).toBeVisible();

    const subscriptionState = await page.evaluate(() => window.localStorage.getItem('wenai_subscription_state_v1'));
    const leads = await page.evaluate(() => JSON.parse(window.localStorage.getItem('wenai_early_bird_emails') || '[]') as Array<Record<string, string>>);
    expect(subscriptionState).toBeNull();
    expect(leads[0]).toMatchObject({
      email: 'checkout-lead@example.com',
      tier: 'Starter',
      source: 'pricing',
    });
  });
});
