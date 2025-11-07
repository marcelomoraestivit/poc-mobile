# Arquitetura do Mobile Bridge Template

## Visão Geral

O Mobile Bridge Template é uma arquitetura híbrida que combina aplicações web (React) com aplicações nativas (React Native), permitindo que páginas web se comuniquem bidirecionalmente com funcionalidades nativas do dispositivo.

## Arquitetura do Sistema

```mermaid
graph TB
    subgraph "React Native App"
        A[App.tsx] --> B[TurboWebView]
        A --> C[TabBar Nativo]
        A --> D[MobileBridge]

        D --> E[CartManager]
        D --> F[WishlistManager]
        D --> G[AuthService]
        D --> H[NotificationService]
        D --> I[SecureStorage]

        B --> J[WebView Component]
    end

    subgraph "Web App React"
        K[ShopContext] --> L[Cart State]
        K --> M[Wishlist State]
        N[WebBridge API] --> K
    end

    J <-->|postMessage| N
    D <-->|Bridge Communication| N

    E --> I
    F --> I
    G --> I

    style A fill:#e03131
    style D fill:#8b5cf6
    style N fill:#10b981
```

## Componentes Principais

### 1. Aplicação Nativa (React Native)

#### App.tsx / App.Embedded.tsx / App.TestHost.tsx
Três modos de operação do aplicativo:

- **App.tsx**: Aplicativo standalone completo com autenticação
- **App.Embedded.tsx**: WebView com TabBar nativo (para embedding)
- **App.TestHost.tsx**: Aplicativo host que demonstra como integrar o embedded

```mermaid
graph LR
    A[App.tsx] -->|Standalone| B[Login + WebView + TabBar]
    C[App.Embedded.tsx] -->|Embedded| D[WebView + TabBar Only]
    E[App.TestHost.tsx] -->|Host App| F[Native Screens + Embedded WebView]

    style A fill:#e03131
    style C fill:#e03131
    style E fill:#e03131
```

#### Mobile Bridge
Gerencia a comunicação bidirecional entre Web e Native.

**Handlers Registrados:**
```typescript
- navigate: Navegação entre páginas
- addToCart: Adicionar produto ao carrinho
- removeFromCart: Remover produto do carrinho
- updateQuantity: Atualizar quantidade
- clearCart: Limpar carrinho
- addToWishlist: Adicionar aos favoritos
- removeFromWishlist: Remover dos favoritos
- showToast: Exibir notificação toast
- getDeviceInfo: Obter informações do dispositivo
- shareContent: Compartilhar conteúdo
- scanBarcode: Escanear código de barras
- authenticate: Autenticação biométrica
```

#### Managers e Services

```mermaid
classDiagram
    class CartManager {
        -cart CartItem[]
        -listeners Function[]
        +getInstance() CartManager
        +addItem(product, quantity)
        +removeItem(productId)
        +updateQuantity(productId, quantity)
        +clear()
        +getItems() CartItem[]
        +getItemCount() number
    }

    class WishlistManager {
        -wishlist string[]
        -listeners Function[]
        +getInstance() WishlistManager
        +addItem(productId)
        +removeItem(productId)
        +clear()
        +hasItem(productId) boolean
    }

    class AuthService {
        -currentUser User
        -tokens AuthTokens
        +loginWithEmail(email, password)
        +logout()
        +isAuthenticated() boolean
        +getCurrentUser() User
        +getAccessToken() string
    }

    class SecureStorage {
        +setItem(key, value)
        +getItem(key) string
        +setObject(key, object)
        +getObject(key) T
        +removeItem(key)
    }

    CartManager --> SecureStorage
    WishlistManager --> SecureStorage
    AuthService --> SecureStorage
```

### 2. Aplicação Web (React)

#### ShopContext
Gerencia o estado do carrinho e wishlist no lado web, e notifica o nativo sobre mudanças.

```typescript
useEffect(() => {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (window.WebBridge) {
    await window.WebBridge.sendToNative('cartUpdated', {
      count: cartCount,
      items: cart.length,
      total: getCartTotal()
    });
  }
}, [cart]);
```

## Fluxo de Comunicação

### Web → Native

```mermaid
sequenceDiagram
    participant W as Web App
    participant WB as WebBridge
    participant WV as WebView
    participant MB as MobileBridge
    participant CM as CartManager

    W->>WB: sendToNative('cartUpdated', data)
    WB->>WV: window.ReactNativeWebView.postMessage()
    WV->>MB: onMessage event
    MB->>MB: handleMessage('cartUpdated')
    MB->>CM: update cart state
    CM->>WV: notify listeners
    WV-->>W: UI updates
```

### Native → Web

```mermaid
sequenceDiagram
    participant N as Native Component
    participant MB as MobileBridge
    participant WV as WebView
    participant WB as WebBridge
    participant W as Web App

    N->>MB: call handler
    MB->>WV: injectJavaScript()
    WV->>WB: window.handleMobileBridgeMessage()
    WB->>W: execute callback
    W-->>WB: return result
    WB-->>WV: resolve promise
    WV-->>MB: receive response
```

## Estrutura de Pastas

