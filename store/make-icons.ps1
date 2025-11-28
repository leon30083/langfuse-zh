$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Resize($srcPath, $dstPath, $size) {
  $src = [System.Drawing.Image]::FromFile($srcPath)
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $gfx.DrawImage($src, 0, 0, $size, $size)
  $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $gfx.Dispose(); $bmp.Dispose(); $src.Dispose()
}

$root = Split-Path -Parent $PSScriptRoot
$SourcePng = if ($args.Count -ge 1) { $args[0] } else { Join-Path $root "assets/icons/icon128.png" }
$iconsDir = Join-Path $root "assets/icons"
if (!(Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

$icon16 = Join-Path $iconsDir "icon16.png"
$icon48 = Join-Path $iconsDir "icon48.png"
$icon128 = Join-Path $iconsDir "icon128.png"

Resize $SourcePng $icon16 16
Resize $SourcePng $icon48 48
Resize $SourcePng $icon128 128

$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$manifest.icons = @{ '16' = 'assets/icons/icon16.png'; '48' = 'assets/icons/icon48.png'; '128' = 'assets/icons/icon128.png' }
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "Icons generated and manifest updated: $icon16, $icon48, $icon128"
