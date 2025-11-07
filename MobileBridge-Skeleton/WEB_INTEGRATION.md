# Web Integration Guide

Este guia mostra como integrar o Mobile Bridge no lado web (JavaScript/TypeScript).

## 📋 Estrutura do WebBridge

O WebBridge é a interface JavaScript que permite sua aplicação web se comunicar com o React Native.

## 🚀 Setup Básico

### 1. Criar o WebBridge (JavaScript Vanilla)

Cole este código no seu `index.html` ou arquivo JavaScript principal:

```html
<script>
  // Mobile Bridge - Web Side
  (function() {
    // Verificar se está rodando dentro do WebView React Native
    const isReactNativeWebView = typeof window.ReactNativeWebView !== 'undefined';

    window.WebBridge = {
      _callbacks: {},
      _messageId: 0,

      /**
       * Enviar mensagem para o nativo
       * @param {string} type - Tipo da mensagem/handler
       * @param {object} payload - Dados a enviar
       * @returns {Promise} - Retorna a resposta do nativo
       */
      send: function(type, payload) {
        return new Promise((resolve, reject) => {
          // Gerar ID único
          const messageId = 'web_' + Date.now() + '_' + (this._messageId++);

          // Criar mensagem
          const message = {
            id: messageId,
            type: type,
            payload: payload || {},
            timestamp: Date.now()
          };

          // Armazenar callback
          this._callbacks[messageId] = { resolve, reject };

          // Timeout de 30 segundos
          const timeout = setTimeout(() => {
            if (this._callbacks[messageId]) {
              delete this._callbacks[messageId];
              reject(new Error('Request timeout'));
            }
          }, 30000);

          // Armazenar timeout para limpar depois
          this._callbacks[messageId].timeout = timeout;

          // Enviar para React Native
          if (isReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          } else {
            console.warn('[WebBridge] Not running in React Native WebView');
            reject(new Error('Not in React Native WebView'));
          }
        });
      },

      /**
       * Receber resposta do nativo
       * @param {object} response - Resposta do handler nativo
       */
      handleNativeResponse: function(response) {
        if (this._callbacks[response.id]) {
          const { resolve, reject, timeout } = this._callbacks[response.id];

          // Limpar timeout
          if (timeout) clearTimeout(timeout);

          // Remover callback
          delete this._callbacks[response.id];

          // Resolver ou rejeitar promise
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        }
      },

      /**
       * Listener para mensagens do nativo (opcional)
       */
      on: function(eventType, callback) {
        window.addEventListener(eventType, (event) => {
          callback(event.detail);
        });
      },

      /**
       * Verificar se está no WebView
       */
      isNative: function() {
        return isReactNativeWebView;
      }
    };

    console.log('[WebBridge] Initialized', { isNative: isReactNativeWebView });
  })();
</script>
```

### 2. Usando TypeScript

Crie um arquivo `webbridge.ts`:

```typescript
// webbridge.ts

interface BridgeMessage {
  id: string;
  type: string;
  payload?: any;
  timestamp: number;
}

interface BridgeResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: number;
}

interface CallbackEntry {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeout?: NodeJS.Timeout;
}

class WebBridge {
  private callbacks: Map<string, CallbackEntry> = new Map();
  private messageId: number = 0;
  private readonly MESSAGE_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Expor globalmente
    (window as any).WebBridge = this;
    console.log('[WebBridge] Initialized', {
      isNative: this.isNative()
    });
  }

  /**
   * Enviar mensagem para o nativo
   */
  async send<T = any>(type: string, payload?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const messageId = `web_${Date.now()}_${this.messageId++}`;

      const message: BridgeMessage = {
        id: messageId,
        type,
        payload: payload || {},
        timestamp: Date.now()
      };

      // Timeout
      const timeout = setTimeout(() => {
        this.callbacks.delete(messageId);
        reject(new Error('Request timeout'));
      }, this.MESSAGE_TIMEOUT);

      // Armazenar callback
      this.callbacks.set(messageId, { resolve, reject, timeout });

      // Enviar
      if (this.isNative()) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
      } else {
        clearTimeout(timeout);
        this.callbacks.delete(messageId);
        reject(new Error('Not in React Native WebView'));
      }
    });
  }

  /**
   * Receber resposta do nativo
   */
  handleNativeResponse(response: BridgeResponse): void {
    const entry = this.callbacks.get(response.id);

    if (entry) {
      const { resolve, reject, timeout } = entry;

      // Limpar
      if (timeout) clearTimeout(timeout);
      this.callbacks.delete(response.id);

      // Resolver
      if (response.success) {
        resolve(response.data);
      } else {
        reject(new Error(response.error || 'Unknown error'));
      }
    }
  }

  /**
   * Listener para eventos do nativo
   */
  on(eventType: string, callback: (data: any) => void): () => void {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener(eventType, handler as EventListener);

    // Retorna função para remover listener
    return () => {
      window.removeEventListener(eventType, handler as EventListener);
    };
  }

  /**
   * Verificar se está no WebView
   */
  isNative(): boolean {
    return typeof (window as any).ReactNativeWebView !== 'undefined';
  }
}

// Criar instância global
const bridge = new WebBridge();

export default bridge;
```

