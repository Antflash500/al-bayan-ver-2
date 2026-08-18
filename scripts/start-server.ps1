$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent $PSScriptRoot

& (Join-Path $PSScriptRoot 'stop-server.ps1')
Start-Sleep -Seconds 2

$vbs = Join-Path $PSScriptRoot 'start-server-hidden.vbs'
Start-Process -FilePath 'wscript.exe' -ArgumentList ('"' + $vbs + '"')
Start-Sleep -Seconds 8

$ports = Get-NetTCPConnection -State Listen -LocalPort 505,5051
if ($ports) {
    $ports | Sort-Object LocalPort | ForEach-Object {
        "Listening on port $($_.LocalPort) (PID $($_.OwningProcess))"
    }
    Write-Host "Server up: http://localhost:505 (Vite dev: http://localhost:5051)"
} else {
    Write-Warning 'No listener detected on 505/5051. Check logs.'
}
