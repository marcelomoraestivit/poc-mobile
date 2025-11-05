#!/bin/bash
echo "=== Diagnóstico Tela Preta React Native ==="
echo ""

echo "1. Verificando dispositivos Android conectados:"
cmd.exe /c "adb devices"
echo ""

echo "2. Configurando port forwarding:"
cmd.exe /c "adb reverse tcp:8081 tcp:8081"
echo ""

echo "3. Verificando se Metro está rodando na porta 8081:"
cmd.exe /c "netstat -ano | findstr :8081"
echo ""

echo "4. Verificando logs do Android (últimas 30 linhas com erro):"
cmd.exe /c "adb logcat -d | findstr /I \"error fatal exception ReactNative\" | tail -30"
echo ""

echo "5. Tentando abrir Dev Menu:"
cmd.exe /c "adb shell input keyevent 82"
echo ""

echo "=== Próximos passos ==="
echo "1. Se não viu o Metro na porta 8081, execute: npm start"
echo "2. Se o port forwarding falhou, o dispositivo pode estar desconectado"
echo "3. Tente recarregar o app pressionando R+R no terminal do Metro"
echo "4. Ou execute: adb shell am force-stop com.mobilebridgeapp && npm run android"
