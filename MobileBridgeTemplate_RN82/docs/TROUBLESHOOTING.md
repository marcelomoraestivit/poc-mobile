# 🔧 Troubleshooting

Guia completo de solução de problemas para o MobileBridge Template.

## 📋 Índice

- [Erros Comuns](#erros-comuns)
- [Problemas de Build](#problemas-de-build)
- [Problemas de Runtime](#problemas-de-runtime)
- [Problemas de Rede](#problemas-de-rede)
- [Problemas Específicos](#problemas-específicos)

## 🐛 Erros Comuns

### Erro: "MobileBridgeApp has not been registered"

**Causa:** Incompatibilidade entre o nome registrado no `app.json` e o esperado pelo código nativo.

**Solução:**
```bash
# Verifique se app.json tem:
{
  "name": "MobileBridgeApp"  // ← Deve ser exatamente isso
}
```

Se mudou o nome, atualize também:
- `android/app/src/main/java/com/mobilebridgeapp/MainActivity.kt` (linha 14)
- `ios/MobileBridgeApp/AppDelegate.swift`

---

### Erro: "Unable to load script from assets"

**Causa:** Metro Bundler não está rodando ou app não consegue conectar.

**Solução:**

1. **Inicie o Metro:**
   ```bash
   npm start -- --reset-cache
   ```

2. **Android - Configure port forwarding:**
   ```bash
   adb reverse tcp:8081 tcp:8081
   ```

3. **Recarregue o app:**
   - Pressione `R` duas vezes
   - Ou no menu Dev: Reload

---

### Erro: "Gradle Timeout"

**Causa:** Download do Gradle ou dependências travou.

**Solução:**

**1. Aumente o timeout:**
```bash
# Edite: android/gradle/wrapper/gradle-wrapper.properties
networkTimeout=120000  # 2 minutos
```

**2. Limpe e tente novamente:**
```bash
cd android
./gradlew clean --stop
./gradlew assembleDebug
```

**3. Use cache offline (se já baixou antes):**
```bash
./gradlew assembleDebug --offline
```

---

### Erro: "JAVA_HOME not set"

**Causa:** Variável de ambiente JAVA_HOME não configurada.

**Solução:**

**macOS/Linux:**
```bash
# Adicione ao ~/.bashrc ou ~/.zshrc
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH

# Recarregue o shell
source ~/.bashrc  # ou ~/.zshrc
```

**Windows:**
```cmd
# Execute como administrador
setx JAVA_HOME "C:\Program Files\Java\jdk-17"
setx PATH "%JAVA_HOME%\bin;%PATH%"
```

---

## 🏗️ Problemas de Build

### Android Build Falha

**Erro:** `BUILD FAILED`

**Soluções:**

**1. Limpar tudo e rebuildar:**
```bash
npm run clean
npm run android
```

**2. Limpar cache do Gradle:**
```bash
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
```

**3. Invalidar caches:**
```bash
rm -rf android/.gradle
rm -rf android/app/build
npm run android
```

**4. Verificar versão do JDK:**
```bash
java -version  # Deve ser 17 ou 21
```

---

### iOS Build Falha

**Erro:** `Build failed`

**Soluções:**

**1. Reinstalar Pods:**
```bash
cd ios
rm -rf Pods
rm -rf Podfile.lock
pod install
cd ..
```

**2. Limpar build do Xcode:**
```bash
cd ios
xcodebuild clean
cd ..
```

**3. Abrir no Xcode e limpar:**
```bash
# Abra o projeto
open ios/MobileBridgeApp.xcworkspace

# No Xcode:
# Product > Clean Build Folder (Shift + Cmd + K)
# Product > Build (Cmd + B)
```

---

### Erro: "Multiple commands produce..."

**Causa:** Conflito de arquivos no build.

**Solução:**
```bash
cd ios
rm -rf build
rm -rf DerivedData
pod deintegrate
pod install
cd ..
```

---

## 🔄 Problemas de Runtime

### App Crash ao Iniciar

**1. Verificar logs:**

**Android:**
```bash
adb logcat | grep ReactNative
```

**iOS:**
```bash
# No Xcode, veja a aba Console
```

**2. Limpar dados do app:**

**Android:**
```bash
adb shell pm clear com.mobilebridgeapp
```

**3. Desinstalar e reinstalar:**
```bash
adb uninstall com.mobilebridgeapp
npm run android
```

---

### App Fica em Tela Branca

**Causa:** JavaScript não carregou ou erro fatal.

**Solução:**

1. **Abra o Developer Menu:**
   - Android: Cmd + M (Mac) ou Ctrl + M (Windows/Linux)
   - iOS: Cmd + D

2. **Enable Hot Reloading**

3. **Reload:** Pressione R + R

4. **Verifique o Metro:**
   ```bash
   # Deve mostrar "Loading..."
   npm start
   ```

---

### Red Screen Error

**Causa:** Erro no código JavaScript.

**Solução:**

1. **Leia a mensagem de erro** - geralmente mostra o arquivo e linha
2. **Verifique o stack trace**
3. **Corrija o código**
4. **Reload:** R + R

---

## 🌐 Problemas de Rede

### WebView não Carrega

**Solução:**

**Android - Habilitar HTTP:**
```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

---

### Metro não Conecta

**Solução:**

**1. Verificar porta 8081:**
```bash
# Verificar se está em uso
lsof -i :8081

# Se estiver, mate o processo
kill -9 <PID>
```

**2. Android - Port forwarding:**
```bash
adb reverse tcp:8081 tcp:8081
```

**3. Especificar IP manualmente:**
```bash
# No Developer Menu > Settings > Debug server host
192.168.1.100:8081  # Seu IP local
```

---

## 🔍 Problemas Específicos

### Erro: "Duplicate resources"

**Solução:**
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
```

---

### Erro: "Task ':app:installDebug' failed"

**Solução:**

1. **Verifique dispositivos:**
   ```bash
   adb devices
   ```

2. **Se nenhum dispositivo:**
   - Inicie um emulador no Android Studio
   - Ou conecte um dispositivo USB (habilite Developer Mode)

3. **Permissões:**
   ```bash
   chmod +x android/gradlew
   ```

---

### Erro: "npm ERR! missing script"

**Causa:** Script não existe no package.json

**Solução:**

Verifique os scripts disponíveis:
```bash
npm run
```

Se faltarem scripts, copie do package.json original do template.

---

### Cache Corrompido

**Solução - Reset Completo:**

```bash
# 1. Limpar tudo
npm run reset

# 2. Limpar cache do Metro
watchman watch-del-all
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# 3. Reinstalar
npm install

# 4. Limpar build nativo
cd android && ./gradlew clean && cd ..

# 5. Rodar
npm start -- --reset-cache
```

---

## 📱 Problemas de Dispositivo

### Dispositivo Android não detectado

**Solução:**

1. **Habilitar USB Debugging:**
   - Configurações > Sobre o telefone
   - Toque 7x em "Número da versão"
   - Configurações > Opções do desenvolvedor
   - Ative "Depuração USB"

2. **Verificar conexão:**
   ```bash
   adb devices
   ```

3. **Se não aparecer:**
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

---

### iOS Simulator não abre

**Solução:**

```bash
# Listar simuladores
xcrun simctl list devices

# Abrir específico
xcrun simctl boot "iPhone 15 Pro"

# Reset do simulator
xcrun simctl erase all
```

---

## 🆘 Comandos de Emergência

### Reset Completo (Última Opção)

```bash
# ATENÇÃO: Isso apaga TUDO e reinstala

# 1. Remover node_modules e builds
rm -rf node_modules
rm -rf android/build
rm -rf android/app/build
rm -rf ios/build
rm -rf ios/Pods

# 2. Limpar caches
npm cache clean --force
watchman watch-del-all

# 3. Reinstalar tudo
npm install
cd ios && pod install && cd ..

# 4. Rodar
npm start -- --reset-cache
```

---

## 📚 Recursos Adicionais

- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [Android Studio Issues](https://developer.android.com/studio/troubleshoot)
- [Xcode Help](https://developer.apple.com/support/xcode/)
- [Stack Overflow - React Native](https://stackoverflow.com/questions/tagged/react-native)

---

**Ainda com problemas? Abra uma issue no repositório!**
