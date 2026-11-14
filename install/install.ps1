# Nightcap: your AI understudy.
#   irm https://raw.githubusercontent.com/flynndotcom/nightcap/main/install.ps1 | iex
$ErrorActionPreference = "Stop"
$repo = if ($env:NIGHTCAP_REPO) { $env:NIGHTCAP_REPO } else { "flynndotcom/nightcap" }
$dir = Join-Path $HOME ".nightcap\bin"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
Write-Host "`n  🌙  Fetching Nightcap for Windows..."
$zip = Join-Path $env:TEMP "nightcap.zip"
Invoke-WebRequest "https://github.com/$repo/releases/latest/download/nightcap-x86_64-pc-windows-msvc.zip" -OutFile $zip
Expand-Archive -Force $zip $dir
Remove-Item $zip
$path = [Environment]::GetEnvironmentVariable("Path", "User")
if ($path -notlike "*\.nightcap\bin*") {
  [Environment]::SetEnvironmentVariable("Path", "$dir;$path", "User")
  $env:Path = "$dir;$env:Path"
}
& (Join-Path $dir "nightcap.exe") setup
