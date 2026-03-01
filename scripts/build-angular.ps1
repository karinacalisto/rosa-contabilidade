# Build Angular e copiar para wwwroot do projeto .NET (PowerShell)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$ClientDir = Join-Path $RootDir "client-app"
$WwwrootDir = Join-Path $RootDir "RosaContabilidade.Api\wwwroot"

Write-Host "=== Build Angular ===" -ForegroundColor Cyan
Set-Location $ClientDir
npm ci
npx ng build --configuration=production

Write-Host "=== Copiando para wwwroot ===" -ForegroundColor Cyan
if (Test-Path $WwwrootDir) { Remove-Item -Recurse -Force $WwwrootDir }
New-Item -ItemType Directory -Path $WwwrootDir -Force | Out-Null
Copy-Item -Path "$ClientDir\dist\client-app\browser\*" -Destination $WwwrootDir -Recurse

Write-Host "=== Build Angular concluido! ===" -ForegroundColor Green
Write-Host "Arquivos copiados para: $WwwrootDir"
Get-ChildItem $WwwrootDir
