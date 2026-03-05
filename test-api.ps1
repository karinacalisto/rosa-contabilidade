#!/usr/bin/env pwsh
# ============================================
# Script de teste da API Rosa Contabilidade
# ============================================

$ApiBase = "http://localhost:5212"
$AdminEmail = "admin@admin.com"
$AdminPassword = "TrocarNaPrimeiraSenha123!"
$ClienteEmail = "maria.silva@exemplo.com"
$ClientePassword = "Cliente123!"

Write-Host "🚀 Iniciando testes da API..." -ForegroundColor Cyan

# ===== TESTE 1: Health Check =====
Write-Host "`n✅ Teste 1: Health Check" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$ApiBase/swagger/v1/swagger.json" -UseBasicParsing
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: API não está respondendo" -ForegroundColor Red
    Write-Host "Certifique-se de que 'dotnet run' está executando"
    exit 1
}

# ===== TESTE 2: Login Admin =====
Write-Host "`n✅ Teste 2: Login com Admin" -ForegroundColor Green
try {
    $loginBody = @{
        email = $AdminEmail
        password = $AdminPassword
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$ApiBase/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing

    $data = $response.Content | ConvertFrom-Json
    $token = $data.accessToken
    
    Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "📧 Email: $AdminEmail"
    Write-Host "🔑 Token (primeiros 50 chars): $($token.Substring(0, 50))..."
    
    # Guardar o token para próximos testes
    Set-Variable -Name "AdminToken" -Value $token
} catch {
    Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
}

# ===== TESTE 3: Login Cliente =====
Write-Host "`n✅ Teste 3: Login com Cliente" -ForegroundColor Green
try {
    $loginBody = @{
        email = $ClienteEmail
        password = $ClientePassword
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$ApiBase/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -UseBasicParsing

    $data = $response.Content | ConvertFrom-Json
    $clientToken = $data.accessToken
    
    Write-Host "✅ Login bem-sucedido!" -ForegroundColor Green
    Write-Host "📧 Email: $ClienteEmail"
    Write-Host "🔑 Token (primeiros 50 chars): $($clientToken.Substring(0, 50))..."
    
    Set-Variable -Name "ClientToken" -Value $clientToken
} catch {
    Write-Host "❌ Erro no login: $($_.Exception.Message)" -ForegroundColor Red
}

# ===== TESTE 4: Get Pendências (requer token) =====
Write-Host "`n✅ Teste 4: Get Pendências (Cliente)" -ForegroundColor Green
try {
    $response = Invoke-WebRequest `
        -Uri "$ApiBase/api/pendencies" `
        -Headers @{ Authorization = "Bearer $ClientToken" } `
        -UseBasicParsing

    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Pendências obtidas!" -ForegroundColor Green
    Write-Host "📋 Total: $($data.Count) pendências"
    $data | ForEach-Object { Write-Host "  - $($_.descricao)" }
} catch {
    Write-Host "❌ Erro ao obter pendências: $($_.Exception.Message)" -ForegroundColor Red
}

# ===== TESTE 5: Calculadora (sem autenticação) =====
Write-Host "`n✅ Teste 5: Calculadora de Impostos" -ForegroundColor Green
try {
    $calcBody = @{
        valorBruto = 5000
        tipo = "PJ"
    } | ConvertTo-Json

    $response = Invoke-WebRequest `
        -Uri "$ApiBase/api/calculator/calculate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $calcBody `
        -UseBasicParsing

    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Cálculo realizado!" -ForegroundColor Green
    Write-Host "💰 Valor Bruto: R$ $($data.valorBruto)"
    Write-Host "💵 Valor Líquido: R$ $($data.valorLiquido)"
    Write-Host "📊 Impostos: R$ $($data.valorImpostos)"
} catch {
    Write-Host "❌ Erro na calculadora: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Testes concluídos!" -ForegroundColor Cyan
Write-Host "`n📖 Para mais informações, acesse: http://localhost:5212/swagger" -ForegroundColor Yellow
