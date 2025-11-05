#!/bin/bash
echo "🧹 Limpando autenticação e dados salvos..."

# Limpar dados do app
adb shell pm clear com.mobilebridgeapp

echo "✅ Dados limpos! Agora recarregue o app com R+R"
echo ""
echo "Você deverá ver a tela de login agora."