## 📱 Exemplos de Uso

### 1. Notificação Simples

```javascript
// JavaScript
async function showNotification() {
  try {
    const result = await window.WebBridge.send('showNotification', {
      title: 'Sucesso!',
      message: 'Operação concluída',
      type: 'success'
    });
    console.log('Notification shown:', result);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}
```

```typescript
// TypeScript
import bridge from './webbridge';

async function showNotification() {
  try {
    const result = await bridge.send('showNotification', {
      title: 'Sucesso!',
      message: 'Operação concluída',
      type: 'success'
    });
    console.log('Notification shown:', result);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}
```

### 2. Navegação

```javascript
// Navegar para outra tela nativa
async function goToProfile() {
  try {
    await window.WebBridge.send('navigate', {
      screen: 'Profile',
      params: { userId: 123 }
    });
  } catch (error) {
    console.error('Navigation error:', error);
  }
}
```

### 3. Salvar Dados Offline

```javascript
async function saveUserPreferences(preferences) {
  try {
    await window.WebBridge.send('saveData', {
      key: 'userPreferences',
      value: preferences
    });
    console.log('Preferences saved');
  } catch (error) {
    console.error('Error saving:', error);
  }
}

async function loadUserPreferences() {
  try {
    const result = await window.WebBridge.send('getData', {
      key: 'userPreferences'
    });
    return result.data;
  } catch (error) {
    console.error('Error loading:', error);
    return null;
  }
}
```

### 4. Obter Info do Dispositivo

```javascript
async function getDeviceInfo() {
  try {
    const info = await window.WebBridge.send('getDeviceInfo');
    console.log('Platform:', info.platform);
    console.log('Is Online:', info.isOnline);
    return info;
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
}
```

### 5. Share

```javascript
async function shareContent() {
  try {
    await window.WebBridge.send('share', {
      title: 'Check this out!',
      message: 'Amazing content',
      url: 'https://example.com'
    });
  } catch (error) {
    console.error('Share error:', error);
  }
}
```

### 6. Listener para Eventos Nativos

```javascript
// Escutar mudanças de status de rede
window.WebBridge.on('networkStatusChanged', (data) => {
  console.log('Network status:', data.isOnline);
  if (!data.isOnline) {
    showOfflineBanner();
  } else {
    hideOfflineBanner();
  }
});
```

## 🎯 Integração com Frameworks

### React

```typescript
import { useEffect, useState } from 'react';
import bridge from './webbridge';

function App() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Listener para eventos de rede
    const unsubscribe = bridge.on('networkStatusChanged', (data) => {
      setIsOnline(data.isOnline);
    });

    return () => unsubscribe();
  }, []);

  const handleNotification = async () => {
    try {
      await bridge.send('showNotification', {
        title: 'Hello',
        message: 'From React!'
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
      <button onClick={handleNotification}>Show Notification</button>
    </div>
  );
}
```

### Vue.js

```vue
<template>
  <div>
    <div>Status: {{ isOnline ? 'Online' : 'Offline' }}</div>
    <button @click="showNotification">Show Notification</button>
  </div>
</template>

<script>
import bridge from './webbridge';

export default {
  data() {
    return {
      isOnline: true,
      unsubscribe: null
    };
  },
  mounted() {
    this.unsubscribe = bridge.on('networkStatusChanged', (data) => {
      this.isOnline = data.isOnline;
    });
  },
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async showNotification() {
      try {
        await bridge.send('showNotification', {
          title: 'Hello',
          message: 'From Vue!'
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import bridge from './webbridge';

@Component({
  selector: 'app-root',
  template: `
    <div>Status: {{ isOnline ? 'Online' : 'Offline' }}</div>
    <button (click)="showNotification()">Show Notification</button>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  isOnline = true;
  private unsubscribe?: () => void;

  ngOnInit() {
    this.unsubscribe = bridge.on('networkStatusChanged', (data) => {
      this.isOnline = data.isOnline;
    });
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  async showNotification() {
    try {
      await bridge.send('showNotification', {
        title: 'Hello',
        message: 'From Angular!'
      });
    } catch (error) {
      console.error(error);
    }
  }
}
```

## 🔧 Helper Functions

### Wrapper com Loading State

```typescript
async function withLoading<T>(
  fn: () => Promise<T>,
  setLoading: (loading: boolean) => void
): Promise<T | null> {
  try {
    setLoading(true);
    return await fn();
  } catch (error) {
    console.error('Error:', error);
    return null;
  } finally {
    setLoading(false);
  }
}

