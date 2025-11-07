# Arquitetura do Mobile Bridge Skeleton

Este documento explica a arquitetura e os conceitos fundamentais implementados neste skeleton.

## 📐 Visão Geral da Arquitetura

```mermaid
graph TB
    subgraph RN["React Native App"]
        NM[Network Manager]
        SM[Sync Manager]
        MB[Mobile Bridge]
        NI[NetInfo]
        OS[Offline Storage]
        SEC[Security Utils]
        TWV[TurboWebView]

        NM <--> NI
        NM --> SM
        SM --> MB
        SM <--> OS
        MB <--> SEC
        MB <--> TWV
    end

    subgraph WEB["Web Application"]
        WB[WebBridge JavaScript]
        WBF1[send]
        WBF2[handleNativeResponse]
        WBF3[Event listeners]
        WAL[Your Web App Logic]

        WB --> WBF1
        WB --> WBF2
        WB --> WBF3
        WAL --> WB
    end

    TWV <--> WB

    style RN fill:#e1f5ff
    style WEB fill:#fff4e1
    style MB fill:#4CAF50,color:#fff
    style WB fill:#FF9800,color:#fff
```

## 🔄 Fluxo de Comunicação

### 1. Web → Native

```javascript
// Web App
const result = await window.WebBridge.send('showNotification', {
  title: 'Hello',
  message: 'World'
});
```

```mermaid
sequenceDiagram
    participant WB as Web Bridge
    participant WV as WebView
    participant NH as Native Handler

    WB->>WV: postMessage(JSON)
    WV->>NH: onMessage(JSON)
    NH-->>WV: Response
    WV-->>WB: handleNativeResponse()
```

### 2. Native → Web

```typescript
// Native
await MobileBridge.sendToWeb(webViewRef, 'dataUpdate', { data: 'new' });
```

```mermaid
sequenceDiagram
    participant NB as Native Bridge
    participant WV as WebView
    participant WB as Web Bridge

    NB->>WV: injectJavaScript()
    WV->>WB: Event Handler
    WB-->>NB: Acknowledgment
```

## 🏗️ Componentes Principais

### 1. Mobile Bridge (`src/bridge/MobileBridge.ts`)

**Responsabilidade**: Gerenciar comunicação bidirecional entre Native e Web

**Features**:
- Registro de handlers
- Validação de mensagens
- Sistema de callbacks
- Timeout handling
- Security integration

**API**:
```typescript
// Registrar handler
MobileBridge.registerHandler(type: string, handler: Function);

// Enviar para web
MobileBridge.sendToWeb(webViewRef, type: string, payload: any);

// Processar mensagem
MobileBridge.handleMessage(message: BridgeMessage);
```

### 2. Bridge Security (`src/utils/BridgeSecurity.ts`)

**Responsabilidade**: Garantir segurança na comunicação

**Features**:
- Message validation
- Signature verification
- Timestamp validation (replay attack protection)
- Rate limiting (DDoS protection)
- XSS sanitization
- URL validation

**Camadas de Segurança**:
1. **Structural Validation**: Verifica estrutura da mensagem
2. **Timestamp Validation**: Mensagens expiram em 5 minutos
3. **Signature Verification**: HMAC-based integrity check
4. **Rate Limiting**: Max 100 req/min por tipo
5. **Sanitization**: Escape de caracteres perigosos

### 3. Offline Storage (`src/storage/OfflineStorage.ts`)

**Responsabilidade**: Persistência e cache de dados

**Features**:
- Cache com expiração
- Fila de ações pendentes
- Retry mechanism
- Statistics e monitoring
- Auto-cleanup

**API**:
```typescript
// Cache
await OfflineStorage.cacheData(key, data, expiresIn);
const data = await OfflineStorage.getCachedData(key);

// Queue
await OfflineStorage.queueAction(type, payload);
const pending = await OfflineStorage.getPendingActions();
```

### 4. Network Manager (`src/network/NetworkManager.ts`)

**Responsabilidade**: Monitorar conectividade

**Features**:
- Real-time network detection
- Status listeners
- Connection waiting
- Offline/online events

**Eventos**:
- `onConnected`: Quando conecta
- `onDisconnected`: Quando desconecta

### 5. Sync Manager (`src/sync/SyncManager.ts`)

**Responsabilidade**: Sincronização de dados offline

**Features**:
- Auto-sync quando volta online
- Retry logic com backoff
- Execute with offline support
- Sync callbacks

**Fluxo**:
```mermaid
flowchart TD
    A[Action] --> B{Check Network}
    B -->|Online| C[Execute]
    B -->|Offline| D[Queue]
    C --> E[Cache]
    D --> F[Wait]
    F --> G[Online Event]
    G --> H[Sync All]

    style B fill:#FFE082
    style C fill:#81C784
    style D fill:#FF8A65
```

### 6. Secure Storage (`src/storage/SecureStorage.ts`)

**Responsabilidade**: Armazenamento seguro de dados sensíveis

**Features**:
- Encrypted storage (opcional)
- Fallback para AsyncStorage
- Object serialization

