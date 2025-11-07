# React Native Mobile Bridge

Uma biblioteca poderosa para comunicação perfeita entre WebView e código nativo React Native, com suporte offline, sincronização de dados e recursos de segurança.

## 🚀 Características

- 🔄 **Comunicação Bidirecional**: Comunicação suave entre WebView e React Native
- 🔒 **Segurança Integrada**: Validação de mensagens, rate limiting e sanitização
- 📡 **Suporte Offline**: Armazenamento e sincronização automática de ações quando offline
- 💾 **Storage Seguro**: Armazenamento criptografado para dados sensíveis
- 🌐 **Detecção de Rede**: Monitoramento automático de status de conectividade
- ⚡ **Turbo Native Ready**: Compatível com padrões Hotwire Turbo Native
- 📦 **TypeScript**: Totalmente tipado para melhor experiência de desenvolvimento

## 📦 Instalação

```bash
npm install react-native-mobile-bridge react-native-webview @react-native-async-storage/async-storage @react-native-community/netinfo
```

ou

```bash
yarn add react-native-mobile-bridge react-native-webview @react-native-async-storage/async-storage @react-native-community/netinfo
```

### Instalação iOS

```bash
cd ios && pod install
```

## 🎯 Uso Básico

### 1. Configure o TurboWebView

```tsx
import React, { useRef } from 'react';
import { View } from 'react-native';
import { TurboWebView, MobileBridge } from 'react-native-mobile-bridge';
import { WebView } from 'react-native-webview';

function App() {
  const webViewRef = useRef<WebView>(null);

  // Registre handlers para mensagens do WebView
  React.useEffect(() => {
    MobileBridge.registerHandler('getUserData', async () => {
      return {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      };
    });

    MobileBridge.registerHandler('showAlert', async (payload) => {
      console.log('Alert:', payload.message);
      return { success: true };
    });

    return () => {
      MobileBridge.clear();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <TurboWebView
        ref={webViewRef}
        source={{ uri: 'https://your-web-app.com' }}
        onLoad={() => console.log('WebView loaded')}
        onError={(error) => console.error('WebView error:', error)}
      />
    </View>
  );
}

export default App;
```

### 2. No seu WebApp (JavaScript)

```javascript
// O WebBridge é injetado automaticamente pelo TurboWebView

// Enviar mensagem para o native
async function getUserData() {
  try {
    const userData = await window.WebBridge.sendToNative('getUserData', {});
    console.log('User data:', userData);
  } catch (error) {
    console.error('Error getting user data:', error);
  }
}

// Registrar handler para mensagens do native
window.WebBridge.registerHandler('cartUpdated', (payload) => {
  console.log('Cart updated:', payload);
  // Atualizar UI
});

// Verificar se está rodando no app nativo
if (window.TurboNative && window.TurboNative.isAvailable()) {
  console.log('Running in native app!');
}
```

## 📚 API Completa

### MobileBridge

```typescript
import { MobileBridge } from 'react-native-mobile-bridge';

// Registrar handler
MobileBridge.registerHandler('handlerName', async (payload) => {
  // Processar mensagem
  return { result: 'success' };
});

// Enviar mensagem para WebView
await MobileBridge.sendToWeb(webViewRef, 'eventName', { data: 'value' });

// Remover handler
MobileBridge.unregisterHandler('handlerName');

// Limpar todos os handlers
MobileBridge.clear();
```

### NetworkManager

```typescript
import { NetworkManager } from 'react-native-mobile-bridge';

// Inicializar
NetworkManager.initialize();

// Verificar status
const isOnline = NetworkManager.isConnected();

// Adicionar listener
NetworkManager.addListener((isConnected) => {
  console.log('Network status:', isConnected);
});

// Aguardar conexão
await NetworkManager.waitForConnection(30000); // 30 segundos timeout
```

### OfflineStorage

