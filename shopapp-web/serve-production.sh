#!/bin/bash

# Script para servir a versão de produção com Service Worker ativo

echo "🚀 Servindo versão de produção com Service Worker..."
echo ""
echo "📦 Build já foi feito em: dist/"
echo "🌐 Servidor rodará em: http://localhost:5174"
echo ""
echo "⚠️  Certifique-se de que 'serve' está instalado:"
echo "   npm install -g serve"
echo ""
echo "📱 Para testar no React Native:"
echo "   - Emulador Android: http://10.0.2.2:5174"
echo "   - Dispositivo físico: http://SEU_IP:5174"
echo ""
echo "🔍 Para testar o Service Worker:"
echo "   1. Abra http://localhost:5174 no Chrome"
echo "   2. F12 > Application > Service Workers"
echo "   3. Verifique status 'activated'"
echo ""
echo "🎯 Iniciando servidor..."
echo ""

npx serve -s dist -p 5174