**Uso**:
```typescript
// Simples
await SecureStorage.setItem('token', 'abc123');
const token = await SecureStorage.getItem('token');

// Objetos
await SecureStorage.setObject('user', { id: 1, name: 'John' });
const user = await SecureStorage.getObject('user');
```

## 🔐 Camadas de Segurança

```mermaid
flowchart TD
    A[Incoming Message] --> B[Layer 1: Transport Security]
    B --> C{HTTPS?}
    C -->|No| D[Reject]
    C -->|Yes| E[Layer 2: Message Security]
    E --> F{Valid Structure?}
    F -->|No| D
    F -->|Yes| G{Valid Signature?}
    G -->|No| D
    G -->|Yes| H[Layer 3: Rate Limiting]
    H --> I{Within Limit?}
    I -->|No| D
    I -->|Yes| J[Layer 4: Validation]
    J --> K{Valid Timestamp?}
    K -->|No| D
    K -->|Yes| L{Required Fields?}
    L -->|No| D
    L -->|Yes| M[Layer 5: Sanitization]
    M --> N[Sanitize Payload]
    N --> O[Execute Handler]

    style A fill:#E3F2FD
    style D fill:#FFCDD2
    style O fill:#C8E6C9
    style C fill:#FFE082
    style G fill:#FFE082
    style I fill:#FFE082
    style K fill:#FFE082
    style L fill:#FFE082
```

### Layer 1: Transport Security
- HTTPS obrigatório em produção
- Certificate pinning (recomendado)

### Layer 2: Message Security
```typescript
Message = {
  id: unique_id,
  type: 'action',
  payload: data,
  timestamp: now,
  signature: HMAC(SECRET + data + SECRET)
}
```

### Layer 3: Rate Limiting
- Max 100 requests per minute per message type
- Sliding window algorithm

### Layer 4: Validation
1. Check required fields (id, type)
2. Validate timestamp (max 5 min old)
3. Verify signature
4. Check rate limit
5. Execute handler

### Layer 5: Sanitization
- Escape special chars
- Validate URLs
- Prevent XSS
- Prevent injection

## 💾 Offline First Strategy

### Cache-First Pattern
```mermaid
flowchart LR
    A[Request] --> B{Cache Hit?}
    B -->|Yes| C[Return Cached]
    B -->|No| D[Fetch Network]
    D --> E[Update Cache]
    E --> F[Return Fresh]

    style B fill:#FFE082
    style C fill:#81C784
    style D fill:#64B5F6
```

### Queue Pattern
```mermaid
flowchart TD
    A[Action Requested] --> B{Online?}
    B -->|Yes| C[Execute Immediately]
    B -->|No| D[Queue Action]
    D --> E[Wait for Connection]
    E --> F[Network Connected]
    F --> G[Sync Queue]
    G --> H{Retry < 3?}
    H -->|Yes| I[Execute]
    H -->|No| J[Discard]
    I --> K{Success?}
    K -->|Yes| L[Clear from Queue]
    K -->|No| G

    style B fill:#FFE082
    style H fill:#FFE082
    style K fill:#FFE082
    style C fill:#81C784
    style L fill:#81C784
```

### Cache Invalidation
```mermaid
flowchart TD
    A[Cache Item] --> B{Age > 24h?}
    B -->|Yes| C[Mark as Expired]
    B -->|No| D{Manual Invalidate?}
    D -->|Yes| C
    D -->|No| E[Keep in Cache]
    C --> F[Auto-cleanup Job]
    F --> G[Remove Expired]

    style B fill:#FFE082
    style D fill:#FFE082
    style C fill:#FF8A65
    style G fill:#FF8A65
```

## 🎯 Padrões de Design

```mermaid
classDiagram
    class NetworkManager {
        -instance: NetworkManager
        +getInstance()
        +addListener()
        +removeListener()
        <<Singleton>>
    }

    class SyncManager {
        -instance: SyncManager
        +getInstance()
        +addSyncCallback()
        <<Singleton>>
    }

    class OfflineStorage {
        -instance: OfflineStorage
        +getInstance()
        +cacheData()
        +queueAction()
        <<Singleton>>
    }

    class SecureStorage {
        +setItem()
        +getItem()
        <<Strategy>>
    }

    class EncryptedStorage {
        +setItem()
        +getItem()
    }

    class AsyncStorage {
        +setItem()
        +getItem()
    }

    class MobileBridge {
        +registerHandler()
        +handleMessage()
        +sendToWeb()
        <<Promise Pattern>>
    }

    SecureStorage --> EncryptedStorage : uses
    SecureStorage --> AsyncStorage : fallback
    NetworkManager --> SyncManager : notifies
    SyncManager --> OfflineStorage : uses

    note for NetworkManager "Observer Pattern: Notifica listeners sobre mudanças de rede"
    note for SecureStorage "Strategy Pattern: Escolhe storage baseado em disponibilidade"
    note for MobileBridge "Promise Pattern: Todas operações são async"
```

### 1. Singleton Pattern
```typescript
// NetworkManager, SyncManager, OfflineStorage são singletons
class Manager {
  private static instance: Manager;
  static getInstance() {
    if (!this.instance) this.instance = new Manager();
    return this.instance;
  }
}
```

