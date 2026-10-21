# 本地前端 + 线上 API 截图并生成四份内测 PDF（界面为最新中文文案）
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$env:TUTOR_API_PROXY = "https://www.tutor-platform.zhiyouyue.top"
$env:BETA_SITE_URL = "http://127.0.0.1:5173"
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:LOCALAPPDATA "ms-playwright"

Write-Host "启动本地前端（API 反代到正式环境）..."
$dev = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run dev -w frontend" -PassThru -WindowStyle Hidden -WorkingDirectory $Root
Start-Sleep -Seconds 8

try {
  for ($i = 0; $i -lt 30; $i++) {
    try {
      $r = Invoke-WebRequest -Uri "http://127.0.0.1:5173/" -UseBasicParsing -TimeoutSec 3
      if ($r.StatusCode -eq 200) { break }
    } catch { Start-Sleep -Seconds 2 }
  }
  python scripts/generate_beta_test_pdfs.py
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  Write-Host "PDF 已更新: docs/product-specs/beta-pdfs/"
} finally {
  Stop-Process -Id $dev.Id -Force -ErrorAction SilentlyContinue
}
