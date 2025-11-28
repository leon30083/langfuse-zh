$ErrorActionPreference = "Stop"
$extRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $extRoot "manifest.json"
if (!(Test-Path $manifestPath)) { throw "manifest.json not found at $manifestPath" }
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
if (-not $version) { throw "version missing in manifest.json" }

$distDir = Join-Path $extRoot "dist"
if (!(Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
$zipPath = Join-Path $distDir ("langfuse-zh-" + $version + ".zip")

$include = @(
  "manifest.json",
  "src",
  "translations",
  "assets"
)
$paths = $include | ForEach-Object { Join-Path $extRoot $_ }
Compress-Archive -Path $paths -DestinationPath $zipPath -Force
Write-Host "Packaged: $zipPath"
