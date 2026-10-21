# Playwright 浏览器国内加速安装（Windows PowerShell）
# 用法：powershell -ExecutionPolicy Bypass -File scripts/playwright-install-cn.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

& (Join-Path $Root "scripts\clear_playwright_locks.ps1")

Set-Location (Join-Path $Root "frontend")

# 浏览器装到用户目录，避免 Cursor 沙箱 Temp 里的 __dirlock
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:LOCALAPPDATA "ms-playwright"
# 勿设 PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST：会与 builds/cft 路径拼接导致 npmmirror 404
Remove-Item Env:PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST -ErrorAction SilentlyContinue
$env:PLAYWRIGHT_DOWNLOAD_HOST = "https://npmmirror.com/mirrors/playwright"
$env:PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT = "600000"

New-Item -ItemType Directory -Force -Path $env:PLAYWRIGHT_BROWSERS_PATH | Out-Null

Write-Host "PLAYWRIGHT_BROWSERS_PATH=$($env:PLAYWRIGHT_BROWSERS_PATH)"
Write-Host "PLAYWRIGHT_DOWNLOAD_HOST=$($env:PLAYWRIGHT_DOWNLOAD_HOST)"
Write-Host "正在安装 Chromium（约 180MB，走国内镜像）..."

npx playwright install chromium
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "完成。浏览器目录: $($env:PLAYWRIGHT_BROWSERS_PATH)"
