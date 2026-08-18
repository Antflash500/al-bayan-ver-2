$ErrorActionPreference = 'SilentlyContinue'
$targets = Get-CimInstance Win32_Process | Where-Object {
    ($_.Name -eq 'php.exe' -and $_.CommandLine -match 'artisan serve') -or
    ($_.Name -eq 'php.exe' -and $_.CommandLine -match '-S .*:505' -and $_.CommandLine -match 'resources[\\/]server\.php') -or
    ($_.Name -eq 'php.exe' -and $_.CommandLine -match 'artisan schedule') -or
    ($_.Name -eq 'node.exe' -and $_.CommandLine -match 'vite\\bin') -or
    ($_.Name -eq 'cmd.exe' -and $_.CommandLine -match 'vite')
}
foreach ($p in $targets) {
    Write-Host "Stopping PID $($p.ProcessId) :: $($p.CommandLine)"
    Stop-Process -Id $p.ProcessId -Force
}
Write-Host "Done. Port 505 / 5051 should be free now."