// Uso
const result = await withLoading(
  () => bridge.send('getData', { key: 'user' }),
  setIsLoading
);
```

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Uso
const result = await withRetry(
  () => bridge.send('saveData', { key: 'user', value: data }),
  3,
  1000
);
```

### Debounced Bridge Call

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Uso
const debouncedSave = debounce(async (data) => {
  await bridge.send('saveData', { key: 'draft', value: data });
}, 500);

// Chamar ao digitar
input.addEventListener('input', (e) => {
  debouncedSave(e.target.value);
});
```

## 🐛 Debug & Troubleshooting

### Verificar se está no WebView

```javascript
if (window.WebBridge.isNative()) {
  console.log('Running in React Native WebView');
} else {
  console.log('Running in regular browser');
  // Usar mock ou API alternativa
}
```

### Mock para Desenvolvimento

```typescript
// mock-bridge.ts
export const mockBridge = {
  async send(type: string, payload: any) {
    console.log('[Mock Bridge] Send:', type, payload);

    // Simular respostas
    switch (type) {
      case 'getDeviceInfo':
        return { platform: 'web', isOnline: true };
      case 'showNotification':
        return { success: true };
      default:
        return { success: true };
    }
  },

  on(eventType: string, callback: Function) {
    console.log('[Mock Bridge] Registered listener:', eventType);
    return () => {};
  },

  isNative() {
    return false;
  }
};

// Usar no desenvolvimento
const bridge = window.WebBridge?.isNative()
  ? window.WebBridge
  : mockBridge;
```

### Logging

```typescript
class LoggedBridge {
  async send(type: string, payload: any) {
    console.log(`[Bridge] → ${type}`, payload);
    const startTime = Date.now();

    try {
      const result = await bridge.send(type, payload);
      console.log(`[Bridge] ← ${type} (${Date.now() - startTime}ms)`, result);
      return result;
    } catch (error) {
      console.error(`[Bridge] ✗ ${type} (${Date.now() - startTime}ms)`, error);
      throw error;
    }
  }
}

const loggedBridge = new LoggedBridge();
```

## ✅ Checklist de Integração

- [ ] WebBridge código adicionado
- [ ] Testado em WebView
- [ ] Testado em browser (com mock)
- [ ] Tratamento de erros implementado
- [ ] Loading states adicionados
- [ ] Listeners registrados e limpos
- [ ] TypeScript types definidos (se usar TS)
- [ ] Documentação dos handlers criada

## 📚 API Reference

### WebBridge.send(type, payload)
Envia mensagem para o nativo e retorna Promise com resposta.

**Parâmetros:**
- `type` (string): Tipo do handler nativo
- `payload` (object): Dados a enviar

**Retorna:** Promise com resposta do handler

### WebBridge.on(eventType, callback)
Registra listener para eventos nativos.

**Parâmetros:**
- `eventType` (string): Nome do evento
- `callback` (function): Função a chamar quando evento ocorrer

**Retorna:** Função para remover listener

### WebBridge.isNative()
Verifica se está rodando no WebView React Native.

**Retorna:** boolean

## 🎓 Próximos Passos

1. Implemente os handlers que você precisa
2. Adicione tipos TypeScript para segurança
3. Configure mock para desenvolvimento
4. Adicione error tracking (Sentry, etc)
5. Implemente analytics
6. Configure CI/CD para testar integração

## 💡 Dicas

1. Sempre verifique se está no WebView antes de chamar
2. Implemente timeout adequado
3. Use debounce para chamadas frequentes
4. Adicione retry logic para operações críticas
5. Log todas as chamadas em desenvolvimento
6. Use TypeScript para type safety
7. Teste offline scenarios
8. Documente todos os handlers
