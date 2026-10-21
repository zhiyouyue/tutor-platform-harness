# 清除 Playwright 浏览器安装锁（__dirlock），避免并行安装失败
$ErrorActionPreference = "SilentlyContinue"
$removed = 0

function Remove-DirLock($root) {
    if (-not (Test-Path $root)) { return }
    Get-ChildItem -Path $root -Recurse -Directory -Filter "__dirlock" -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
        $script:removed++
        Write-Host "已删除锁: $($_.FullName)"
    }
}

Remove-DirLock $env:LOCALAPPDATA
Remove-DirLock $env:TEMP
Remove-DirLock "$env:LOCALAPPDATA\Temp"

# Cursor 沙箱缓存（此前报错路径）
Remove-DirLock "$env:LOCALAPPDATA\Temp\cursor-sandbox-cache"

Write-Host "共清理 $removed 个 __dirlock。可重新运行 playwright-install-cn.ps1"
