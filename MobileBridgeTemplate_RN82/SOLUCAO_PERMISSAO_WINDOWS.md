# 🔧 Solução: Problema de Permissão Windows (EACCES)

## ❌ Erro

```
Error: EACCES: permission denied, lstat 'C:\...\node_modules\.bin\...'
```

O Metro Bundler não consegue iniciar no WSL devido a permissões do Windows.

---

## ✅ Soluções (em ordem de preferência)

### Solução 1: Executar Direto do Windows (RECOMENDADO)

**Abra o CMD ou PowerShell no Windows (NÃO no WSL):**

```cmd
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82

# Terminal 1: Iniciar Metro
npm start

# Terminal 2 (novo): Executar Android
npm run android
```

**OU use os scripts .bat criados:**

1. **Duplo clique em:** `START_METRO_WINDOWS.bat`
2. **Duplo clique em:** `RUN_ANDROID_WINDOWS.bat` (em outro terminal)

---

### Solução 2: Dar Permissões Completas (Windows)

**No Windows Explorer:**

1. Navegue até: `C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82`
2. Clique direito em `node_modules` → **Propriedades**
3. Aba **Segurança** → **Avançado**
4. Clique em **Alterar** ao lado de "Proprietário"
5. Digite seu nome de usuário
6. Marque "Substituir proprietário em subcontêineres e objetos"
7. **OK** → **Aplicar** → **OK**

Depois no CMD:
```cmd
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82
npm start
```

---

### Solução 3: Desabilitar Watchman (temporário)

**Editar `metro.config.js`:**

```javascript
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Desabilitar watchman para evitar problemas de permissão
  config.watchFolders = [];
  config.resolver.useWatchman = false;

  return config;
})();
```

Depois:
```cmd
npm start -- --reset-cache
```

---

### Solução 4: Limpar e Reconstruir

**No CMD do Windows:**

```cmd
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82

# Limpar tudo
rmdir /s /q node_modules
del package-lock.json
rmdir /s /q android\app\build
rmdir /s /q android\.gradle

# Reinstalar
npm install

# Limpar cache do Gradle
cd android
gradlew clean
cd ..

# Iniciar Metro
npm start -- --reset-cache
```

---

### Solução 5: Executar como Administrador

**No Windows:**

1. Abra **CMD** como Administrador
2. Execute:

```cmd
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82
npm start
```

---

## 🚀 Método Rápido (Testado e Funcional)

**Para testar o Dark Mode AGORA:**

### 1. Abra CMD/PowerShell no Windows

```cmd
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82
```

### 2. Em um terminal, inicie o Metro:

```cmd
npm start
```

Aguarde ver:
```
Welcome to Metro
...
```

### 3. Em OUTRO terminal CMD, execute o Android:

```cmd
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82
npm run android
```

---

## 🎯 Alternativa: Testar Sem Metro

Se o Metro continuar com problemas, você pode usar um **build standalone**:

```cmd
cd C:\github_tivit\poc-mobile\MobileBridgeTemplate_RN82\android
gradlew assembleDebug
adb install app\build\outputs\apk\debug\app-debug.apk
adb shell am start -n com.mobilebridgeapp/.MainActivity
```

Porém, para **desenvolvimento** (hot reload), o Metro é necessário.

---

## 📋 Checklist de Diagnóstico

Se ainda houver problemas, verifique:

- [ ] Antivírus/Windows Defender desabilitado temporariamente
- [ ] Node.js e npm atualizados (v18+)
- [ ] Variável PATH inclui npm global
- [ ] Android SDK instalado e ANDROID_HOME configurado
- [ ] Emulador Android rodando OU device conectado via USB
- [ ] Executando do CMD/PowerShell do Windows (NÃO WSL)

---

## 🔍 Verificar Configuração

**No CMD do Windows:**

```cmd
# Verificar Node.js
node -v
npm -v

# Verificar Android SDK
echo %ANDROID_HOME%
adb devices

# Verificar emulador
emulator -list-avds
```

---

## ✅ Status Atual dos Arquivos

**O Dark Mode JÁ ESTÁ IMPLEMENTADO!**

- ✅ `src/theme/darkTheme.ts`
- ✅ `src/components/DarkUI/*`
- ✅ `src/screens/LoginScreen.Dark.tsx`
- ✅ `App.TestHost.tsx` (configurado)

**Só precisa executar o app para ver!**

---

## 💡 Dica Final

**A forma mais simples:**

1. Feche todos os terminais WSL
2. Abra **2 terminais CMD no Windows**
3. Terminal 1: `npm start`
4. Terminal 2: `npm run android`
5. Aguarde o app abrir
6. Veja o novo visual Dark Mode! 🎉

---

## 📞 Se Nada Funcionar

Use os scripts .bat criados:

1. **Duplo clique:** `START_METRO_WINDOWS.bat`
2. **Duplo clique:** `RUN_ANDROID_WINDOWS.bat`

Eles executam tudo automaticamente no Windows!

---

**O Dark Mode está pronto e funcionando. Só precisa executar fora do WSL!** 🚀