```
MobileBridgeTemplate_RN82/
├── App.tsx                      # Standalone app
├── App.Embedded.tsx             # Embedded WebView with TabBar
├── App.TestHost.tsx             # Host app demo
├── src/
│   ├── bridge/
│   │   └── MobileBridge.ts      # Bridge communication
│   ├── components/
│   │   ├── TabBar.tsx           # Native bottom navigation
│   │   ├── TurboWebView.tsx     # WebView wrapper
│   │   ├── ErrorBoundary.tsx    # Error handling
│   │   ├── NetworkStatusIndicator.tsx
│   │   └── Toast.tsx            # Native toast notifications
│   ├── screens/
│   │   ├── LoginScreen.tsx      # Native login screen
│   │   ├── HomeScreen.tsx       # Native home screen
│   │   ├── ProfileScreen.tsx    # Native profile screen
│   │   └── SettingsScreen.tsx   # Native settings screen
│   ├── services/
│   │   ├── AuthService.ts       # Authentication service
│   │   ├── NotificationService.ts
│   │   ├── PushNotificationService.ts
│   │   ├── AnalyticsService.ts
│   │   └── ErrorLogger.ts
│   ├── storage/
│   │   ├── SecureStorage.ts     # Encrypted storage
│   │   └── OfflineStorage.ts    # Offline data cache
│   ├── store/
│   │   ├── CartManager.ts       # Cart state manager
│   │   └── WishlistManager.ts   # Wishlist manager
│   ├── network/
│   │   └── NetworkManager.ts    # Network connectivity
│   ├── sync/
│   │   └── SyncManager.ts       # Data synchronization
│   └── utils/
│       ├── BridgeSecurity.ts    # Security utilities
│       ├── JWTGenerator.ts      # JWT token generation
│       └── Logger.ts            # Logging utility
├── android/                     # Android native code
└── ios/                         # iOS native code
```

## Padrões de Design

### 1. Singleton Pattern
Usado em CartManager, WishlistManager, e Services para garantir instância única.

```typescript
class CartManager {
  private static instance: CartManager;

  static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }
    return CartManager.instance;
  }
}
```

### 2. Observer Pattern
Managers notificam listeners sobre mudanças de estado.

```typescript
subscribe(listener: (cart: CartItem[]) => void): () => void {
  this.listeners.push(listener);
  return () => {
    this.listeners = this.listeners.filter(l => l !== listener);
  };
}
```

### 3. Promise-based Communication
Toda comunicação bridge é assíncrona com promises.

```typescript
async function sendToNative(type: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const messageId = generateId();
    pendingMessages.set(messageId, { resolve, reject });
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ messageId, type, payload })
    );
  });
}
```

## Segurança

### Autenticação JWT
```mermaid
sequenceDiagram
    participant U as User
    participant L as LoginScreen
    participant A as AuthService
    participant S as SecureStorage

    U->>L: Enter credentials
    L->>A: loginWithEmail(email, password)
    A->>A: Validate credentials
    A->>A: Generate JWT tokens
    A->>S: Store user + tokens
    A-->>L: Return user
    L-->>U: Navigate to app
```

### Armazenamento Seguro
- Tokens JWT armazenados em AsyncStorage criptografado
- Expiração de token: 1 minuto (testing) / 24 horas (production)
- Refresh token: 7 dias
- Logout automático em caso de token expirado

### Validação de Mensagens Bridge
```typescript
// Validação de tipo e payload
if (!message.type || !message.messageId) {
  throw new Error('Invalid message format');
}

// Timeout para evitar promises pendentes infinitas
setTimeout(() => {
  reject(new Error('Message timeout'));
}, 30000);
```

## Performance

### Otimizações Implementadas

1. **TurboWebView**: Cache de WebView para reuso
2. **Lazy Loading**: Componentes carregados sob demanda
3. **Debounce**: Updates de carrinho debounced
4. **Memoization**: useCallback e useMemo em componentes críticos
5. **AsyncStorage**: Persistência de estado offline

### Métricas

```mermaid
graph LR
    A[WebView Load] -->|< 2s| B[First Contentful Paint]
    B -->|< 500ms| C[Bridge Ready]
    C -->|< 100ms| D[First Interaction]

    style A fill:#e03131
    style D fill:#10b981
```

## Testes

### Estrutura de Testes
```
__tests__/
├── NetworkManager.test.ts
├── OfflineStorage.test.ts
└── SyncManager.test.ts
```

### Comandos
```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report
```

## Build e Deploy

### Android
```bash
npm run android:build:debug
npm run android:build:release
```

### iOS
```bash
npm run ios:build:debug
npm run ios:build:release
```

## Troubleshooting

### Problema: Token Expired Errors
**Solução**: AuthService faz logout silencioso quando token expira

### Problema: Cart Counter Reset
**Solução**: WebView é a fonte de verdade, usa `lastValidCartCount` como fallback

### Problema: Bridge Communication Fails
**Solução**: Verifica se `window.WebBridge` está disponível antes de enviar mensagens

## Sugestões de Novas Features

- [ ] Implementar refresh automático de tokens
- [ ] Adicionar suporte a Deep Links
- [ ] Integrar Firebase Analytics
- [ ] Implementar Code Push para updates OTA
- [ ] Adicionar testes E2E com Detox
- [ ] Suporte a modo offline completo
