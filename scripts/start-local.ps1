$ErrorActionPreference = 'Stop'
$auraRoot = Split-Path -Parent $PSScriptRoot
$auraNode = (Get-Command node).Source
$auraRuntime = Join-Path $auraRoot '.runtime'
New-Item -ItemType Directory -Path $auraRuntime -Force | Out-Null
if (!(Test-Path -LiteralPath (Join-Path $auraRoot '.env'))) {
    Push-Location $auraRoot
    try { & $auraNode 'scripts/setup.mjs' } finally { Pop-Location }
}
$auraDatabase = Get-NetTCPConnection -LocalPort 5433 -State Listen -ErrorAction SilentlyContinue
if (!$auraDatabase) {
    Start-Process -FilePath $auraNode -ArgumentList ('"' + (Join-Path $auraRoot 'scripts/database.mjs') + '"') -WorkingDirectory $auraRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $auraRuntime 'database.log') -RedirectStandardError (Join-Path $auraRuntime 'database-error.log') | Out-Null
}
$auraApp = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (!$auraApp) {
    $auraNext = Join-Path $auraRoot 'node_modules/next/dist/bin/next'
    Start-Process -FilePath $auraNode -ArgumentList ('"' + $auraNext + '" dev --hostname 127.0.0.1 --port 3000') -WorkingDirectory $auraRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $auraRuntime 'app.log') -RedirectStandardError (Join-Path $auraRuntime 'app-error.log') | Out-Null
}
Write-Output 'Synora local services started. Open http://localhost:3000 after the app is ready.'
