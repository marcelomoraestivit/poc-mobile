# MobileBridgeTemplate_RN82

Template baseado no projeto **MobileBridgePOC/MobileBridgeApp** com React Native 0.82.1

## Características

- ✅ **React Native 0.82.1** - Versão mais recente e moderna
- ✅ **React 19.1.1** - Última versão do React
- ✅ **Node >= 20** - Suporte às versões mais recentes
- ✅ **TabBar completo** - Componente TabBar já implementado
- ✅ **TurboWebView** - WebView otimizado com bridge
- ✅ **Mobile Bridge** - Sistema de comunicação nativo-web
- ✅ **Gerenciamento de Estado** - Cart, Wishlist, Sync
- ✅ **Serviços Completos** - Auth, Analytics, Notifications, Push
- ✅ **Network Manager** - Gerenciamento de conexão
- ✅ **Offline Storage** - Armazenamento local e seguro
- ✅ **Error Handling** - ErrorBoundary e ErrorLogger
- ✅ **Toast Notifications** - Sistema de notificações

## 🎯 TabBar

O projeto já inclui um **TabBar completo e funcional** em:
```
src/components/TabBar.tsx
```

### Características do TabBar:
- Totalmente funcional com 4 abas (Home, Search, Wishlist, Cart)
- Badge de contagem no Cart
- Animações suaves
- Ícones personalizados
- Já integrado no App.tsx

### Como personalizar:

Edite `src/components/TabBar.tsx` para modificar:
- Cores
- Ícones
- Número de abas
- Comportamento

## 🚀 Como usar

### Pré-requisitos

- Node.js >= 20
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS/Mac)
- JDK 17 ou 21

### 1. Instalar dependências

```bash
cd MobileBridgeTemplate_RN82
npm install
```

### 2. Para Android

```bash
# Executar Metro Bundler
npm start

# Em outro terminal
npm run android
```

### 3. Para iOS (apenas Mac)

```bash
cd ios
pod install
cd ..
npm run ios
```

## 📁 Estrutura do Projeto

```
MobileBridgeTemplate_RN82/
├── src/
│   ├── bridge/              # Mobile Bridge (nativo-web)
│   │   └── MobileBridge.ts
│   ├── components/          # Componentes UI
│   │   ├── TabBar.tsx       # TabBar completo
│   │   ├── TurboWebView.tsx # WebView otimizado
│   │   ├── Toast.tsx
│   │   ├── NetworkStatusIndicator.tsx
│   │   └── ErrorBoundary.tsx
│   ├── services/            # Serviços da aplicação
│   │   ├── AuthService.ts
│   │   ├── AnalyticsService.ts
│   │   ├── NotificationService.ts
│   │   ├── PushNotificationService.ts
│   │   └── ErrorLogger.ts
│   ├── store/               # Gerenciamento de estado
│   │   ├── CartManager.ts
│   │   └── WishlistManager.ts
│   ├── storage/             # Armazenamento
│   │   ├── OfflineStorage.ts
│   │   └── SecureStorage.ts
│   ├── network/             # Network management
│   │   └── NetworkManager.ts
│   └── sync/                # Sincronização
│       └── SyncManager.ts
├── android/                 # Projeto Android nativo
├── ios/                     # Projeto iOS nativo
└── App.tsx                  # Componente raiz