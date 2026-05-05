$ErrorActionPreference = "Stop"

function Show-Group {
  param(
    [string]$Title,
    [string[]]$Paths
  )

  Write-Host ""
  Write-Host "==> $Title" -ForegroundColor Cyan
  git status --short --ignore-submodules=all -- $Paths
}

function Normalize-PathForCompare {
  param([string]$Path)

  return $Path.Replace("\", "/").Trim().Trim('"')
}

$groups = [ordered]@{
  "01 CRM and external CRM mapping" = @(
    "src/app/admin/inquiries",
    "src/app/api/sales/inquiry",
    "src/components/AdminInquiryCommercialEditor.tsx",
    "src/components/AdminHeader.tsx",
    "src/lib/crm-labels.ts",
    "src/lib/crm-pipeline.ts",
    "src/lib/inquiry-activity.ts",
    "__tests__/crm-pipeline.test.ts",
    "__tests__/inquiry-activity.test.ts"
  )
  "02 Chinese UX and admin polish" = @(
    "src/i18n/zh.ts",
    "src/app/admin/metrics/page.tsx",
    "src/app/admin/cost/page.tsx",
    "src/app/admin/feedback/page.tsx",
    "src/app/admin/invites/page.tsx",
    "src/app/admin/payments/page.tsx",
    "src/app/about/page.tsx",
    "src/app/docs/page.tsx",
    "src/app/enterprise/page.tsx",
    "src/app/product",
    "src/app/roadmap/page.tsx",
    "src/app/tools/page.tsx",
    "src/app/changelog/page.tsx",
    "src/components/marketing"
  )
  "03 POC, executive share, and standard packs" = @(
    "src/app/poc",
    "src/app/share",
    "src/app/api/share/route.ts",
    "src/app/api/standard-pack",
    "src/components/FiveMinutePocOnboarding.tsx",
    "src/components/PocLaunchChecklist.tsx",
    "src/components/PocReportGenerator.tsx",
    "src/components/SharePageActions.tsx",
    "src/components/StandardPackWorkspace.tsx",
    "src/lib/brand-iq.ts",
    "src/lib/ecommerce-guardrails.ts",
    "src/lib/poc-launch-check.ts",
    "src/lib/poc-report-evaluator.ts",
    "src/lib/share-readonly.ts",
    "src/lib/sop-workflows.ts",
    "src/lib/standard-pack-routing.ts",
    "__tests__/brand-iq.test.ts",
    "__tests__/ecommerce-guardrails.test.ts",
    "__tests__/poc-launch-check.test.ts",
    "__tests__/poc-report-evaluator.test.ts",
    "__tests__/poc-report-generator.test.ts",
    "__tests__/share-readonly.test.ts",
    "__tests__/sop-workflows.test.ts",
    "__tests__/standard-pack-routing.test.ts"
  )
  "04 Content marketing and case evidence" = @(
    "src/app/cases",
    "src/app/pipelines/marketing-campaign",
    "src/components/CaseLibraryExplorer.tsx",
    "src/components/ContentMarketingPackWorkspace.tsx",
    "src/components/marketing/MarketingGrowthLayer.tsx",
    "src/components/marketing/WhyFocused.tsx",
    "src/lib/case-library.ts",
    "src/lib/case-study-details.ts",
    "src/lib/content-marketing-pack.ts",
    "src/lib/poc-case-studies.ts",
    "__tests__/case-library.test.ts",
    "__tests__/content-marketing-pack.test.ts"
  )
  "05 Existing pipelines and API stability" = @(
    "src/app/api/ai/route.ts",
    "src/app/api/batch-launch/chunk/route.ts",
    "src/app/api/cron/daily-digest/route.ts",
    "src/app/api/health/route.ts",
    "src/app/api/image-gen/route.ts",
    "src/app/api/og/route.tsx",
    "src/app/api/openai-image/route.ts",
    "src/app/api/ratelimit/check/route.ts",
    "src/app/api/video-gen/route.ts",
    "src/app/api/video-teardown/route.ts",
    "src/app/pipelines",
    "src/components/AIWorkspace.tsx",
    "src/components/Layout/Sidebar.tsx",
    "src/components/ROICalculator.tsx",
    "src/config",
    "src/lib/auth.ts",
    "src/lib/demo-cache.ts",
    "src/lib/mailer.ts",
    "src/lib/org-id.ts",
    "src/lib/ratelimit.ts",
    "src/lib/webhook-out.ts",
    "__tests__/ratelimit.test.ts",
    "src/proxy.ts",
    "src/middleware.ts",
    "tsconfig.json"
  )
  "06 Docs, verification, and launch checklist" = @(
    "AGENTS.md",
    ".env.example",
    ".planning/DECISION.md",
    "README.md",
    "MOAT_MAP.md",
    "STRATEGY_DEEP.md",
    "docs",
    "scripts/verify.ps1",
    "scripts/release-scope.ps1",
    "scripts/repo-status.ps1",
    "scripts/seed-marketing-assets.ts"
  )
  "07 Commercialization, pricing, and legal surfaces" = @(
    "src/app/pricing/page.tsx",
    "src/app/pricing/checkout/page.tsx",
    "src/app/inquire/page.tsx",
    "src/app/privacy/page.tsx",
    "src/app/terms/page.tsx",
    "src/app/status/page.tsx",
    "src/lib/entitlements.ts"
  )
  "08 Account workspace and global shell" = @(
    "src/app/demo/page.tsx",
    "src/app/globals.css",
    "src/app/layout.tsx",
    "src/app/me",
    "src/app/modules/[moduleId]/page.tsx",
    "src/app/page.tsx"
  )
}

Write-Host "Repository root: $(git rev-parse --show-toplevel)" -ForegroundColor DarkGray
Write-Host "Scoped project: $(Get-Location)" -ForegroundColor DarkGray

foreach ($entry in $groups.GetEnumerator()) {
  Show-Group -Title $entry.Key -Paths $entry.Value
}

$allStatus = @(git status --short --ignore-submodules=all -- .)
$trackedPatterns = New-Object System.Collections.Generic.List[string]

foreach ($paths in $groups.Values) {
  foreach ($path in $paths) {
    $trackedPatterns.Add((Normalize-PathForCompare $path))
  }
}

$ungrouped = @()
foreach ($line in $allStatus) {
  if ($line.Length -lt 4) { continue }

  $path = Normalize-PathForCompare ($line.Substring(3))
  $matched = $false

  foreach ($pattern in $trackedPatterns) {
    if ($path -eq $pattern -or $path.StartsWith("$pattern/")) {
      $matched = $true
      break
    }
  }

  if (-not $matched) {
    $ungrouped += $line
  }
}

Write-Host ""
Write-Host "==> 09 Ungrouped items requiring manual review" -ForegroundColor Yellow
if ($ungrouped.Count -eq 0) {
  Write-Host "None"
} else {
  $ungrouped | ForEach-Object { Write-Host $_ }
}

Write-Host ""
Write-Host "Tip: this script only displays grouped status. It does not stage, commit, revert, or delete files." -ForegroundColor DarkGray
