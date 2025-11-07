# Estrutura do Projeto

Este documento explica a estrutura de arquivos e pastas do Mobile Bridge Skeleton.

## 📁 Estrutura Completa

```
MobileBridge-Skeleton/
│
├── src/                           # Código fonte principal
│   ├── bridge/                    # Mobile Bridge Core
│   │   └── MobileBridge.ts       # Gerenciamento de mensagens e handlers
│   │
│   ├── utils/                     # Utilitários
│   │   └── BridgeSecurity.ts     # Segurança, validação, sanitização
│   │
│   ├── storage/                   # Camada de persistência
│   │   ├── OfflineStorage.ts     # Cache e fila de ações
│   │   └── SecureStorage.ts      # Armazenamento seguro/criptografado
│   │
│   ├── network/                   # Gerenciamento de rede
│   │   └── NetworkManager.ts     # Detecção de conectividade
│   │
│   ├── sync/                      # Sincronização
│   │   └── SyncManager.ts        # Sync de dados offline
│   │
│   └── components/                # Componentes React Native
│       ├── TurboWebView.tsx      # WebView otimizado
│       ├── NetworkStatusIndicator.tsx  # Indicador de status de rede
│       ├── ErrorBoundary.tsx     # Error boundary
│       └── Toast.tsx             # Notificação toast
│
├── App.tsx                        # Exemplo standalone
├── App.Embedded.tsx               # Exemplo embedded
├── index.js                       # Entry point
│
├── package.json                   # Dependências
├── tsconfig.json                  # Config TypeScript
├── babel.config.js                # Config Babel
├── metro.config.js                # Config Metro bundler
├── .eslintrc.js                   # Config ESLint
├── .prettierrc.js                 # Config Prettier
├── .gitignore                     # Git ignore
│
└── docs/                          # Documentação
    ├── README.md                  # Documentação principal
    ├── INTEGRATION_GUIDE.md       # Guia de integração
    ├── WEB_INTEGRATION.md         # Integração lado web
    ├── ARCHITECTURE.md            # Arquitetura
    ├── EXAMPLES.md                # Exemplos práticos
    └── PROJECT_STRUCTURE.md       # Este arquivo
```

## 📄 Descrição dos Arquivos

### Core Files

#### `src/bridge/MobileBridge.ts`
**O que faz**: Gerencia toda comunicação entre Native e Web
**Responsabilidades**:
- Registrar handlers para mensagens do web
- Processar mensagens recebidas do WebView
- Enviar mensagens para o WebView
- Gerenciar callbacks e timeouts
- Integrar com camada de segurança

**Principais métodos**:
```typescript
registerHandler(type: string, handler: Function)  // Registrar handler
handleMessage(message: BridgeMessage)             // Processar mensagem
sendToWeb(webViewRef, type, payload)              // Enviar para web
clear()                                           // Limpar handlers
```

**Quando modificar**:
- Adicionar novas features ao bridge
- Modificar timeout padrão
- Adicionar logging personalizado

---

#### `src/utils/BridgeSecurity.ts`
**O que faz**: Provê todas as camadas de segurança
**Responsabilidades**:
- Validar mensagens recebidas
- Verificar assinaturas (HMAC)
- Validar timestamps (replay attack protection)
- Rate limiting (DDoS protection)
- Sanitização XSS
- Validação de URLs

**Principais métodos**:
```typescript
validateMessage(message)                      // Validar mensagem
createSecureMessage(id, type, payload)        // Criar mensagem segura
checkRateLimit(identifier)                    // Verificar rate limit
sanitizeForInjection(obj)                     // Sanitizar para injeção JS
```

**Quando modificar**:
- Ajustar SECRET_KEY (produção)
- Modificar limites de rate limiting
- Adicionar validações customizadas
- Trocar simpleHash por crypto real

---

#### `src/storage/OfflineStorage.ts`
**O que faz**: Gerencia cache e fila de ações offline
**Responsabilidades**:
- Cache de dados com expiração
- Fila de ações pendentes
- Retry mechanism
- Estatísticas de uso
- Limpeza automática

**Principais métodos**:
```typescript
cacheData(key, data, expiresIn)       // Salvar no cache
getCachedData(key)                    // Recuperar do cache
queueAction(type, payload)            // Adicionar à fila
getPendingActions()                   // Obter ações pendentes
cleanExpiredCache()                   // Limpar cache expirado
```

**Quando modificar**:
- Ajustar MAX_CACHE_AGE (24h padrão)
- Modificar estratégia de expiração
- Adicionar novos métodos de cache

---

#### `src/storage/SecureStorage.ts`
**O que faz**: Wrapper para armazenamento seguro
**Responsabilidades**:
- Armazenamento criptografado (se disponível)
- Fallback para AsyncStorage
- Serialização de objetos
- Log de warnings

**Principais métodos**:
```typescript
setItem(key, value)                   // Salvar string
getItem(key)                          // Recuperar string
setObject(key, object)                // Salvar objeto
getObject(key)                        // Recuperar objeto
```

**Quando modificar**:
- Instalar react-native-encrypted-storage
- Adicionar validação de dados
- Implementar backup

---

#### `src/network/NetworkManager.ts`
**O que faz**: Monitora status de conectividade
**Responsabilidades**:
- Detectar mudanças de rede
- Notificar listeners
- Prover status atual
- Aguardar conexão

**Principais métodos**:
```typescript
initialize()                          // Inicializar monitoramento
isConnected()                         // Verificar se está online
addListener(callback)                 // Adicionar listener
waitForConnection(timeout)            // Aguardar conexão
```

**Quando modificar**:
- Adicionar métricas de rede
- Implementar reconnection logic
- Adicionar notificações

---

