"use strict";
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, PageNumber, NumberFormat, LevelFormat,
  ShadingType, WidthType, Table, TableRow, TableCell,
  BorderStyle, PageBreak, VerticalAlign
} = require("docx");
const fs = require("fs");

const OUT = "C:/Users/86136/Desktop/iOS_App_上线_SOP.docx";

// ── helpers ─────────────────────────────────────────────────────────────
const h1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text: t, bold: true, size: 32 })]
});
const h2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 150 },
  children: [new TextRun({ text: t, bold: true, size: 26 })]
});
const p = (t) => new Paragraph({
  spacing: { before: 100, after: 100 },
  children: [new TextRun({ text: t, size: 22 })]
});
const cd = (t) => new Paragraph({
  spacing: { before: 80, after: 80 },
  shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
  indent: { left: 360 },
  children: [new TextRun({ text: t, font: "Courier New", size: 18 })]
});
const bu = (t) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { before: 60, after: 60 },
  children: [new TextRun({ text: t, size: 22 })]
});
const ck = (t) => new Paragraph({
  numbering: { reference: "checks", level: 0 },
  spacing: { before: 60, after: 60 },
  children: [new TextRun({ text: t, size: 22 })]
});
const br = () => new Paragraph({ children: [new PageBreak()] });
const sep = () => new Paragraph({ spacing: { before: 200, after: 200 }, children: [new TextRun("")] });

// ── table helpers ────────────────────────────────────────────────────────
const cell = (txt, bold = false, shade = null) => new TableCell({
  verticalAlign: VerticalAlign.CENTER,
  shading: shade ? { type: ShadingType.CLEAR, fill: shade } : undefined,
  children: [new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: txt, bold, size: 20 })]
  })]
});

// ── error table ──────────────────────────────────────────────────────────
const errorTable = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      tableHeader: true,
      children: [
        cell("错误信息", true, "4472C4"),
        cell("根因", true, "4472C4"),
        cell("修复方法", true, "4472C4")
      ]
    }),
    new TableRow({ children: [
      cell("exportArchive requires a provisioning profile"),
      cell("ExportOptions.plist 缺 signingStyle:manual 或 provisioningProfiles"),
      cell("用 PlistBuddy 写入 signingStyle + provisioningProfiles dict，profile 名硬编码")
    ]}),
    new TableRow({ children: [
      cell("Error Reading File: /tmp/decoded_profile.plist"),
      cell("Codemagic builder 上 security cms 无法解密 provisioning profile"),
      cell("放弃动态提取；直接硬编码 profile 名（从构建日志 CodeSign 行获取）")
    ]}),
    new TableRow({ children: [
      cell("YAML script: syntax error / unexpected indent"),
      cell("heredoc 在 YAML 里每行带缩进空格，导致 plist XML 格式损坏"),
      cell("改用 PlistBuddy -c 'Add :key value' 逐条写，不使用 heredoc")
    ]}),
    new TableRow({ children: [
      cell("Build number conflict / already uploaded"),
      cell("App Store Connect API 返回仍在 Processing 中的 build，+1 后重复"),
      cell("MIN_BUILD 兜底：MIN_BUILD = max(已知最大build, API返回值) + 1")
    ]}),
    new TableRow({ children: [
      cell("xcodegen: cannot find project.yml"),
      cell("cd 路径错误或 project.yml 不在根目录"),
      cell("确保 cd $CM_BUILD_DIR 后再执行 xcodegen generate")
    ]}),
    new TableRow({ children: [
      cell("Code signing: No matching provisioning profile"),
      cell("App Store Connect 上没有对应 Bundle ID 的 profile"),
      cell("用 app-store-connect fetch-signing-files --create 自动创建")
    ]}),
    new TableRow({ children: [
      cell("keychain: The specified keychain could not be found"),
      cell("keychain initialize 未执行或已超时"),
      cell("确保 Set up code signing 步骤在 Build 步骤之前，不要并行")
    ]})
  ]
});

