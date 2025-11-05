# Script para habilitar suporte a caminhos longos no Windows
# Execute como Administrador no PowerShell

Write-Host "Habilitando suporte a caminhos longos no Windows..." -ForegroundColor Yellow

# Habilitar no registro do Windows
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
    -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

Write-Host "✓ Suporte a caminhos longos habilitado!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora habilite também no Git:" -ForegroundColor Yellow
Write-Host "  git config --global core.longpaths true" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠ Reinicie o terminal e tente novamente." -ForegroundColor Yellow
