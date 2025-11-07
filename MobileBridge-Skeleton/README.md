# Mobile Bridge Skeleton

Esqueleto do Mobile Bridge com Offline First e Segurança para integração em projetos React Native existentes.

## 📋 Visão Geral

Este é um esqueleto minimalista que contém apenas os conceitos essenciais do Mobile Bridge:

- ✅ **Mobile Bridge** - Comunicação segura entre WebView e React Native
- ✅ **Offline First** - Armazenamento e sincronização automática
- ✅ **Segurança** - Validação de mensagens, rate limiting, sanitização
- ✅ **Network Management** - Detecção e monitoramento de conectividade
- ✅ **Componentes Essenciais** - TurboWebView, Toast, NetworkStatusIndicator

## 📦 O que está incluído

```
MobileBridge-Skeleton/
├── src/
│   ├── bridge/
│   │   └── MobileBridge.ts          # Core do Mobile Bridge
│   ├── utils/
│   │   └── BridgeSecurity.ts        # Segurança e validação
│   ├── storage/
│   │   ├── OfflineStorage.ts        # Cache e fila de ações
│   │   └── SecureStorage.ts         # Armazenamento seguro
│   ├── network/
│   │   └── NetworkManager.ts        # Gerenciamento de rede
│   ├── sync/
│   │   └── SyncManager.ts           # Sincronização offline
│   └── components/
│       ├── TurboWebView.tsx         # WebView otimizado
│       ├── NetworkStatusIndicator.tsx
│       ├── ErrorBoundary.tsx
│       └── Toast.tsx
├── App.tsx                          # Exemplo standalone
├── App.Embedded.tsx                 # Exemplo embedded
└── package.json
```

## 🚀 Como Integrar no Seu Projeto

### Opção 1: Copiar Arquivos Essenciais

1. Copie a pasta `src/` para o seu projeto:
```bash
cp -r MobileBridge-Skeleton/src/* seu-projeto/src/
```

2. Instale as dependências necessárias:
```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-webview
npm install react-native-safe-area-context
```

3. Use o exemplo `App.tsx` ou `App.Embedded.tsx` como referência para integração

### Opção 2: Integração em Projeto Existente

#### Passo 1: Instalar Dependências

```bash
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-webview
npm install react-native-safe-area-context
```

#### Passo 2: Copiar Módulos Essenciais

Copie para o seu projeto:
- `src/bridge/` - Mobile Bridge core
- `src/utils/` - Segurança
- `src/storage/` - Offline First
- `src/network/` - Network Manager
- `src/sync/` - Sync Manager
- `src/components/` - Componentes essenciais

#### Passo 3: Inicializar Serviços

```typescript
import NetworkManager from './src/network/NetworkManager';
import SyncManager from './src/sync/SyncManager';

// No componente principal
useEffect(() => {
  NetworkManager.initialize();
  SyncManager.initialize();

  return () => {
    NetworkManager.cleanup();
    SyncManager.cleanup();
  };
}, []);
```

#### Passo 4: Configurar Mobile Bridge Handlers

```typescript
import MobileBridge from './src/bridge/MobileBridge';

useEffect(() => {
  // Registrar handlers para sua aplicação
  MobileBridge.registerHandler('yourHandler', async (payload) => {
    // Sua lógica aqui
    return { success: true, data: 'result' };
  });

  return () => {
    MobileBridge.clear();
  };
}, []);
```

#### Passo 5: Integrar WebView

```typescript
import TurboWebView from './src/components/TurboWebView';

const handleMessage = useCallback(async (event: any) => {
  const message = JSON.parse(event.nativeEvent.data);
  const response = await MobileBridge.handleMessage(message);

  // Enviar resposta de volta
  if (webViewRef.current) {
    const script = `
      window.WebBridge.handleNativeResponse(${JSON.stringify(response)});
    `;
    webViewRef.current.injectJavaScript(script);
  }
}, []);

<TurboWebView
  ref={webViewRef}
  source={{ uri: 'https://your-web-app.com' }}
  onMessage={handleMessage}
/>
```

## 📱 Modos de Uso

### Modo Standalone (App.tsx)

Aplicação completa em WebView com lógica nativa.

```typescript
import App from './App';
```

### Modo Embedded (App.Embedded.tsx)

WebView incorporado em aplicação React Native existente.

```typescript
import AppEmbedded from './App.Embedded';

// Dentro de uma tela ou navegação
<AppEmbedded
  isVisible={true}
  webAppUrl="https://your-web-app.com"
  onBack={() => navigation.goBack()}
/>
```

## 🔐 Segurança Implementada

### 1. Validação de Mensagens
- Verificação de estrutura (id, type, payload)
- Validação de timestamp (proteção contra replay attacks)
- Verificação de assinatura (message integrity)

### 2. Rate Limiting
- Máximo de 100 requisições por minuto por tipo
- Proteção contra spam e ataques DDoS

