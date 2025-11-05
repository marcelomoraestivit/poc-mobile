#!/bin/bash

echo "🔍 DIAGNÓSTICO DO SISTEMA DE LOGIN"
echo "=================================="
echo ""

echo "1️⃣ Verificando se os arquivos existem..."
echo ""

files=(
  "src/screens/LoginScreen.tsx"
  "src/utils/JWTGenerator.ts"
  "src/services/AuthService.ts"
  "App.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file NÃO ENCONTRADO!"
  fi
done

echo ""
echo "2️⃣ Verificando imports no App.tsx..."
echo ""

if grep -q "LoginScreen" App.tsx; then
  echo "✅ LoginScreen importado"
else
  echo "❌ LoginScreen NÃO importado!"
fi

if grep -q "AuthService" App.tsx; then
  echo "✅ AuthService importado"
else
  echo "❌ AuthService NÃO importado!"
fi

echo ""
echo "3️⃣ Verificando lógica de autenticação no App.tsx..."
echo ""

if grep -q "isAuthenticated" App.tsx; then
  echo "✅ Estado isAuthenticated encontrado"
else
  echo "❌ Estado isAuthenticated NÃO encontrado!"
fi

if grep -q "if (!isAuthenticated)" App.tsx; then
  echo "✅ Verificação de autenticação encontrada"
else
  echo "❌ Verificação de autenticação NÃO encontrada!"
fi

echo ""
echo "4️⃣ Verificando TypeScript..."
echo ""

echo "Executando verificação de tipos..."
npx tsc --noEmit 2>&1 | grep -E "App\.tsx|LoginScreen|AuthService|JWTGenerator" | head -10

echo ""
echo "5️⃣ Verificando se Metro está rodando..."
echo ""

if lsof -ti:8081 > /dev/null 2>&1; then
  echo "✅ Metro está rodando na porta 8081"
else
  echo "❌ Metro NÃO está rodando!"
fi

echo ""
echo "6️⃣ Verificando se Android está conectado..."
echo ""

devices=$(adb devices | grep -v "List" | grep "device" | wc -l)
if [ $devices -gt 0 ]; then
  echo "✅ $devices dispositivo(s) Android conectado(s)"
  adb devices
else
  echo "❌ Nenhum dispositivo Android conectado!"
fi

echo ""
echo "=================================="
echo "✅ Diagnóstico completo!"
echo ""
