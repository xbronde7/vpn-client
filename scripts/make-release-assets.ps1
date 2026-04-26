$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$desktop = Join-Path $root 'desktop'
$releaseDir = Join-Path $root 'release-assets'
$buildDir = Join-Path $desktop 'dist-release'
$version = (Get-Content -LiteralPath (Join-Path $desktop 'package.json') | ConvertFrom-Json).version

New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
Get-ChildItem -LiteralPath $releaseDir -Force | Remove-Item -Recurse -Force

& (Join-Path $PSScriptRoot 'download-cores.ps1')

Push-Location $desktop
try {
  if (Test-Path -LiteralPath $buildDir) {
    Remove-Item -LiteralPath $buildDir -Recurse -Force
  }
  $env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
  npx electron-builder --win --x64 --config.directories.output=dist-release
}
finally {
  Pop-Location
}

$installerSource = Join-Path $buildDir "VPN Client Setup $version.exe"
$portableSource = Join-Path $buildDir 'win-unpacked'

if (!(Test-Path -LiteralPath $installerSource)) {
  throw "Installer not found: $installerSource"
}
if (!(Test-Path -LiteralPath $portableSource)) {
  throw "Portable app folder not found: $portableSource"
}

$installerName = "VPNClient-windows-64-setup.exe"
$portableName = "VPNClient-windows-64-desktop.zip"
$shaName = "VPNClient-windows-64.sha256"
$installerTarget = Join-Path $releaseDir $installerName
$portableTarget = Join-Path $releaseDir $portableName
$shaTarget = Join-Path $releaseDir $shaName

Copy-Item -LiteralPath $installerSource -Destination $installerTarget -Force
Compress-Archive -Path (Join-Path $portableSource '*') -DestinationPath $portableTarget -Force

$hashes = @(
  Get-FileHash -Algorithm SHA256 -LiteralPath $installerTarget
  Get-FileHash -Algorithm SHA256 -LiteralPath $portableTarget
)

$hashes | ForEach-Object {
  "$($_.Hash.ToLowerInvariant())  $(Split-Path -Leaf $_.Path)"
} | Set-Content -LiteralPath $shaTarget -Encoding ascii

Get-ChildItem -LiteralPath $releaseDir | Select-Object Name,Length
