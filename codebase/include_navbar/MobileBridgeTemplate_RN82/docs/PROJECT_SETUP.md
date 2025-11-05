# 📝 Checklist de Setup do Projeto

Use este checklist ao iniciar um novo projeto baseado no template.

## ✅ Configuração Inicial

### 1. Setup do Ambiente

- [ ] Node.js >= 20 instalado
- [ ] JDK 17 ou 21 instalado e configurado
- [ ] Android Studio instalado (para Android)
- [ ] Xcode instalado (para iOS - apenas Mac)
- [ ] Variável ANDROID_HOME configurada
- [ ] Android SDK instalado (API 24+)
- [ ] Executar `npx react-native doctor` sem erros

### 2. Clone e Instalação

```bash
# 1. Clone/copie o template
cd MobileBridgeTemplate_RN82

# 2. Instale dependências
npm install

# 3. iOS apenas (Mac)
cd ios && pod install && cd ..
```

- [ ] Dependências instaladas sem erros
- [ ] Pods instalados (iOS)

### 3. Configuração do Projeto

#### Renomear Aplicação

- [ ] `app.json` - Alterar `name` e `displayName`
- [ ] `package.json` - Alterar `name`
- [ ] `android/app/src/main/res/values/strings.xml` - Alterar `app_name`
- [ ] `ios/MobileBridgeApp/Info.plist` - Alterar `CFBundleDisplayName`

**Importante:** Se alterar o `app.json`, certifique-se de atualizar:
- [ ] `android/app/src/main/java/com/mobilebridgeapp/MainActivity.kt:14` - método `getMainComponentName()`
- [ ] `ios/MobileBridgeApp/AppDelegate.swift` - nome do módulo

#### Configurar Package ID (Bundle ID)

**Android:**
- [ ] `android/app/build.gradle` - Alterar `applicationId`
- [ ] Renomear pasta `android/app/src/main/java/com/mobilebridgeapp/` para `com/sua/empresa/app/`
- [ ] Atualizar imports em `MainActivity.kt` e `MainApplication.kt`

**iOS:**
- [ ] Abrir `ios/MobileBridgeApp.xcworkspace` no Xcode
- [ ] Alterar Bundle Identifier em Project Settings

### 4. Configurar Variáveis de Ambiente

- [ ] Copiar `.env.example` para `.env`
- [ ] Preencher variáveis necessárias:
  - [ ] `WEBVIEW_DEFAULT_URL` - URL da sua aplicação web
  - [ ] `API_BASE_URL` - URL da sua API
  - [ ] `API_KEY` - Chave de API (se necessário)
  - [ ] Configurações de Analytics
  - [ ] Configurações de Push Notifications

### 5. Customizar WebView

- [ ] `src/components/TurboWebView.tsx` - Alterar URL padrão
- [ ] Configurar permissões necessárias (câmera, localização, etc)

### 6. Customizar TabBar

- [ ] `src/components/TabBar.tsx` - Definir abas do app
- [ ] Definir ícones (emojis ou react-native-vector-icons)
- [ ] Configurar cores e tema

## 🎨 Personalização Visual

### Android

#### Ícone do App
- [ ] Adicionar ícone em `android/app/src/main/res/mipmap-*/ic_launcher.png`
- [ ] Ou usar ferramenta: https://icon.kitchen/

#### Splash Screen
- [ ] Configurar `android/app/src/main/res/drawable/rn_edit_text_material.xml`
- [ ] Ou instalar `react-native-splash-screen`

#### Cores
- [ ] `android/app/src/main/res/values/colors.xml` - Definir paleta

### iOS

#### Ícone do App
- [ ] Adicionar ícone em `ios/MobileBridgeApp/Images.xcassets/AppIcon.appiconset/`

#### Splash Screen
- [ ] Editar `ios/MobileBridgeApp/LaunchScreen.storyboard`

#### Cores
- [ ] Configurar em `ios/MobileBridgeApp/Images.xcassets/`

## 🔐 Segurança

### Android

- [ ] Criar keystore para release:
  ```bash
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore my-release-key.keystore \
    -alias my-key-alias \
    -keyalg RSA -keysize 2048 \
    -validity 10000
  ```
- [ ] Configurar `android/gradle.properties` com credenciais do keystore
- [ ] Adicionar `*.keystore` ao `.gitignore`