### 2. Observer Pattern
```typescript
// Listeners para eventos de rede e sincronização
NetworkManager.addListener((isOnline) => { ... });
SyncManager.addSyncCallback((success, count) => { ... });
```

### 3. Strategy Pattern
```typescript
// Diferentes estratégias de storage
SecureStorage.setItem() // Uses EncryptedStorage or AsyncStorage
```

### 4. Promise Pattern
```typescript
// Todas as operações assíncronas retornam Promises
await MobileBridge.sendToWeb(ref, 'action', data);
```

## 📊 Fluxo de Dados

### Online Flow
```mermaid
flowchart TD
    A[Web Request] --> B[Mobile Bridge]
    B --> C[Handler Execution]
    C --> D[Cache Update]
    D --> E[Response to Web]

    style B fill:#4CAF50,color:#fff
    style C fill:#2196F3,color:#fff
    style E fill:#81C784
```

### Offline Flow
```mermaid
flowchart TD
    A[Web Request] --> B[Mobile Bridge]
    B --> C[Offline Detection]
    C --> D[Queue Action]
    D --> E{Cached Data?}
    E -->|Yes| F[Return Cached]
    E -->|No| G[Return Error]
    H[Network Connected] --> I[Auto Sync Queue]
    I --> J[Execute Actions]
    J --> K[Update Cache]

    style B fill:#4CAF50,color:#fff
    style C fill:#FF9800,color:#fff
    style D fill:#FF8A65
    style I fill:#81C784
```

## 🔄 Lifecycle

### App Initialization
```mermaid
flowchart TD
    A[App.tsx mounts] --> B[Initialize NetworkManager]
    B --> C[Initialize SyncManager]
    C --> D[Register Bridge handlers]
    D --> E[Render WebView]
    E --> F[WebView loads]
    F --> G[Inject WebBridge script]
    G --> H[Ready for communication]

    style A fill:#E3F2FD
    style H fill:#81C784
```

### App Cleanup
```mermaid
flowchart TD
    A[Component unmounts] --> B[NetworkManager.cleanup]
    B --> C[SyncManager.cleanup]
    C --> D[MobileBridge.clear]
    D --> E[Clear all listeners]
    E --> F[Clear all timeouts]
    F --> G[Cleanup complete]

    style A fill:#FFEBEE
    style G fill:#81C784
```

## 🧪 Testing Strategy

### Unit Tests
- MobileBridge message handling
- Security validation
- Storage operations
- Network detection

### Integration Tests
- Web ↔ Native communication
- Offline sync flow
- Cache invalidation
- Error handling

### E2E Tests
- Full user flows
- Offline scenarios
- Security edge cases

## 🚀 Performance Optimizations

### 1. Message Batching
```typescript
// Batch multiple messages to reduce overhead
const results = await Promise.all([
  MobileBridge.handleMessage(msg1),
  MobileBridge.handleMessage(msg2)
]);
```

### 2. Lazy Loading
```typescript
// Load WebView only when needed
{isWebViewNeeded && <TurboWebView ... />}
```

### 3. Cache Optimization
```typescript
// Use short TTL for frequently changing data
await OfflineStorage.cacheData('key', data, 60000); // 1 min
```

### 4. Memory Management
```typescript
// Clear old callbacks to prevent leaks
MobileBridge.clear();
```

## 📈 Monitoring & Debugging

### Logs
```typescript
console.log('[Bridge] Message received:', message);
console.log('[Sync] Synced actions:', count);
console.log('[Network] Status changed:', isOnline);
```

### Statistics
```typescript
// Cache stats
const stats = await OfflineStorage.getCacheStats();
console.log('Cache size:', stats.totalSize);

// Queue stats
const queueStats = await OfflineStorage.getQueueStats();
console.log('Pending actions:', queueStats.totalActions);
```

### Error Tracking
```typescript
try {
  await MobileBridge.handleMessage(message);
} catch (error) {
  ErrorLogger.log(error);
}
```

## 🔧 Extensibility

### Adding New Handlers
```typescript
MobileBridge.registerHandler('newAction', async (payload) => {
  // Your logic
  return { success: true, data: result };
});
```

### Custom Storage
```typescript
class CustomStorage extends OfflineStorage {
  // Override methods
}
```

### Custom Security
```typescript
class CustomSecurity extends BridgeSecurity {
  // Add custom validation
}
```

## 🎓 Best Practices

1. **Always validate input**: Never trust data from WebView
2. **Use TypeScript**: Type safety prevents many bugs
3. **Handle errors gracefully**: Never crash the app
4. **Log important events**: Makes debugging easier
5. **Test offline scenarios**: Ensure data integrity
6. **Monitor performance**: Watch memory and CPU usage
7. **Version your APIs**: Add version to messages
8. **Document handlers**: Clear documentation for each handler
9. **Use constants**: Avoid magic strings
10. **Clean up resources**: Always cleanup in useEffect

## 📚 References

- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [Offline First](https://offlinefirst.org/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
