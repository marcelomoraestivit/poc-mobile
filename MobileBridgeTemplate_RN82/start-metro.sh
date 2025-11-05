#!/bin/bash

echo "🔍 Procurando processos Metro na porta 8081..."

# Tentar matar processos na porta 8081
lsof -ti:8081 | xargs kill -9 2>/dev/null || true
fuser -k 8081/tcp 2>/dev/null || true

echo "✅ Porta 8081 liberada"
echo ""
echo "🚀 Iniciando Metro Bundler..."
echo ""

# Iniciar Metro
npx react-native start --reset-cache
