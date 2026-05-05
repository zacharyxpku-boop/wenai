$ErrorActionPreference = "Stop"

Write-Host "Repository root: $(git rev-parse --show-toplevel)"
Write-Host "Scoped project: claude/wenai"
Write-Host ""
Write-Host "==> wenai working tree"
git status --short --ignore-submodules=all -- .
Write-Host ""
Write-Host "==> wenai diff stat"
git diff --stat --ignore-submodules=all -- .