```typescript
import { OfflineStorage } from 'react-native-mobile-bridge';

// Salvar ação pendente (para sync quando voltar online)
await OfflineStorage.savePendingAction({
  id: 'unique-id',
  type: 'addToCart',
  payload: { productId: '123', quantity: 2 },
  timestamp: Date.now()
});

// Obter ações pendentes
const actions = await OfflineStorage.getPendingActions();

// Remover ação
await OfflineStorage.removePendingAction('unique-id');

// Cache de dados
await OfflineStorage.setCache('userData', userData, 600000); // 10 min TTL
const cached = await OfflineStorage.getCache('userData');
```

### SecureStorage

```typescript
import { SecureStorage } from 'react-native-mobile-bridge';

// Salvar dados sensíveis (criptografado)
await SecureStorage.setItem('authToken', 'secret-token');

// Recuperar dados
const token = await SecureStorage.getItem('authToken');

// Remover dados
await SecureStorage.removeItem('authToken');

// Limpar tudo
await SecureStorage.clear();
```

### SyncManager

```typescript
import { SyncManager } from 'react-native-mobile-bridge';

// Inicializar
SyncManager.initialize();

// Executar ação com suporte offline
await SyncManager.executeWithOffline(
  'addToCart',
  { productId: '123' },
  async (data) => {
    // Executar quando online
    return await api.addToCart(data);
  },
  {
    cacheKey: 'cart',
    useCache: true,
    cacheDuration: 300000 // 5 min
  }
);

// Sincronizar ações pendentes manualmente
await SyncManager.syncPendingActions();
```

## 🔒 Segurança

A biblioteca inclui várias camadas de segurança:

- **Validação de Mensagens**: Validação automática de estrutura e conteúdo
- **Rate Limiting**: Proteção contra spam de mensagens
- **Sanitização**: Prevenção de injection attacks
- **Timestamps**: Detecção de mensagens expiradas
- **Storage Criptografado**: Dados sensíveis são criptografados

## 🎨 Componentes Inclusos

### ErrorBoundary

```tsx
import { ErrorBoundary } from 'react-native-mobile-bridge';

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

### Toast

```tsx
import { Toast } from 'react-native-mobile-bridge';

<Toast
  message="Sucesso!"
  title="Operação concluída"
  type="success"
  duration={3000}
  onDismiss={() => console.log('Toast dismissed')}
/>
```

### NetworkStatusIndicator

```tsx
import { NetworkStatusIndicator } from 'react-native-mobile-bridge';

<NetworkStatusIndicator
  onStatusChange={(isOnline) => console.log('Network:', isOnline)}
/>
```

## 🔄 Suporte Offline

A biblioteca oferece suporte offline completo:

1. **Detecção Automática**: Monitora status de conexão
2. **Queue de Ações**: Armazena ações quando offline
3. **Auto Sync**: Sincroniza automaticamente quando volta online
4. **Cache Inteligente**: Dados em cache com TTL configurável

## 📝 Exemplos

### Exemplo: Carrinho de Compras com Suporte Offline

```typescript
// No React Native
MobileBridge.registerHandler('addToCart', async (payload) => {
  return await SyncManager.executeWithOffline(
    'addToCart',
    payload,
    async (data) => {
      // API call (só executa quando online)
      const response = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    {
      cacheKey: 'cart',
      useCache: true
    }
  );
});

// No WebApp
async function addToCart(productId, quantity) {
  try {
    const result = await window.WebBridge.sendToNative('addToCart', {
      productId,
      quantity
    });
    console.log('Added to cart:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Exemplo: Autenticação

```typescript
// No React Native
MobileBridge.registerHandler('login', async (payload) => {
  const { email, password } = payload;

  // Validar credenciais
  const response = await api.login(email, password);

  // Salvar token seguramente
  await SecureStorage.setItem('authToken', response.token);
  await SecureStorage.setItem('userId', response.userId);

  return { success: true, user: response.user };
});

MobileBridge.registerHandler('logout', async () => {
  await SecureStorage.removeItem('authToken');
  await SecureStorage.removeItem('userId');
  return { success: true };
});
```

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Build
npm run build

# Lint
npm run lint

# Testes
npm test
```

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, abra uma issue ou PR.

## 📞 Suporte

Para questões e suporte, abra uma issue no GitHub.