### 3. Sanitização
- Escape de caracteres especiais
- Proteção contra XSS
- Validação de URLs

### 4. Armazenamento Seguro
- SecureStorage com fallback para AsyncStorage
- Suporte para react-native-encrypted-storage (opcional)

## 💾 Offline First

### Cache de Dados
```typescript
import OfflineStorage from './src/storage/OfflineStorage';

// Salvar dados no cache
await OfflineStorage.cacheData('key', data, expiresIn);

// Recuperar dados do cache
const data = await OfflineStorage.getCachedData('key');
```

### Fila de Ações Offline
```typescript
import SyncManager from './src/sync/SyncManager';

// Executar ação com suporte offline
await SyncManager.executeWithOffline(
  'actionType',
  payload,
  async (payload) => {
    // Executar ação
    return result;
  },
  {
    cacheKey: 'cache-key',
    useCache: true,
    cacheDuration: 60000 // 1 minuto
  }
);
```

### Sincronização Automática
```typescript
// A sincronização ocorre automaticamente quando:
// 1. A conexão é restaurada
// 2. O app volta do background
// 3. Manualmente via SyncManager.syncPendingActions()
```

## 🌐 Network Management

```typescript
import NetworkManager from './src/network/NetworkManager';

// Verificar status
const isOnline = NetworkManager.isConnected();

// Adicionar listener
NetworkManager.addListener((isConnected) => {
  console.log('Network status:', isConnected);
});

// Aguardar conexão
const connected = await NetworkManager.waitForConnection(30000);
```

## 🔧 Customização

### Adicionar Novos Handlers

```typescript
MobileBridge.registerHandler('customHandler', async (payload) => {
  // Sua lógica customizada
  return { success: true, data: 'custom result' };
});
```

### Configurar Rate Limit

Edite `src/utils/BridgeSecurity.ts`:
```typescript
private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minuto
private static readonly MAX_REQUESTS_PER_WINDOW = 100; // 100 requisições
```

### Configurar Cache Expiration

Edite `src/storage/OfflineStorage.ts`:
```typescript
private readonly MAX_CACHE_AGE = 1000 * 60 * 60 * 24; // 24 horas
```

## 📝 Exemplo de Uso Completo

```typescript
import React, { useEffect, useRef, useCallback } from 'react';
import { View } from 'react-native';
import TurboWebView from './src/components/TurboWebView';
import MobileBridge from './src/bridge/MobileBridge';
import NetworkManager from './src/network/NetworkManager';
import SyncManager from './src/sync/SyncManager';

function MyApp() {
  const webViewRef = useRef(null);

  useEffect(() => {
    // Inicializar serviços
    NetworkManager.initialize();
    SyncManager.initialize();

    // Registrar handlers
    MobileBridge.registerHandler('myAction', async (payload) => {
      console.log('Action received:', payload);
      return { success: true };
    });

    return () => {
      NetworkManager.cleanup();
      SyncManager.cleanup();
      MobileBridge.clear();
    };
  }, []);

  const handleMessage = useCallback(async (event) => {
    const message = JSON.parse(event.nativeEvent.data);
    const response = await MobileBridge.handleMessage(message);

    if (webViewRef.current) {
      const script = `
        window.WebBridge.handleNativeResponse(${JSON.stringify(response)});
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TurboWebView
        ref={webViewRef}
        source={{ uri: 'https://your-app.com' }}
        onMessage={handleMessage}
      />
    </View>
  );
}
```

## 🛠️ Dependências Opcionais

### Para Armazenamento Criptografado
```bash
npm install react-native-encrypted-storage
```

### Para Crypto Real (Produção)
```bash
npm install crypto-js @types/crypto-js
```

Depois edite `src/utils/BridgeSecurity.ts` para usar crypto-js no lugar do simpleHash.

## 📚 Recursos Adicionais

- [React Native WebView](https://github.com/react-native-webview/react-native-webview)
- [AsyncStorage](https://github.com/react-native-async-storage/async-storage)
- [NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)

## 🤝 Contribuindo

Este é um esqueleto minimalista. Para o projeto completo com exemplos e features avançadas, veja o projeto original `simulation-mobile-bridge-ReactNative082`.

## 📄 Licença

Este código é fornecido como template para uso em projetos internos.

## ⚠️ Notas Importantes

1. **Produção**: Antes de usar em produção:
   - Instale `react-native-encrypted-storage` para armazenamento seguro
   - Instale `crypto-js` para HMAC real
   - Configure o `SECRET_KEY` em `BridgeSecurity.ts`
   - Revise os limites de rate limiting

2. **URL da WebView**: Configure a URL correta no seu `App.tsx` ou `App.Embedded.tsx`

3. **Handlers**: Implemente os handlers específicos da sua aplicação

4. **Testes**: Execute testes adequados antes de deployment
