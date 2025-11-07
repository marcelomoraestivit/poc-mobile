# Getting Started - Mobile Bridge Template

Bem-vindo ao Mobile Bridge Template! Este guia vai te ajudar a configurar e executar o projeto em poucos minutos.

## 📋 Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Instalação](#instalação)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Primeiro Build](#primeiro-build)
5. [Escolhendo o Modo de Operação](#escolhendo-o-modo-de-operação)
6. [Executando a Aplicação](#executando-a-aplicação)
7. [Testando a Aplicação](#testando-a-aplicação)
8. [Próximos Passos](#próximos-passos)

## 🖥️ Requisitos do Sistema

### Obrigatório para Todos

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 ou **yarn** >= 1.22.0
- **Git**

### Para Desenvolvimento Android

- **JDK** 17 (Java Development Kit)
- **Android Studio** (última versão)
- **Android SDK** (API Level 33+)
- **Gradle** 8.0+

### Para Desenvolvimento iOS (apenas macOS)

- **macOS** 12+ (Monterey ou superior)
- **Xcode** 14+
- **CocoaPods** 1.12+
- **Command Line Tools**

## 🔧 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/mobile-bridge-template.git
cd mobile-bridge-template
```

### 2. Instale as Dependências do Node

```bash
npm install
```

**Ou com Yarn:**
```bash
yarn install
```

### 3. Instale as Dependências do iOS (apenas macOS)

```bash
cd ios
pod install
cd ..
```

**Troubleshooting:**
```bash
# Se encontrar erros, tente:
cd ios
pod deintegrate
pod install
cd ..
```

## ⚙️ Configuração do Ambiente

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e edite conforme necessário:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# WebView URL (ajuste para seu ambiente)
WEBVIEW_URL_ANDROID=http://10.0.2.2:5173
WEBVIEW_URL_IOS=http://localhost:5173
WEBVIEW_URL_PRODUCTION=https://your-app.com

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this
TOKEN_EXPIRATION=3600

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_PUSH_NOTIFICATIONS=true
```

### 2. Configurar Android

#### a) Abrir o Android Studio
```bash
# Abra o projeto Android
android studio android/
```

#### b) SDK Manager
1. Abra **Tools → SDK Manager**
2. Instale:
   - Android SDK Platform 33
   - Android SDK Build-Tools 33.0.0
   - Android Emulator
   - Intel x86 Emulator Accelerator (HAXM)

#### c) Criar um Emulador (AVD)
1. **Tools → AVD Manager**
2. **Create Virtual Device**
3. Escolha **Pixel 5** (recomendado)
4. Sistema: **Android 13.0 (API 33)**
5. Click **Finish**

#### d) Configurar ANDROID_HOME

**Windows:**
```powershell
# Adicione ao Path do Sistema
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools"
```

**macOS/Linux:**
```bash
# Adicione ao ~/.zshrc ou ~/.bashrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Configurar iOS (macOS apenas)

#### a) Instalar Xcode
```bash
# Via App Store ou:
xcode-select --install
```

#### b) Aceitar Licença
```bash
sudo xcodebuild -license accept
```

#### c) Configurar Signing & Capabilities
1. Abra `ios/MobileBridgeApp.xcworkspace` no Xcode
2. Selecione o projeto na sidebar
3. Aba **Signing & Capabilities**
4. Selecione seu **Team** (Apple Developer Account)

## 🏗️ Primeiro Build

### Verificar Configuração

```bash
# Verificar se tudo está ok
npx react-native doctor
```

Este comando verifica:
- ✅ Node.js
- ✅ JDK
- ✅ Android SDK
- ✅ Android Studio
- ✅ Xcode (macOS)
- ✅ CocoaPods (macOS)

### Build Inicial

**Android:**
```bash
# Limpar e fazer primeiro build
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

**iOS:**
```bash
# Limpar e fazer primeiro build
cd ios
xcodebuild clean
xcodebuild -workspace MobileBridgeApp.xcworkspace -scheme MobileBridgeApp
cd ..
```

## 🎮 Escolhendo o Modo de Operação

O template oferece 3 modos. Escolha um antes de executar:

### Modo 1: Standalone (Padrão)
Aplicativo completo com login e WebView.

```bash
npm run mode:standalone
```

**Quando usar:**
- Você quer um app completo pronto para produção
- Precisa de autenticação integrada
- Quer todas as funcionalidades out-of-the-box

### Modo 2: Embedded
Apenas WebView com TabBar nativo.

```bash
npm run mode:embedded
```

**Quando usar:**
- Você vai embedar em outro app
- Não precisa de tela de login nativa
- Quer apenas a funcionalidade de bridge

### Modo 3: Test Host
App de exemplo mostrando como embedar.

```bash
npm run mode:testhost
```

**Quando usar:**
- Você quer ver como integrar o embedded em um app maior
- Precisa de referência de implementação
- Quer testar navegação entre telas nativas e web

## 🚀 Executando a Aplicação

### 1. Iniciar o Servidor Web (em outro terminal)

A WebView precisa de um servidor rodando:

```bash
# Se você tem a aplicação web shopapp
cd ../MobileBridgePOC/shopapp-web
npm install
npm run dev
```

A aplicação web deve estar rodando em:
- `http://localhost:5173` (Vite)

### 2. Iniciar o Metro Bundler

```bash
npm start
```

**Ou limpar cache:**
```bash
npm start -- --reset-cache
```

### 3. Executar no Android

**Em outro terminal:**
```bash
npm run android
```

**Ou comandos específicos:**
```bash
# Debug build
npm run android:debug

# Release build
npm run android:release

# Limpar e buildar
npm run android:clean
```

### 4. Executar no iOS (macOS)

**Em outro terminal:**
```bash
npm run ios
```

**Ou comandos específicos:**
```bash
# Debug build
npm run ios:debug

# Release build
npm run ios:release

# Device específico
npm run ios -- --device "iPhone 14"
```

## 🧪 Testando a Aplicação

### Credenciais de Teste

O app vem com usuários de teste pré-configurados:

**Usuário 1:**
- Email: `usuario@teste.com`
- Senha: `senha123`

**Usuário 2:**
- Email: `admin@teste.com`
- Senha: `admin123`

### Testando o Mobile Bridge

1. **Login**: Use as credenciais acima
2. **Adicionar ao Carrinho**:
   - Navegue para a loja
   - Adicione produtos
   - Veja o badge do carrinho atualizar
3. **Favoritos**:
   - Clique no ícone de coração
   - Verifique na aba Wishlist
4. **Notificações**:
   - Aguarde 5 segundos após login
   - Deve aparecer notificação de "Flash Sale"

### Verificar Logs

**Android:**
```bash
npm run android:logs
# ou
adb logcat | grep ReactNative
```

**iOS:**
```bash
npm run ios:logs
# ou
xcrun simctl spawn booted log stream --predicate 'process == "MobileBridgeApp"'
```

## 📱 Testando em Dispositivo Físico

### Android

#### 1. Habilitar Modo Desenvolvedor
1. **Configurações → Sobre o telefone**
2. Toque 7x em **Número da versão**
3. Volte e entre em **Opções do desenvolvedor**
4. Habilite **Depuração USB**

#### 2. Conectar via USB
```bash
# Verificar se dispositivo é reconhecido
adb devices

# Executar no dispositivo
npm run android
```

#### 3. Conectar via WiFi (opcional)
```bash
# No dispositivo conectado via USB
adb tcpip 5555
adb connect <IP-DO-DISPOSITIVO>:5555

# Agora pode desconectar o USB
npm run android
```

#### 4. Ajustar URL da WebView
Edite `src/components/TurboWebView.tsx`:
```typescript
const WEBVIEW_URL = __DEV__
  ? 'http://192.168.1.100:5173' // Use o IP da sua máquina
  : 'https://production-url.com';
```

### iOS

#### 1. Conectar Dispositivo
1. Conecte via USB
2. Confie no computador quando solicitado

#### 2. Configurar no Xcode
1. Abra `ios/MobileBridgeApp.xcworkspace`
2. Selecione seu dispositivo no topo
3. Click em **Run** (▶️)

#### 3. Confiar no Certificado
1. No iPhone: **Configurações → Geral → Gerenciamento de Dispositivos**
2. Confie no certificado de desenvolvedor

## 🐛 Problemas Comuns

### Erro: "Unable to load script"

**Solução:**
```bash
# Limpar cache do Metro
npm start -- --reset-cache

# Limpar build Android
cd android && ./gradlew clean && cd ..

# Limpar build iOS
cd ios && xcodebuild clean && cd ..
```

### Erro: "SDK location not found"

**Solução Android:**
Crie `android/local.properties`:
```properties
sdk.dir=/Users/SEU_USUARIO/Library/Android/sdk
# ou no Windows
sdk.dir=C\:\\Users\\SEU_USUARIO\\AppData\\Local\\Android\\Sdk
```

### Erro: "Pod install failed"

**Solução iOS:**
```bash
cd ios
pod deintegrate
rm Podfile.lock
pod install --repo-update
cd ..
```

### Erro: "WebView não carrega"

**Solução:**
1. Verifique se o servidor web está rodando
2. Teste a URL no navegador
3. Para Android, verifique `android/app/src/main/res/xml/network_security_config.xml`

### Erro: "Port 8081 already in use"

**Solução:**
```bash
# Parar processo na porta 8081
npx react-native start --port 8082

# Ou matar o processo
lsof -ti:8081 | xargs kill
```

## 📚 Próximos Passos

Agora que você tem tudo rodando, explore:

1. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Entenda a arquitetura do projeto
2. **[README.md](README.md)** - Veja todas as funcionalidades disponíveis
3. **Customize o Tema** - Edite cores em `src/components/TabBar.tsx`
4. **Adicione Handlers** - Crie novos handlers no Mobile Bridge
5. **Configure CI/CD** - Automatize builds e deploys

### Tutoriais Recomendados

- [ ] Como adicionar um novo handler ao Mobile Bridge
- [ ] Como integrar Firebase Analytics
- [ ] Como configurar Push Notifications
- [ ] Como fazer build de release
- [ ] Como publicar na Play Store / App Store

## 💡 Dicas Úteis

### Recarregar App

**Android:**
- R + R (duas vezes)
- Ou shake o dispositivo → Reload

**iOS:**
- Cmd + R (simulator)
- Shake o dispositivo → Reload

### Debug Menu

**Android:**
- Cmd + M (macOS)
- Ctrl + M (Windows/Linux)
- Shake o dispositivo

**iOS:**
- Cmd + D (simulator)
- Shake o dispositivo

### Comandos Úteis

```bash
# Limpar tudo
npm run clean

# Reinstalar dependências
npm run reinstall

# Verificar tipos TypeScript
npm run typecheck

# Lint do código
npm run lint

# Formatar código
npm run format
```

## 🎓 Recursos de Aprendizado

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Hooks Guide](https://react.dev/reference/react)
- [WebView Documentation](https://github.com/react-native-webview/react-native-webview)