// ── codemagic template ───────────────────────────────────────────────────
const yamlLines = [
  "# codemagic.yaml — ios-dev workflow 核心片段",
  "scripts:",
  "  - name: Install XcodeGen",
  "    script: brew install xcodegen",
  "",
  "  - name: Convert ML model to CoreML",
  "    script: |",
  "      cd $CM_BUILD_DIR",
  "      pip3 install tensorflow coremltools tf2onnx onnx -q",
  "      python3 ml/mac_convert_coreml.py",
  "      cp ml/models/GestureClassifier.mlpackage ShootAssist/Resources/",
  "      cp ml/models/scaler_params.json ShootAssist/Resources/",
  "",
  "  - name: Generate Xcode project",
  "    script: |",
  "      cd $CM_BUILD_DIR",
  "      MIN_BUILD=6",
  "      LATEST=$(app-store-connect get-latest-testflight-build-number \"$APP_STORE_APP_ID\" \\",
  "               --api-key \"$APP_STORE_CONNECT_KEY_IDENTIFIER\" \\",
  "               --issuer-id \"$APP_STORE_CONNECT_ISSUER_ID\" \\",
  "               2>/dev/null || echo \"$MIN_BUILD\")",
  "      if [ \"$LATEST\" -lt \"$MIN_BUILD\" ]; then LATEST=$MIN_BUILD; fi",
  "      NEW_BUILD=$((LATEST + 1))",
  "      echo \"$NEW_BUILD\" > /tmp/build_number.txt",
  "      perl -i -pe \"s/CURRENT_PROJECT_VERSION:.*/CURRENT_PROJECT_VERSION: \\\"$NEW_BUILD\\\"/\" project.yml",
  "      xcodegen generate",
  "",
  "  - name: Set up code signing",
  "    script: |",
  "      keychain initialize",
  "      app-store-connect fetch-signing-files $BUNDLE_ID \\",
  "        --type IOS_APP_STORE --create",
  "      keychain add-certificates",
  "      xcode-project use-profiles",
  "",
  "  - name: Build IPA",
  "    script: |",
  "      cd $CM_BUILD_DIR",
  "      NEW_BUILD=$(cat /tmp/build_number.txt)",
  "      xcodebuild archive \\",
  "        -project ShootAssist.xcodeproj \\",
  "        -scheme ShootAssist \\",
  "        -configuration Release \\",
  "        -archivePath \"$CM_BUILD_DIR/ShootAssist.xcarchive\" \\",
  "        -destination \"generic/platform=iOS\" \\",
  "        CURRENT_PROJECT_VERSION=\"$NEW_BUILD\"",
  "      rm -f /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :method string app-store-connect\" /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :signingStyle string manual\" /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :teamID string THXYDBVXGW\" /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :provisioningProfiles dict\" /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :provisioningProfiles:com.shootassist.mobile string ShootAssist ios_app_store 1775216981\" /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :stripSwiftSymbols bool true\" /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :uploadBitcode bool false\" /tmp/ExportOptions.plist",
  "      /usr/libexec/PlistBuddy -c \"Add :uploadSymbols bool true\" /tmp/ExportOptions.plist",
  "      xcodebuild -exportArchive \\",
  "        -archivePath \"$CM_BUILD_DIR/ShootAssist.xcarchive\" \\",
  "        -exportOptionsPlist /tmp/ExportOptions.plist \\",
  "        -exportPath \"$CM_BUILD_DIR/build/ios/ipa\""
];

