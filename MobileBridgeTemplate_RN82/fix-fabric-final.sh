#!/bin/bash

echo "========================================="
echo "FIX FINAL - FORÇAR DESABILITAR FABRIC"
echo "========================================="
echo ""

# 1. Confirmar que gradle.properties está correto
echo "1. Verificando gradle.properties..."
if grep -q "newArchEnabled=false" android/gradle.properties; then
    echo "   ✅ newArchEnabled=false está correto"
else
    echo "   ❌ Corrigindo newArchEnabled..."
    sed -i 's/newArchEnabled=true/newArchEnabled=false/g' android/gradle.properties
fi

# 2. Matar TODOS os processos
echo "2. Matando TODOS os processos..."
pkill -9 -f java 2>/dev/null
pkill -9 -f gradle 2>/dev/null
pkill -9 -f react-native 2>/dev/null
pkill -9 -f metro 2>/dev/null
pkill -9 -f node 2>/dev/null
sleep 3

# 3. Desinstalar app
echo "3. Desinstalando app..."
adb uninstall com.mobilebridgeapp 2>/dev/null
sleep 2

# 4. LIMPAR TUDO
echo "4. Limpando TODOS os caches e builds..."

# Cache Metro
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-* 2>/dev/null
rm -rf /tmp/react-* 2>/dev/null

# Build Android
rm -rf android/app/build 2>/dev/null
rm -rf android/build 2>/dev/null
rm -rf android/.gradle 2>/dev/null
rm -rf android/.idea 2>/dev/null

# Cache Gradle global (Windows WSL path)
rm -rf ~/.gradle/caches 2>/dev/null

echo "   ✅ Todos os caches limpos"

# 5. Build com flag explícita
echo "5. Construindo com Fabric DESABILITADO..."
echo "   Aguarde 3-5 minutos..."
echo ""

cd android
./gradlew clean -PnewArchEnabled=false 2>&1 | head -20
cd ..

# 6. Instalar
echo "6. Instalando app..."
npx react-native run-android --no-packager

echo ""
echo "========================================="
echo "BUILD CONCLUÍDO!"
echo "========================================="
echo ""
echo "Verifique os logs:"
echo "   adb logcat ReactNativeJS:V *:S | grep fabric"
echo ""
echo "Se ainda mostrar 'fabric':true, o React Native 0.82"
echo "pode ter um bug que força Fabric mesmo desabilitado."
echo ""
echo "Solução alternativa: Downgrade para RN 0.71"
echo ""
