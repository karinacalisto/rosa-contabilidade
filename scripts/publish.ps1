# Build completo: Angular + .NET publish para deploy (PowerShell)
$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "=== Passo 1: Build Angular ===" -ForegroundColor Cyan
& "$ScriptDir\build-angular.ps1"

Write-Host "=== Passo 2: Publish .NET ===" -ForegroundColor Cyan
Set-Location "$RootDir\RosaContabilidade.Api"
dotnet publish -c Release -o "$RootDir\publish"

Write-Host "=== Publish concluido! ===" -ForegroundColor Green
Write-Host "Artefatos prontos em: $RootDir\publish"
Write-Host ""
Write-Host "Para deploy no IIS/Locaweb:"
Write-Host "  1. Envie o conteudo de $RootDir\publish via FTP/FTPS"
Write-Host "  2. Configure a connection string no appsettings.Production.json"
Write-Host "  3. Configure a pasta de uploads"
Write-Host "  4. Reinicie o site no IIS"