// ── document ─────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      },
      {
        reference: "checks",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "□",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 } } }, // A4
    children: [
      // ── Cover ──────────────────────────────────────────────
      new Paragraph({
        spacing: { before: 2000, after: 400 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "iOS App 上线 SOP", bold: true, size: 56 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [new TextRun({ text: "ShootAssist · Codemagic CI/CD · App Store Connect", size: 26, color: "666666" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 600 },
        children: [new TextRun({ text: "版本 1.0 · 2026-04", size: 22, color: "999999" })]
      }),
      br(),

      // ── Ch1: 一次性配置 ───────────────────────────────────
      h1("第一章  一次性配置（首次上线前完成）"),

      h2("1.1  App Store Connect 准备"),
      bu("登录 https://appstoreconnect.apple.com → 创建新 App"),
      bu("Bundle ID：com.shootassist.mobile"),
      bu("记录 APP_STORE_APP_ID（数字，如 6761611972）"),
      bu("Identifiers → 确认 Bundle ID 已注册"),

      h2("1.2  API Key（用于 Codemagic 无交互签名）"),
      bu("App Store Connect → Users and Access → Integrations → App Store Connect API"),
      bu("创建 Key，角色选 App Manager 或 Developer"),
      bu("下载 .p8 文件（只能下一次，妥善保存）"),
      bu("记录 Key ID（10位大写字母数字）和 Issuer ID（UUID格式）"),

      h2("1.3  Codemagic 变量组配置"),
      p("在 Codemagic → Teams → Global variables → 新建组 app_store_credentials，填入："),
      cd("APP_STORE_CONNECT_ISSUER_ID    = <Issuer UUID>"),
      cd("APP_STORE_CONNECT_KEY_IDENTIFIER = <Key ID>"),
      cd("APP_STORE_CONNECT_PRIVATE_KEY  = <.p8 文件完整内容含-----BEGIN/END 行>"),
      cd("CERTIFICATE_PRIVATE_KEY        = <开发者证书私钥 PEM，可用 keychain export 导出>"),

      h2("1.4  Provisioning Profile 名称（关键）"),
      p("codemagic.yaml 中 provisioningProfiles 的值必须是 App Store Connect 上的 profile 名称全称："),
      cd("ShootAssist ios_app_store 1775216981"),
      p("如何获取：首次构建成功后在日志中搜索 CodeSign 行，其中 -provisioning-profile-specifier 后面的字符串即为 profile 名。"),
      p("此值一旦确认写死在 codemagic.yaml，无需每次更新（除非在 App Store Connect 手动重新生成 profile）。"),

      h2("1.5  Team ID"),
      cd("DEVELOPMENT_TEAM = THXYDBVXGW"),
      p("App Store Connect → Membership Details → Team ID"),

      sep(),
      br(),

      // ── Ch2: 每次发版流程 ─────────────────────────────────
      h1("第二章  每次发版流程（主干）"),

      h2("2.1  代码准备"),
      bu("功能开发完毕，本地 build 通过（Xcode → Product → Build）"),
      bu("确认 project.yml 中 MARKETING_VERSION（如 1.2.0）已更新"),
      bu("不要手动修改 CURRENT_PROJECT_VERSION（CI 自动递增）"),
      bu("git commit + git push origin main"),

      h2("2.2  触发 CI 构建"),
      p("ios-dev workflow：push 到 main 自动触发"),
      cd("git push origin main"),
      p("ios-release workflow：打 v* tag 触发"),
      cd("git tag v1.2.0"),
      cd("git push origin v1.2.0"),

      h2("2.3  Codemagic 构建步骤（自动执行）"),
      bu("Install XcodeGen → 安装 xcodegen CLI"),
      bu("Convert ML model → pip install + python3 转换 .mlpackage"),
      bu("Generate Xcode project → 拉取最新 build number + perl 写入 project.yml + xcodegen generate"),
      bu("Set up code signing → keychain initialize → fetch-signing-files → add-certificates → use-profiles"),
      bu("Build IPA → xcodebuild archive + PlistBuddy 构造 ExportOptions.plist + xcodebuild -exportArchive"),

      h2("2.4  构建后验证"),
      bu("Codemagic 构建页面 → Artifacts 下载 .ipa，确认文件大小合理（>10MB）"),
      bu("App Store Connect → TestFlight → 确认新 build 出现（状态先 Processing，约 10-30 分钟变 Ready）"),
      bu("内部测试：Internal Testers 组收到 TestFlight 邀请邮件或 App 内推送"),

      h2("2.5  提交审核（App Store 正式发布）"),
      bu("App Store Connect → 选中 build → Add for Review"),
      bu("填写「此版本的新功能」说明（英/中均可）"),
      bu("Submit for Review → 等待苹果审核（1-3 天）"),
      bu("审核通过后选择手动/自动发布"),

      sep(),
      br(),

      // ── Ch3: 常见错误 & 导出检查清单 ─────────────────────
      h1("第三章  常见错误排查"),

      h2("3.1  错误速查表"),
      errorTable,

      sep(),
      h2("3.2  ExportOptions.plist 导出前检查清单"),
      p("每次遇到 exportArchive 报错，按此清单逐项核查："),
      ck("method = app-store-connect（不是 app-store，已废弃）"),
      ck("signingStyle = manual（CI 环境必须 manual，automatic 需要 Apple ID 交互）"),
      ck("teamID = THXYDBVXGW（与 Xcode project 的 DEVELOPMENT_TEAM 一致）"),
      ck("provisioningProfiles dict 存在且 key = Bundle ID"),
      ck("provisioningProfiles 的 value = profile 名称全称（带空格，不是 UUID）"),
      ck("使用 PlistBuddy -c 'Add :key value' 逐条写（不使用 heredoc，避免缩进污染）"),
      ck("ExportOptions.plist 路径为 /tmp/ExportOptions.plist（每次构建前 rm -f 清空）"),

      sep(),
      br(),

      // ── Ch4: 完整 YAML 模板 ───────────────────────────────
      h1("第四章  codemagic.yaml 核心片段（参考模板）"),
      h2("4.1  ios-dev workflow 关键脚本"),
      p("以下为已验证可用的完整脚本段，可直接复制："),
      ...yamlLines.map(cd),

      sep(),
      h2("4.2  关键变量说明"),
      bu("BUNDLE_ID：com.shootassist.mobile"),
      bu("APP_STORE_APP_ID：6761611972（App Store Connect 数字 ID）"),
      bu("DEVELOPMENT_TEAM：THXYDBVXGW"),
      bu("profile 名：ShootAssist ios_app_store 1775216981（硬编码，不动态提取）"),
      bu("MIN_BUILD：已知最大 build number 的兜底值，每次成功上传后 +1 更新"),

      sep(),
      h2("4.3  project.yml 必填字段"),
      cd("name: ShootAssist"),
      cd("options:"),
      cd("  bundleIdPrefix: com.shootassist"),
      cd("settings:"),
      cd("  base:"),
      cd("    PRODUCT_BUNDLE_IDENTIFIER: com.shootassist.mobile"),
      cd("    DEVELOPMENT_TEAM: THXYDBVXGW"),
      cd("    MARKETING_VERSION: \"1.0.0\""),
      cd("    CURRENT_PROJECT_VERSION: \"6\"   # CI 会自动 +1，这里写当前已知最大值"),
      cd("    SWIFT_VERSION: \"5.9\""),

      sep(),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new TextRun({ text: "— END —", size: 20, color: "AAAAAA", italics: true })]
      })
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log("✓ SOP 已生成:", OUT);
}).catch(e => { console.error("ERROR:", e.message); process.exit(1); });
