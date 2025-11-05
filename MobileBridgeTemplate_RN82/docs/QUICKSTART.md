# 🚀 Guia de Início Rápido

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

### Obrigatório para todos
- ✅ Node.js >= 20
- ✅ npm >= 10
- ✅ Git

### Para Android
- ✅ JDK 17 ou 21
- ✅ Android Studio
- ✅ Android SDK (API 24+)
- ✅ Variável ANDROID_HOME configurada

### Para iOS (apenas Mac)
- ✅ Xcode 14+
- ✅ CocoaPods
- ✅ macOS Ventura ou superior

## ⚡ Setup Rápido (5 minutos)

### 1. Clone/Baixe o Template

```bash
# Se estiver no repositório Git
git clone <url-do-repositorio>
cd MobileBridgeTemplate_RN82

# Ou simplesmente copie a pasta do template
```

### 2. Instale as Dependências

```bash
npm install
```

**Para iOS (apenas Mac):**
```bash
cd ios && pod install && cd ..
```

### 3. Execute o Projeto

**Android:**
```bash
# Terminal 1
npm start

# Terminal 2 (em nova janela)
npm run android
```

**iOS:**
```bash
# Terminal 1
npm start

# Terminal 2 (em nova janela)
npm run ios
```

## ✅ Verificação de Ambiente

Execute o diagnóstico do React Native:

```bash
npm run doctor
```

Isso irá verificar:
- Node.js
- Watchman
- Android SDK
- Xcode (Mac)
- JDK

## 🎯 Primeira Execução

### Android

1. **Conecte um dispositivo ou inicie um emulador**
   ```bash
   # Verificar dispositivos conectados
   adb devices
   ```

2. **Execute o app**
   ```bash
   npm run android
   ```

3. **O app deve abrir automaticamente no dispositivo/emulador**

### iOS (apenas Mac)

1. **Abra um simulador do Xcode** ou conecte um dispositivo iOS

2. **Execute o app**
   ```bash
   npm run ios
   ```

3. **Ou especifique um dispositivo**
   ```bash
   npm run ios -- --simulator="iPhone 15 Pro"
   ```

## 🔧 Customização Básica

### 1. Alterar Nome do App

**Arquivo: `app.json`**
```json
{
  "name": "MeuApp",
  "displayName": "Meu Super App"
}
```

**Android: `android/app/src/main/res/values/strings.xml`**
```xml
<string name="app_name">Meu Super App</string>
```

**iOS: `ios/MobileBridgeApp/Info.plist`**
```xml
<key>CFBundleDisplayName</key>
<string>Meu Super App</string>
```

### 2. Alterar URL da WebView

**Arquivo: `App.tsx` (linha 395)**
```typescript
const webAppUrl = 'https://meu-site.com';  // Altere a URL aqui
```

> **Nota:** A URL é definida no App.tsx, não no TurboWebView.tsx. O componente TurboWebView recebe a URL via prop `source`.

### 3. Customizar TabBar

**Arquivo: `src/components/TabBar.tsx`**
```typescript
const tabs = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'products', label: 'Produtos', icon: '📦' },
  { id: 'profile', label: 'Perfil', icon: '👤' },
];
```

## 📱 Testando o Mobile Bridge

### Do Native para Web:

```typescript
import MobileBridge from './src/bridge/MobileBridge';

// Enviar mensagem
MobileBridge.sendMessage('test', { data: 'Hello Web!' });
```

### Da Web para Native:

```javascript
// No seu código web
window.ReactNativeWebView?.postMessage(
  JSON.stringify({
    type: 'web.message',
    data: { hello: 'native' }
  })
);
```

### Escutar mensagens:

```typescript
MobileBridge.addEventListener('web.message', (data) => {
  console.log('Mensagem da web:', data);
});
```

## 🐛 Problemas Comuns

### Metro Bundler não inicia

```bash
npm run clean:metro
npm start -- --reset-cache
```

### App não conecta ao Metro

```bash
# Android - execute no terminal
adb reverse tcp:8081 tcp:8081
```

### Build Android falha

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Erro "Unable to load script"

1. Certifique-se que o Metro está rodando (`npm start`)
2. No Android, execute: `adb reverse tcp:8081 tcp:8081`
3. Recarregue o app (R + R no dispositivo)

### Erro de permissão no gradlew

```bash
chmod +x android/gradlew
```

## 📚 Próximos Passos

1. ✅ Leia a [Arquitetura do Projeto](./ARCHITECTURE.md)
2. ✅ Confira o [Guia de Desenvolvimento](./DEVELOPMENT_GUIDE.md)
3. ✅ Veja a [API do Mobile Bridge](./MOBILE_BRIDGE_API.md)
4. ✅ Explore os exemplos em `src/`

## 🆘 Precisa de Ajuda?

- [Troubleshooting](./TROUBLESHOOTING.md) - Soluções para problemas comuns
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Bom desenvolvimento! 🚀**
