#!/bin/bash

echo "======================================"
echo "REBUILD COMPLETO DO APP"
echo "======================================"
echo ""

# 1. Matar todos os processos
echo "1. Matando processos React Native e Metro..."
pkill -9 -f "react-native" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
pkill -9 -f "node" 2>/dev/null
sleep 2

# 2. Desinstalar app
echo "2. Desinstalando app do dispositivo..."
adb uninstall com.mobilebridgeapp 2>/dev/null
sleep 1

# 3. Limpar cache Metro
echo "3. Limpando cache do Metro..."
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-* 2>/dev/null
rm -rf /tmp/react-* 2>/dev/null

# 4. Limpar build Android (usando caminho Windows)
echo "4. Limpando build Android..."
rm -rf android/app/build 2>/dev/null
rm -rf android/build 2>/dev/null
rm -rf android/.gradle 2>/dev/null

# 5. Verificar se Fabric está desabilitado
echo "5. Verificando configuração do Fabric..."
if grep -q "newArchEnabled=true" android/gradle.properties; then
    echo "   ❌ ERRO: Fabric ainda está habilitado!"
    echo "   Desabilitando agora..."
    sed -i 's/newArchEnabled=true/newArchEnabled=false/g' android/gradle.properties
    echo "   ✅ Fabric desabilitado"
else
    echo "   ✅ Fabric já está desabilitado"
fi

# 6. Iniciar Metro
echo "6. Iniciando Metro Bundler..."
npx react-native start --reset-cache &
METRO_PID=$!
echo "   Metro iniciado (PID: $METRO_PID)"
sleep 10

# 7. Build e instalação
echo "7. Construindo e instalando app..."
echo "   Isso levará alguns minutos..."
npx react-native run-android

echo ""
echo "======================================"
echo "BUILD CONCLUÍDO!"
echo "======================================"
echo ""
echo "Se o app abriu mas a tela está preta:"
echo "1. Pressione R+R no dispositivo para recarregar"
echo "2. Verifique os logs: adb logcat ReactNativeJS:V *:S"
echo ""
