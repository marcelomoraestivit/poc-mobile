# 🔧 Instruções para Rebuild Completo

## Problema
O app continua com tela preta mesmo após as correções porque o build anterior não aplicou as mudanças corretamente.

## Solução: Rebuild Completo

### Opção 1: Usar o Script Automático (RECOMENDADO)

Execute no terminal WSL:

```bash
bash rebuild-app.sh
```

Este script fará:
1. ✅ Matar todos os processos React Native/Metro
2. ✅ Desinstalar app do dispositivo
3. ✅ Limpar cache do Metro
4. ✅ Limpar build Android
5. ✅ Verificar se Fabric está desabilitado
6. ✅ Iniciar Metro Bundler
7. ✅ Reconstruir e instalar o app

**Aguarde alguns minutos** para o build completar.

---

### Opção 2: Passo a Passo Manual

Se preferir fazer manualmente:

#### 1. Matar Processos
```bash
pkill -9 -f "react-native"
pkill -9 -f "metro"
pkill -9 -f "node"
```

#### 2. Desinstalar App
```bash
adb uninstall com.mobilebridgeapp
```

#### 3. Limpar Cache Metro
```bash
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*
rm -rf /tmp/react-*
```

#### 4. Limpar Build Android
```bash
cd android
rm -rf app/build
rm -rf build
rm -rf .gradle
cd ..
```

#### 5. Verificar Fabric
```bash
grep newArchEnabled android/gradle.properties
# Deve mostrar: newArchEnabled=false
```

Se mostrar `true`, edite manualmente:
```bash
nano android/gradle.properties
# Mude newArchEnabled=true para newArchEnabled=false
```

#### 6. Iniciar Metro
```bash
npx react-native start --reset-cache &
```

Aguarde 10 segundos.

#### 7. Build e Instalar
```bash
npx react-native run-android
```

---

## O que Esperar

### Durante o Build:
```
> Task :app:installDebug
Installing APK 'app-debug.apk' on 'Pixel_3a_API_30(AVD)' for :app:debug
Installed on 1 device.

BUILD SUCCESSFUL in 2m 30s
```

### Após Instalação:
O app abrirá automaticamente e você deve ver:

```
┌─────────────────────────────────┐
│  TESTE - App Funcionando!       │ ← Header vermelho
├─────────────────────────────────┤
│                                 │
│            🎉                   │ ← Emoji grande
│                                 │
│   Se você vê isso,              │
│   o app está funcionando!       │
│                                 │
└─────────────────────────────────┘
```

### Nos Logs (adb logcat):
```
[Simple] App rendering
Running "MobileBridgeApp"
```

**SEM** erros de Fabric:
- ❌ Não deve ter: `FabricUIManager`
- ❌ Não deve ter: `BridgelessReact`
- ❌ Não deve ter: `Trying to stop surface`

---

## Se Ainda Não Funcionar

### 1. Verificar se Fabric foi realmente desabilitado
```bash
adb logcat | grep -i fabric
# Não deve mostrar nada relacionado a Fabric
```

### 2. Screenshot do Android
```bash
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png .
# Abra screenshot.png para ver o que o Android está vendo
```

### 3. Verificar Erros Específicos
```bash
adb logcat *:E | grep -i "error\|exception"
```

### 4. Limpar TUDO e Recomeçar
```bash
# Deletar node_modules
rm -rf node_modules
npm install

# Limpar watchman
watchman watch-del-all

# Limpar cache npm
npm cache clean --force

# Rebuild
bash rebuild-app.sh
```

---

## Checklist de Verificação

Antes de executar o rebuild, confirme:

- [ ] `android/gradle.properties` tem `newArchEnabled=false`
- [ ] `android/app/src/main/res/values/styles.xml` tem `windowBackground`
- [ ] `index.js` aponta para `App.TestHost.Simple`
- [ ] Todos os processos Metro foram mortos
- [ ] App foi desinstalado do dispositivo

Se todos os itens estão marcados, execute:
```bash
bash rebuild-app.sh
```

---

## Próximos Passos

Após confirmar que a versão simples funciona:

1. Editar `index.js`:
   ```javascript
   import App from './App.TestHost'; // versão completa
   ```

2. Recarregar (R+R no dispositivo)

3. Testar navegação entre telas

---

## Arquivos de Diagnóstico Criados

1. ✅ `SOLUCAO_FABRIC.md` - Explicação do problema Fabric
2. ✅ `DIAGNOSTICO_TELA_PRETA.md` - Análise completa do problema
3. ✅ `CORRECAO_FINAL.md` - Todas as correções aplicadas
4. ✅ `rebuild-app.sh` - Script automático de rebuild
5. ✅ `INSTRUCOES_REBUILD.md` - Este arquivo

---

**Execute `bash rebuild-app.sh` agora!** 🚀
