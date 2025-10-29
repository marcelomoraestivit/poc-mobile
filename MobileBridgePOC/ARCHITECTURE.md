# Arquitetura Mobile Bridge

Este documento detalha a arquitetura do projeto Mobile Bridge E-Commerce POC.

## Índice

- [Visão Geral](#visão-geral)
- [Camadas da Aplicação](#camadas-da-aplicação)
- [Mobile Bridge](#mobile-bridge)
- [Fluxo de Dados](#fluxo-de-dados)
- [Componentes Principais](#componentes-principais)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [Offline-First](#offline-first)
- [Decisões de Design](#decisões-de-design)

## Visão Geral

A arquitetura segue o padrão **Mobile Bridge**, que combina o melhor de dois mundos:

1. **Web Layer** - Interface rica e ágil em React
2. **Native Layer** - Recursos nativos e performance
3. **Bridge Layer** - Comunicação bidirecional

```
┌──────────────────────────────────────────────────────┐
│                   USER INTERFACE                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │           React Web Application                │  │
│  │              (shopapp-web)                     │  │
│  │                                                │  │
│  │  • Component-based UI (Mantine)               │  │
│  │  • Client-side routing (React Router)         │  │
│  │  • State management (Context API)             │  │
│  │  • SVG placeholder images                     │  │
│  └────────────────────────────────────────────────┘  │
│                         ↕                             │
│              Mobile Bridge Protocol                   │
│         (Bidirectional JSON Messages)                 │
│                         ↕                             │
│  ┌────────────────────────────────────────────────┐  │
│  │         TurboWebView (Enhanced WebView)        │  │
│  │                                                │  │
│  │  • JavaScript injection                        │  │
│  │  • Message passing                             │  │
│  │  • Event handling                              │  │
│  │  • Network detection                           │  │
│  └────────────────────────────────────────────────┘  │
│                         ↕                             │
│  ┌────────────────────────────────────────────────┐  │
│  │            Native Components Layer             │  │
│  │                                                │  │
│  │  TabBar  •  Toast  •  NetworkIndicator        │  │
│  └────────────────────────────────────────────────┘  │
│                         ↕                             │
│  ┌────────────────────────────────────────────────┐  │
│  │             Business Logic Layer               │  │
│  │                                                │  │
│  │  CartManager  •  WishlistManager               │  │
│  │  NetworkManager  •  SyncManager                │  │
│  │  OfflineStorage  •  NotificationService        │  │
│  └────────────────────────────────────────────────┘  │
│                         ↕                             │
│  ┌────────────────────────────────────────────────┐  │
│  │              Data Persistence                  │  │
│  │                                                │  │
│  │  AsyncStorage  •  Network Cache                │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Camadas da Aplicação

### 1. Web Application Layer

**Responsabilidades:**
- Renderizar interface do usuário
- Gerenciar navegação (React Router)
- Processar interações do usuário
- Comunicar com camada nativa via Bridge

**Tecnologias:**
- React 18 com TypeScript
- Vite (build tool)
- Mantine UI (componentes)
- React Router (navegação)

**Estrutura:**
```
shopapp-web/src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes reutilizáveis
├── context/         # Context API (estado global)
├── utils/           # Utilitários (notifications, images)
└── data/            # Mock data
```

### 2. Bridge Layer

**Responsabilidades:**
- Estabelecer canal de comunicação Web ↔ Native
- Serializar/deserializar mensagens JSON
- Gerenciar callbacks e promises
- Injetar APIs JavaScript no WebView

**Componentes:**
```typescript
// Native Side (MobileBridge.ts)
class MobileBridge {
  handlers: Map<string, Handler>
  pendingResponses: Map<string, Callback>

  registerHandler(type, handler)
  handleMessage(message)
  handleResponse(response)
}

// Web Side (Injected JavaScript)
window.WebBridge = {
  sendToNative(type, payload): Promise
  handleNativeResponse(response)
  emit(event, data)
}
```

### 3. Native Components Layer

**Componentes:**

**TabBar**
- Navegação inferior nativa
- Sincroniza com estado da web
- Badges (ex: contador de carrinho)

**Toast**
- Notificações nativas animadas
- 4 tipos: success, error, info, warning
- Auto-dismiss configurável

**NetworkStatusIndicator**
- Banner de status online/offline
- Monitora conectividade em tempo real
- Notifica web app sobre mudanças

**TurboWebView**
- WebView enhanced com bridge
- Injection de JavaScript
- Event handlers
- Cache e performance

### 4. Business Logic Layer

**CartManager**
```typescript
class CartManager {
  private items: CartItem[]
  private subscribers: Callback[]

  addItem(product, quantity, color, size)
  removeItem(productId, color, size)
  updateQuantity(productId, quantity)
  getItems(): CartItem[]
  getTotal(): number
  subscribe(callback): Unsubscribe
}
```

**WishlistManager**
```typescript
class WishlistManager {
  private items: Product[]
  private subscribers: Callback[]

  toggleItem(product): boolean
  hasItem(productId): boolean
  getItems(): Product[]
  subscribe(callback): Unsubscribe
}
```

**NetworkManager**
```typescript
class NetworkManager {
  isConnected(): boolean
  initialize()
  onStatusChange(callback)
  cleanup()
}
```

**SyncManager**
```typescript
class SyncManager {
  executeWithOffline(action, payload, executor, options)
  syncPendingActions()
  getPendingActions()
}
```

## Mobile Bridge

### Protocolo de Comunicação

#### Formato de Mensagem

```typescript
// Web → Native
interface BridgeMessage {
  id: string          // Único identificador
  type: string        // Tipo de ação
  payload: any        // Dados da ação
}

// Native → Web
interface BridgeResponse {
  id: string          // Mesmo ID da mensagem
  success: boolean    // Status
  data?: any          // Dados de resposta
  error?: string      // Mensagem de erro
}
```

#### Exemplo de Comunicação

```javascript
// 1. Web envia mensagem
const message = {
  id: 'web_123',
  type: 'addToCart',
  payload: {
    product: { id: 'prod1', name: 'Phone', price: 999 },
    quantity: 2
  }
}
window.ReactNativeWebView.postMessage(JSON.stringify(message))

// 2. Native recebe e processa
bridge.handleMessage(message) // → executa handler

// 3. Native responde
const response = {
  id: 'web_123',
  success: true,
  data: { itemsCount: 3, total: 2997 }
}
webView.injectJavaScript(`
  window.WebBridge.handleNativeResponse(${JSON.stringify(response)})
`)

// 4. Web recebe resposta
// Promise resolve com data
```

### Handlers Registrados

| Handler | Descrição | Payload | Response |
|---------|-----------|---------|----------|
| `navigate` | Navegar para página | `{ page, params }` | `{ success }` |
| `addToCart` | Adicionar ao carrinho | `{ product, quantity, color, size }` | `{ success }` |
| `getCart` | Obter carrinho | `{}` | `{ items, count, total }` |
| `toggleWishlist` | Toggle favorito | `{ product }` | `{ inWishlist }` |
| `createOrder` | Criar pedido | `{ address, payment }` | `{ success, orderId }` |
| `showNotification` | Notificação nativa | `{ title, message, color }` | `{ success }` |

### Eventos Native → Web

```javascript
// Native dispara evento
window.dispatchEvent(new CustomEvent('cartUpdated', {
  detail: { items, count, total }
}))

// Web escuta evento
window.addEventListener('cartUpdated', (e) => {
  updateUIWithNewCart(e.detail)
})
```

## Fluxo de Dados

### Adicionar Produto ao Carrinho

```
┌─────────┐     1. Click      ┌──────────┐
│  User   │ ────────────────> │ Web UI   │
└─────────┘                   └──────────┘
                                    │
                              2. sendToNative()
                                    │
                                    ↓
                            ┌───────────────┐
                            │ Mobile Bridge │
                            └───────────────┘
                                    │
                            3. handleMessage()
                                    │
                                    ↓
                            ┌───────────────┐
                            │ CartManager   │
                            │  .addItem()   │
                            └───────────────┘
                                    │
                            4. Save to storage
                                    │
                                    ↓
                            ┌───────────────┐
                            │ AsyncStorage  │
                            └───────────────┘
                                    │
                            5. Notify subscribers
                                    │
                                    ↓
                            ┌───────────────┐
                            │ Web App       │
                            │ (via event)   │
                            └───────────────┘
                                    │
                            6. Update UI (badge)
                                    │
                                    ↓
                            ┌───────────────┐
                            │ User sees     │
                            │ updated count │
                            └───────────────┘
```

### Sincronização Offline

```
┌──────────────┐
│ User Action  │ (sem internet)
└──────────────┘
       │
       ↓
┌──────────────────┐
│ SyncManager      │
│ detecta offline  │
└──────────────────┘
       │
       ↓
┌──────────────────┐
│ OfflineStorage   │
│ armazena ação    │
└──────────────────┘
       │
       ↓
┌──────────────────┐
│ Aguarda conexão  │
└──────────────────┘
       │
(internet volta)
       │
       ↓
┌──────────────────┐
│ NetworkManager   │
│ detecta online   │
└──────────────────┘
       │
       ↓
┌──────────────────┐
│ SyncManager      │
│ sincroniza fila  │
└──────────────────┘
       │
       ↓
┌──────────────────┐
│ Ações executadas │
│ Storage limpo    │
└──────────────────┘
```

## Componentes Principais

### TurboWebView

Componente central que encapsula o WebView e gerencia o bridge.

**Responsabilidades:**
- Injetar JavaScript bridge
- Processar mensagens do web app
- Enviar respostas para web app
- Gerenciar lifecycle do WebView
- Cache e performance

**Código Simplificado:**
```typescript
const TurboWebView = ({ source, onMessage }) => {
  const injectedJavaScript = `
    window.WebBridge = {
      sendToNative(type, payload) {
        return new Promise((resolve, reject) => {
          const id = 'web_' + messageId++
          pendingCallbacks.set(id, { resolve, reject })
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ id, type, payload })
          )
        })
      },
      handleNativeResponse(response) {
        const callback = pendingCallbacks.get(response.id)
        if (callback) {
          response.success
            ? callback.resolve(response.data)
            : callback.reject(response.error)
        }
      }
    }
  `

  return (
    <WebView
      source={source}
      injectedJavaScript={injectedJavaScript}
      onMessage={(event) => {
        const message = JSON.parse(event.nativeEvent.data)
        const response = await MobileBridge.handleMessage(message)
        webViewRef.injectJavaScript(`
          window.WebBridge.handleNativeResponse(${JSON.stringify(response)})
        `)
      }}
    />
  )
}
```

### CartManager (Singleton)

Gerencia estado do carrinho com persistência.

**Features:**
- Singleton pattern
- Observer pattern (subscribers)
- Persistência com AsyncStorage
- Cálculos de total, subtotal, desconto

**Código Simplificado:**
```typescript
class CartManager {
  private static instance: CartManager
  private items: CartItem[] = []
  private subscribers: Set<Callback> = new Set()

  static getInstance() {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager()
      CartManager.instance.loadFromStorage()
    }
    return CartManager.instance
  }

  async addItem(product, quantity, color, size) {
    const existingIndex = this.items.findIndex(...)

    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += quantity
    } else {
      this.items.push({ product, quantity, color, size })
    }

    await this.saveToStorage()
    this.notifySubscribers()
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers() {
    this.subscribers.forEach(cb => cb())
  }
}
```

## Gerenciamento de Estado

### Estado Web (React Context)

```typescript
// ShopContext.tsx
const ShopContext = createContext<ShopContextType>({
  cart: [],
  wishlist: [],
  addToCart: () => {},
  toggleWishlist: () => {},
  ...
})

// Sincroniza com estado nativo
useEffect(() => {
  // Obter estado inicial do nativo
  window.WebBridge.sendToNative('getCart', {})
    .then(setCart)

  // Escutar atualizações
  window.addEventListener('cartUpdated', (e) => {
    setCart(e.detail.items)
  })
}, [])
```

### Estado Nativo (Managers)

- **CartManager**: Carrinho de compras
- **WishlistManager**: Lista de desejos
- **NetworkManager**: Status de rede

Todos usam:
- Singleton pattern
- Observer pattern
- AsyncStorage para persistência

## Offline-First

### Estratégia

1. **Detecção**: NetworkManager monitora conectividade
2. **Armazenamento**: Ações offline vão para fila
3. **Execução**: SyncManager executa quando online
4. **Cache**: Dados críticos em AsyncStorage

### Fluxo Offline

```typescript
// SyncManager.executeWithOffline
async executeWithOffline(action, payload, executor, options) {
  const isOnline = NetworkManager.isConnected()

  if (isOnline) {
    // Executar diretamente
    return await executor(payload)
  } else {
    // Armazenar para depois
    await OfflineStorage.queueAction({
      action,
      payload,
      timestamp: Date.now()
    })

    // Executar localmente (se possível)
    if (options.localFallback) {
      return await options.localFallback(payload)
    }
  }
}

// Quando voltar online
async syncPendingActions() {
  const actions = await OfflineStorage.getPendingActions()

  for (const action of actions) {
    try {
      await this.executeAction(action)
      await OfflineStorage.removeAction(action.id)
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }
}
```

## Decisões de Design

### Por que WebView e não React Native puro?

✅ **Agilidade**: Deploy web sem precisar publicar na loja
✅ **Compartilhamento**: Mesmo código para web e mobile
✅ **Manutenção**: Single codebase
✅ **Flexibilidade**: Fácil testar e iterar

### Por que não PWA?

✅ **Recursos Nativos**: Acesso total a APIs nativas
✅ **Performance**: Melhor controle sobre recursos
✅ **Distribuição**: Presença nas lojas de apps
✅ **UX**: Tab bar e notificações verdadeiramente nativas

### Por que Context API e não Redux?

✅ **Simplicidade**: Menos boilerplate
✅ **Performance**: Suficiente para esse escopo
✅ **Bundle**: Menor tamanho
✅ **Native State**: Estado crítico no nativo

### Por que SVG Placeholders?

✅ **Offline**: Funciona sem internet
✅ **Performance**: Instantâneo, sem downloads
✅ **Tamanho**: SVG é leve
✅ **WebView**: Data URLs funcionam perfeitamente

## Extensibilidade

### Adicionar Novo Handler

```typescript
// 1. No MobileBridge.ts
bridge.registerHandler('myNewAction', async (payload) => {
  // Processar
  return { success: true, data: result }
})

// 2. No TypeScript (web)
declare global {
  interface Window {
    WebBridge: {
      sendToNative(
        type: 'myNewAction',
        payload: MyPayload
      ): Promise<MyResponse>
    }
  }
}

// 3. Usar no web app
const result = await window.WebBridge.sendToNative('myNewAction', {
  param1: 'value'
})
```

### Adicionar Novo Manager

```typescript
// 1. Criar manager
export class MyManager {
  private static instance: MyManager

  static getInstance() { ... }

  async doSomething() { ... }
}

// 2. Registrar no App.tsx
useEffect(() => {
  const myManager = MyManager.getInstance()

  bridge.registerHandler('myAction', (payload) => {
    return myManager.doSomething(payload)
  })
}, [])
```

## Performance

### Otimizações Implementadas

1. **Cache de Imagens**: SVG data URLs
2. **Lazy Loading**: Componentes web
3. **Debounce**: Sincronização
4. **Memoization**: Componentes React
5. **AsyncStorage**: Persistência rápida
6. **WebView Cache**: Cache nativo ativado

### Métricas

- **Tempo de Carregamento**: < 2s
- **Tempo de Resposta Bridge**: < 50ms
- **Bundle Web**: ~500KB (gzipped)
- **Native Bundle**: ~15MB (release)

---

**Última atualização**: 2025-01-25
