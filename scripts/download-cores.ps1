$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = Split-Path -Parent $PSScriptRoot
$downloadDir = Join-Path $root 'desktop\core-downloads'
$binDir = Join-Path $root 'desktop\bin'
$xrayVersion = 'v26.3.27'
$v2rayVersion = 'v5.48.0'

New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $binDir 'xray') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $binDir 'v2ray') | Out-Null

function Download-File($url, $path) {
  if (!(Test-Path -LiteralPath $path)) {
    Invoke-WebRequest -Uri $url -OutFile $path
  }
}

function Assert-Sha256FromDgst($zipPath, $dgstPath) {
  $expected = (Get-Content -LiteralPath $dgstPath | Where-Object { $_ -match '^SHA2-256=' }) -replace '^SHA2-256=\s*', ''
  $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $zipPath).Hash.ToLowerInvariant()
  if ($actual -ne $expected.ToLowerInvariant()) {
    throw "SHA256 mismatch for $zipPath. Expected $expected, got $actual"
  }
}

$xrayZip = Join-Path $downloadDir 'Xray-windows-64.zip'
$xrayDgst = Join-Path $downloadDir 'Xray-windows-64.zip.dgst'
$v2rayZip = Join-Path $downloadDir 'v2ray-windows-64.zip'
$v2rayDgst = Join-Path $downloadDir 'v2ray-windows-64.zip.dgst'

Download-File "https://github.com/XTLS/Xray-core/releases/download/$xrayVersion/Xray-windows-64.zip" $xrayZip
Download-File "https://github.com/XTLS/Xray-core/releases/download/$xrayVersion/Xray-windows-64.zip.dgst" $xrayDgst
Download-File "https://github.com/v2fly/v2ray-core/releases/download/$v2rayVersion/v2ray-windows-64.zip" $v2rayZip
Download-File "https://github.com/v2fly/v2ray-core/releases/download/$v2rayVersion/v2ray-windows-64.zip.dgst" $v2rayDgst

Assert-Sha256FromDgst $xrayZip $xrayDgst
Assert-Sha256FromDgst $v2rayZip $v2rayDgst

$xrayOut = Join-Path $downloadDir 'xray'
$v2rayOut = Join-Path $downloadDir 'v2ray'
Remove-Item -LiteralPath $xrayOut, $v2rayOut -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -LiteralPath $xrayZip -DestinationPath $xrayOut -Force
Expand-Archive -LiteralPath $v2rayZip -DestinationPath $v2rayOut -Force

Copy-Item -LiteralPath (Join-Path $xrayOut 'xray.exe') -Destination (Join-Path $binDir 'xray\xray.exe') -Force
Copy-Item -LiteralPath (Join-Path $xrayOut 'geoip.dat') -Destination (Join-Path $binDir 'xray\geoip.dat') -Force
Copy-Item -LiteralPath (Join-Path $xrayOut 'geosite.dat') -Destination (Join-Path $binDir 'xray\geosite.dat') -Force
Copy-Item -LiteralPath (Join-Path $xrayOut 'wintun.dll') -Destination (Join-Path $binDir 'xray\wintun.dll') -Force
Copy-Item -LiteralPath (Join-Path $xrayOut 'LICENSE') -Destination (Join-Path $binDir 'xray\LICENSE-Xray.txt') -Force
Copy-Item -LiteralPath (Join-Path $xrayOut 'LICENSE-wintun.txt') -Destination (Join-Path $binDir 'xray\LICENSE-wintun.txt') -Force

Copy-Item -LiteralPath (Join-Path $v2rayOut 'v2ray.exe') -Destination (Join-Path $binDir 'v2ray\v2ray.exe') -Force
Copy-Item -LiteralPath (Join-Path $v2rayOut 'geoip.dat') -Destination (Join-Path $binDir 'v2ray\geoip.dat') -Force
Copy-Item -LiteralPath (Join-Path $v2rayOut 'geosite.dat') -Destination (Join-Path $binDir 'v2ray\geosite.dat') -Force
Copy-Item -LiteralPath (Join-Path $v2rayOut 'config.json') -Destination (Join-Path $binDir 'v2ray\sample-config.json') -Force

Write-Host "Xray and V2Ray cores downloaded to desktop/bin"