#### `src/sync/SyncManager.ts`
**O que faz**: Sincroniza dados quando volta online
**Responsabilidades**:
- Auto-sync quando conecta
- Executar ações com suporte offline
- Retry com backoff
- Callbacks de sync

**Principais métodos**:
```typescript
initialize()                          // Inicializar sync
executeWithOffline(action, executor)  // Executar com offline support
syncPendingActions()                  // Sincronizar fila
setAutoSync(enabled)                  // Ativar/desativar auto-sync
```

**Quando modificar**:
- Ajustar maxRetries (3 padrão)
- Modificar estratégia de sync
- Adicionar priorização de ações

---

### Components

#### `src/components/TurboWebView.tsx`
**O que faz**: WebView otimizado com configurações de segurança
**Features**:
- Cache habilitado
- JavaScript habilitado
- Third-party cookies desabilitados
- DOM storage habilitado
- Configurações de performance

**Quando usar**:
- Para renderizar conteúdo web
- Como base para tela principal

---

#### `src/components/NetworkStatusIndicator.tsx`
**O que faz**: Mostra status de rede visualmente
**Features**:
- Auto-detecta mudanças de rede
- Callback customizável
- UI minimalista

---

#### `src/components/ErrorBoundary.tsx`
**O que faz**: Captura erros React e previne crashes
**Features**:
- Captura erros de componentes filhos
- UI de erro amigável
- Log de erros

---

#### `src/components/Toast.tsx`
**O que faz**: Notificações toast nativas
**Features**:
- 4 tipos: success, error, info, warning
- Auto-dismiss
- Animações

---

### App Files

#### `App.tsx`
**Tipo**: Exemplo Standalone
**Use quando**:
- Criar app novo do zero
- App será 100% WebView
- Não precisa integrar com código nativo existente

**Features**:
- Inicialização completa dos serviços
- Handlers de exemplo
- Network status indicator
- Toast notifications

---

#### `App.Embedded.tsx`
**Tipo**: Exemplo Embedded
**Use quando**:
- Integrar em app React Native existente
- WebView é uma tela adicional
- Precisa de props de controle (isVisible, onBack)

**Features**:
- Props de controle
- Pode ser usado como screen em Navigator
- Mantém estado quando hidden

---

### Configuration Files

#### `package.json`
**Contém**:
- Dependências obrigatórias
- Scripts npm
- Metadata do projeto

**Dependências principais**:
- `react-native-webview`: WebView
- `@react-native-async-storage/async-storage`: Storage
- `@react-native-community/netinfo`: Network detection
- `react-native-safe-area-context`: Safe areas

---

#### `tsconfig.json`
**Contém**:
- Configurações TypeScript
- Paths de compilação
- Strict mode habilitado

---

#### `babel.config.js`
**Contém**:
- Preset React Native
- Configurações de transpilação

---

#### `metro.config.js`
**Contém**:
- Configurações do Metro bundler
- Cache settings
- Asset extensions

---

## 🎯 Fluxo de Dados

### 1. Web → Native

```
Web App
  ↓ (window.WebBridge.send)
WebView.postMessage()
  ↓
App.tsx onMessage
  ↓
MobileBridge.handleMessage()
  ↓ (valida com BridgeSecurity)
Registered Handler
  ↓
Response
  ↓
WebView.injectJavaScript()
  ↓
window.WebBridge.handleNativeResponse()
```

### 2. Offline Storage

```
Action Request
  ↓
Check Network
  ↓
Offline?
  ↓ Yes
OfflineStorage.queueAction()
  ↓
Wait for Connection
  ↓
SyncManager.syncPendingActions()
  ↓
Execute Actions
  ↓
Clear Queue
```

## 🔧 Como Estender

### Adicionar Novo Handler

1. Edite `App.tsx` ou `App.Embedded.tsx`
2. Adicione no useEffect:

```typescript
MobileBridge.registerHandler('myNewHandler', async (payload) => {
  // Sua lógica
  return { success: true, data: result };
});
```

### Adicionar Novo Componente

1. Crie em `src/components/`
2. Export do componente
3. Import e use no App

### Adicionar Nova Dependência

1. Instale: `npm install package-name`
2. Para iOS: `cd ios && pod install`
3. Documente no README

### Modificar Segurança

1. Edite `src/utils/BridgeSecurity.ts`
2. Ajuste validações
3. Atualize SECRET_KEY
4. Teste completamente

## 📊 Dependências Entre Módulos

```
App.tsx
  ↓ usa
MobileBridge
  ↓ usa
BridgeSecurity
  ↓ usa
NetworkManager ← SyncManager
  ↓ usa         ↓ usa
OfflineStorage ← SecureStorage
```

## 🧪 Testing Strategy

### Unit Tests
- `src/bridge/__tests__/MobileBridge.test.ts`
- `src/utils/__tests__/BridgeSecurity.test.ts`
- `src/storage/__tests__/OfflineStorage.test.ts`

### Integration Tests
- Web ↔ Native communication
- Offline sync flow

### E2E Tests
- Full user flows
- Offline scenarios

## 📝 Onde Procurar

**Para adicionar handler**: `App.tsx` ou `App.Embedded.tsx`

**Para modificar segurança**: `src/utils/BridgeSecurity.ts`

**Para ajustar cache**: `src/storage/OfflineStorage.ts`

**Para modificar sync**: `src/sync/SyncManager.ts`

**Para adicionar componente**: `src/components/`

**Para configurações**: Arquivos `.config.js` na raiz

## 🎓 Próximos Passos

1. Leia `README.md` para overview
2. Siga `INTEGRATION_GUIDE.md` para setup
3. Veja `EXAMPLES.md` para casos de uso
4. Consulte `ARCHITECTURE.md` para detalhes técnicos
5. Use `WEB_INTEGRATION.md` para lado web