### iOS

- [ ] Configurar certificados no Apple Developer
- [ ] Configurar Provisioning Profiles
- [ ] Configurar Code Signing no Xcode

### Geral

- [ ] Adicionar `.env` ao `.gitignore`
- [ ] Nunca commitar chaves de API
- [ ] Usar variáveis de ambiente para dados sensíveis

## 📱 Funcionalidades

### Mobile Bridge

- [ ] Configurar eventos necessários em `src/bridge/MobileBridge.ts`
- [ ] Documentar API do bridge para a equipe web
- [ ] Testar comunicação Native ↔ Web

### Storage

- [ ] Definir estrutura de dados em `src/storage/OfflineStorage.ts`
- [ ] Configurar SecureStorage para dados sensíveis

### Autenticação

- [ ] Implementar fluxo de login em `src/services/AuthService.ts`
- [ ] Configurar tokens e refresh
- [ ] Integrar com backend

### Analytics

- [ ] Configurar Firebase Analytics ou similar
- [ ] Definir eventos a trackear
- [ ] Implementar em `src/services/AnalyticsService.ts`

### Push Notifications

- [ ] Configurar Firebase Cloud Messaging (Android)
- [ ] Configurar APNs (iOS)
- [ ] Testar recebimento de notificações
- [ ] Implementar deeplinks

## 🧪 Testes

### Setup de Testes

- [ ] Executar `npm test` - deve passar
- [ ] Adicionar testes para suas funcionalidades
- [ ] Configurar CI/CD para rodar testes

### Testes Específicos

- [ ] Testar em dispositivo físico Android
- [ ] Testar em dispositivo físico iOS
- [ ] Testar em diferentes versões do Android (API 24+)
- [ ] Testar em diferentes versões do iOS (14+)
- [ ] Testar com conexão lenta
- [ ] Testar modo offline

## 🚀 Deploy

### Android

- [ ] Build de release: `npm run build:release`
- [ ] Testar APK em dispositivos
- [ ] Gerar AAB para Play Store:
  ```bash
  cd android
  ./gradlew bundleRelease
  ```
- [ ] Upload para Play Console

### iOS

- [ ] Archive no Xcode (Product > Archive)
- [ ] Upload para App Store Connect
- [ ] Configurar TestFlight
- [ ] Submeter para review

## 📚 Documentação

- [ ] Atualizar README.md com informações do projeto
- [ ] Documentar arquitetura específica
- [ ] Documentar APIs e integrações
- [ ] Criar guia de contribuição
- [ ] Documentar processo de deploy

## 🔄 Manutenção

### Controle de Versão

- [ ] Inicializar Git:
  ```bash
  git init
  git add .
  git commit -m "Initial commit from MobileBridge Template"
  ```
- [ ] Criar repositório remoto
- [ ] Push inicial
- [ ] Configurar GitFlow ou outro workflow

### Atualizações

- [ ] Definir estratégia de atualização do React Native
- [ ] Definir estratégia de atualização de dependências
- [ ] Configurar Dependabot ou similar

## ✨ Extras

### Recomendado

- [ ] Configurar ESLint + Prettier
- [ ] Configurar Husky para pre-commit hooks
- [ ] Adicionar Storybook para componentes
- [ ] Configurar Sentry ou similar para crash reporting
- [ ] Implementar feature flags
- [ ] Configurar deep linking
- [ ] Configurar universal links (iOS) / app links (Android)

### Opcional

- [ ] Configurar Fastlane para automação
- [ ] Configurar CodePush para OTA updates
- [ ] Implementar A/B testing
- [ ] Adicionar onboarding screens
- [ ] Implementar dark mode

## 📝 Checklist Final

Antes de lançar:

- [ ] Todos os testes passando
- [ ] Sem warnings de build
- [ ] Sem console.logs desnecessários
- [ ] Performance verificada (< 2s para load inicial)
- [ ] Testado em dispositivos reais
- [ ] Ícones e assets corretos
- [ ] Versão correta em `package.json`, `build.gradle` e `Info.plist`
- [ ] Changelog atualizado
- [ ] Documentação atualizada
- [ ] Secrets removidos do código
- [ ] Analytics funcionando
- [ ] Crash reporting funcionando

---

**Parabéns! Seu projeto está pronto para desenvolvimento! 🎉**
