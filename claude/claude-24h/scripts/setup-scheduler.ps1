# ============================================================
# Windows 定时任务配置脚本
# 用法: powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1
# ============================================================

param(
    [string]$TaskName = "ClaudeCode-AutoRun",
    [string]$ScriptPath = "",
    [string]$Interval = "1h",  # 1h, 4h, 12h, 24h
    [switch]$Remove
)

$ErrorActionPreference = "Stop"

# 删除任务
if ($Remove) {
    Write-Host "正在删除定时任务: $TaskName" -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "已删除" -ForegroundColor Green
    exit 0
}

# 默认脚本路径
if (-not $ScriptPath) {
    $ScriptPath = Join-Path $PSScriptRoot "run-daemon.sh"
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Claude Code 定时任务配置" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "任务名称: $TaskName"
Write-Host "脚本路径: $ScriptPath"
Write-Host "执行间隔: $Interval"

# 解析间隔
$intervalMap = @{
    "1h"  = New-TimeSpan -Hours 1
    "4h"  = New-TimeSpan -Hours 4
    "12h" = New-TimeSpan -Hours 12
    "24h" = New-TimeSpan -Hours 24
}

$timeSpan = $intervalMap[$Interval]
if (-not $timeSpan) {
    Write-Host "无效间隔: $Interval (支持: 1h, 4h, 12h, 24h)" -ForegroundColor Red
    exit 1
}

# 获取 bash 路径（Git Bash）
$bashPath = "C:\Program Files\Git\bin\bash.exe"
if (-not (Test-Path $bashPath)) {
    $bashPath = (Get-Command bash -ErrorAction SilentlyContinue).Source
    if (-not $bashPath) {
        Write-Host "找不到 bash，请确认已安装 Git for Windows" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Bash路径: $bashPath"

# 创建定时任务
$action = New-ScheduledTaskAction `
    -Execute $bashPath `
    -Argument $ScriptPath

$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date) `
    -RepetitionInterval $timeSpan `
    -RepetitionDuration ([TimeSpan]::MaxValue)

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# 先删除同名任务
Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Claude Code 自动编码任务" `
    -RunLevel Highest

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "定时任务创建成功!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "管理命令:" -ForegroundColor Yellow
Write-Host "  查看: Get-ScheduledTask -TaskName '$TaskName'"
Write-Host "  手动运行: Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "  停止: Stop-ScheduledTask -TaskName '$TaskName'"
Write-Host "  删除: powershell -File $($MyInvocation.MyCommand.Path) -Remove -TaskName '$TaskName'"
