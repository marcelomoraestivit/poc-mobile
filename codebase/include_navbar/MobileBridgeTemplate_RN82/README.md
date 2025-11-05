# MobileBridge Template - React Native 0.82

> Template profissional de React Native com Mobile Bridge, gerenciamento de estado e arquitetura moderna

[![React Native](https://img.shields.io/badge/React%20Native-0.82.1-blue.svg)](https://reactnative.dev/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D20-green.svg)](https://nodejs.org/)

## 📋 Índice

- [Características](#características)
- [Início Rápido](#início-rápido)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Arquitetura](#arquitetura)
- [Troubleshooting](#troubleshooting)
- [Documentação](#documentação)

## ✨ Características

### Core
- ✅ **React Native 0.82.1** - Versão moderna com New Architecture
- ✅ **React 19.1.1** - Última versão do React
- ✅ **TypeScript 5.8.3** - Tipagem completa
- ✅ **New Architecture Ready** - Suporte a Fabric e TurboModules

### Componentes Prontos
- ✅ **TabBar** - Navegação por abas completa e customizável
- ✅ **TurboWebView** - WebView otimizado com bridge nativo
- ✅ **Toast** - Sistema de notificações
- ✅ **ErrorBoundary** - Tratamento de erros
- ✅ **NetworkStatusIndicator** - Indicador de conexão

### Mobile Bridge
- ✅ **Comunicação Bidirecional** - Native ↔ Web
- ✅ **Type-Safe** - Interface tipada
- ✅ **Event System** - Listeners e emitters
- ✅ **Security** - Validação e sanitização

### Gerenciamento de Estado
- ✅ **CartManager** - Carrinho de compras
- ✅ **WishlistManager** - Lista de desejos
- ✅ **SyncManager** - Sincronização de dados

### Serviços
- ✅ **AuthService** - Autenticação
- ✅ **AnalyticsService** - Tracking de eventos
- ✅ **NotificationService** - Notificações locais
- ✅ **PushNotificationService** - Push notifications
- ✅ **ErrorLogger** - Log de erros

### Storage
- ✅ **OfflineStorage** - Armazenamento offline
- ✅ **SecureStorage** - Armazenamento seguro
- ✅ **NetworkManager** - Gerenciamento de conexão

### Testing
- ✅ **Jest** - Framework de testes
- ✅ **Testes Unitários** - Cobertura de serviços críticos
- ✅ **Type Checking** - Verificação de tipos

## 🚀 Início Rápido

### Pré-requisitos

```bash
# Verificar versões instaladas
node --version    # >= 20
npm --version     # >= 10
java --version    # 17 ou 21
```

**Ferramentas necessárias:**
- Node.js >= 20
- JDK 17 ou 21
- Android Studio (para Android)
- Xcode (para iOS - apenas Mac)

### Instalação

```bash
# 1. Clone ou baixe o template
cd MobileBridgeTemplate_RN82

# 2. Instale as dependências
npm install

# 3. (Android) Certifique-se que o ANDROID_HOME está configurado
echo $ANDROID_HOME

# 4. (iOS - apenas Mac) Instale os pods
cd ios && pod install && cd ..
```

### Executar

**Android:**
```bash
# Terminal 1 - Metro Bundler
npm start

# Terminal 2 - App Android
npm run android
```

**iOS (apenas Mac):**
```bash
# Terminal 1 - Metro Bundler
npm start

# Terminal 2 - App iOS
npm run ios
```

## 📁 Estrutura do Projeto

```
MobileBridgeTemplate_RN82/
├── 📱 src/
│   ├── bridge/              # Mobile Bridge (nativo ↔ web)
│   │   ├── MobileBridge.ts
│   │   └── types.ts
│   ├── components/          # Componentes UI
│   │   ├── TabBar.tsx       # ⭐ Navegação por abas
│   │   ├── TurboWebView.tsx # ⭐ WebView com bridge
│   │   ├── Toast.tsx
│   │   ├── NetworkStatusIndicator.tsx
│   │   └── ErrorBoundary.tsx
│   ├── services/            # Serviços da aplicação
│   │   ├── AuthService.ts
│   │   ├── AnalyticsService.ts
│   │   ├── NotificationService.ts
│   │   ├── PushNotificationService.ts
│   │   └── ErrorLogger.ts
│   ├── store/               # Estado global
│   │   ├── CartManager.ts
│   │   └── WishlistManager.ts
│   ├── storage/             # Armazenamento
│   │   ├── OfflineStorage.ts
│   │   └── SecureStorage.ts
│   ├── network/             # Network
│   │   └── NetworkManager.ts
│   ├── sync/                # Sincronização
│   │   └── SyncManager.ts
│   └── utils/               # Utilitários
│       └── BridgeSecurity.ts
├── 🤖 android/              # Projeto Android nativo
│   ├── app/
│   │   └── src/main/java/com/mobilebridgeapp/
│   │       ├── MainActivity.kt
│   │       └── MainApplication.kt
│   ├── build.gradle
│   └── gradle.properties
├── 🍎 ios/                  # Projeto iOS nativo (Mac)
│   ├── MobileBridgeApp/
│   │   └── AppDelegate.swift
│   ├── Podfile
│   └── MobileBridgeApp.xcodeproj/
├── 🧪 __tests__/            # Testes
├── 📄 App.tsx               # Componente raiz
├── 📄 index.js              # Entry point
├── 📦 package.json
└── 📝 tsconfig.json
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia o Metro Bundler
npm run android        # Executa no Android
npm run ios            # Executa no iOS (Mac)

# Build
npm run build:android  # Build APK debug
npm run build:release  # Build APK release
npm run clean          # Limpa caches e builds

# Qualidade de Código
npm run lint           # Verifica código com ESLint
npm run lint:fix       # Corrige problemas automaticamente
npm run typecheck      # Verifica tipos TypeScript
npm test               # Executa testes
npm run test:watch     # Testes em modo watch
npm run test:coverage  # Testes com cobertura

# Utilitários
npm run reset          # Reset completo (cache + node_modules)
npm run doctor         # Diagnóstico do ambiente
```

## 🏗️ Arquitetura

### Mobile Bridge

Sistema de comunicação bidirecional entre código nativo e web:

```typescript
import MobileBridge from './src/bridge/MobileBridge';

// Enviar mensagem para a web
MobileBridge.sendMessage('cart.add', { productId: '123' });

// Ouvir mensagens da web
MobileBridge.addEventListener('web.ready', (data) => {
  console.log('Web está pronta!', data);
});
```

### Gerenciamento de Estado

```typescript
import { CartManager } from './src/store/CartManager';
import { WishlistManager } from './src/store/WishlistManager';

// Adicionar ao carrinho
await CartManager.addItem(product);

// Adicionar à wishlist
await WishlistManager.addItem(product);
```

### Storage

```typescript
import { OfflineStorage } from './src/storage/OfflineStorage';
import { SecureStorage } from './src/storage/SecureStorage';

// Dados offline
await OfflineStorage.save('user-data', userData);

// Dados sensíveis
await SecureStorage.set('auth-token', token);
```

## 🎨 Customização

### 1. Alterar Nome do App

```bash
# Edite os arquivos:
- app.json → "name" e "displayName"
- android/app/src/main/res/values/strings.xml → <string name="app_name">
- ios/MobileBridgeApp/Info.plist → CFBundleDisplayName
```

### 2. Customizar TabBar

Edite `src/components/TabBar.tsx`:

```typescript
const tabs = [
  { id: 'home', label: 'Início', icon: '🏠' },
  { id: 'search', label: 'Buscar', icon: '🔍' },
  // Adicione mais abas
];
```

### 3. Configurar WebView

Edite `App.tsx` (linha 395):

```typescript
const webAppUrl = 'https://seu-dominio.com';  // Altere aqui
```

## 🐛 Troubleshooting

### Erro: "MobileBridgeApp has not been registered"

**Solução:** Verifique se `app.json` tem `"name": "MobileBridgeApp"`

### Gradle Timeout

**Solução:** Aumente o timeout em `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
networkTimeout=120000
```

### Metro Bundler Travado

**Solução:**
```bash
npm run reset
npm start -- --reset-cache
```

### Problemas de Build Android

**Solução:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

Mais soluções: [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

## 📚 Documentação

- [Guia de Início Rápido](./docs/QUICKSTART.md)
- [Arquitetura Detalhada](./docs/ARCHITECTURE.md)
- [API do Mobile Bridge](./docs/MOBILE_BRIDGE_API.md)
- [Guia de Desenvolvimento](./docs/DEVELOPMENT_GUIDE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage
```

## 📝 Licença

Este é um template de projeto. Use livremente para seus projetos.

## 🤝 Contribuindo

1. Clone o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📧 Suporte

- Documentação: [docs/](./docs/)
- Issues: Abra uma issue no repositório
- Email: suporte@seu-projeto.com

---

**Feito com ❤️ usando React Native**
