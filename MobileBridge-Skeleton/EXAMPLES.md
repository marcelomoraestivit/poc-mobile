# Exemplos Práticos

Este arquivo contém exemplos práticos e completos de uso do Mobile Bridge.

## 📱 Exemplo 1: E-Commerce App

### Native Side (React Native)

```typescript
import React, { useEffect, useRef, useState } from 'react';
import { View, Alert } from 'react-native';
import TurboWebView from './src/components/TurboWebView';
import MobileBridge from './src/bridge/MobileBridge';
import OfflineStorage from './src/storage/OfflineStorage';
import NetworkManager from './src/network/NetworkManager';
import SyncManager from './src/sync/SyncManager';

function ECommerceApp() {
  const webViewRef = useRef(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    NetworkManager.initialize();
    SyncManager.initialize();

    // Handler: Adicionar ao carrinho
    MobileBridge.registerHandler('addToCart', async (payload) => {
      const { product, quantity } = payload;

      // Salvar no storage offline
      const currentCart = await OfflineStorage.getCachedData('cart') || [];
      currentCart.push({ product, quantity, addedAt: Date.now() });
      await OfflineStorage.cacheData('cart', currentCart);

      setCart(currentCart);

      // Notificar web
      await MobileBridge.sendToWeb(webViewRef, 'cartUpdated', {
        items: currentCart,
        count: currentCart.length
      });

      return { success: true, cart: currentCart };
    });

    // Handler: Finalizar compra
    MobileBridge.registerHandler('checkout', async (payload) => {
      const { shippingAddress, paymentMethod } = payload;

      try {
        // Sincronizar com servidor
        const result = await SyncManager.executeWithOffline(
          'createOrder',
          { cart, shippingAddress, paymentMethod },
          async (data) => {
            // Chamar API
            const response = await fetch('https://api.example.com/orders', {
              method: 'POST',
              body: JSON.stringify(data)
            });
            return await response.json();
          }
        );

        // Limpar carrinho
        await OfflineStorage.cacheData('cart', []);
        setCart([]);

        // Mostrar confirmação
        Alert.alert('Sucesso!', `Pedido #${result.orderId} criado com sucesso!`);

        return { success: true, orderId: result.orderId };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    return () => {
      NetworkManager.cleanup();
      SyncManager.cleanup();
      MobileBridge.clear();
    };
  }, [cart]);

  const handleMessage = async (event) => {
    const message = JSON.parse(event.nativeEvent.data);
    const response = await MobileBridge.handleMessage(message);

    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.WebBridge.handleNativeResponse(${JSON.stringify(response)});
      `);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TurboWebView
        ref={webViewRef}
        source={{ uri: 'https://myshop.com' }}
        onMessage={handleMessage}
      />
    </View>
  );
}
```

### Web Side (JavaScript)

```javascript
// E-Commerce Web App
class ShopApp {
  constructor() {
    this.cart = [];
    this.init();
  }

  async init() {
    // Listener para atualizações do carrinho
    window.WebBridge.on('cartUpdated', (data) => {
      this.cart = data.items;
      this.updateCartUI(data.count);
    });
  }

  async addToCart(product, quantity) {
    try {
      const result = await window.WebBridge.send('addToCart', {
        product,
        quantity
      });

      this.showNotification('Produto adicionado ao carrinho!');
      return result;
    } catch (error) {
      this.showError('Erro ao adicionar produto');
      throw error;
    }
  }

  async checkout(shippingAddress, paymentMethod) {
    try {
      const result = await window.WebBridge.send('checkout', {
        shippingAddress,
        paymentMethod
      });

      if (result.success) {
        this.showSuccess(`Pedido ${result.orderId} criado!`);
        window.location.href = `/order/${result.orderId}`;
      }
    } catch (error) {
      this.showError('Erro ao finalizar compra');
    }
  }

  updateCartUI(count) {
    document.getElementById('cart-badge').textContent = count;
  }

  showNotification(message) {
    // Sua lógica de notificação
  }
}

// Usar
const shop = new ShopApp();

// Botão adicionar ao carrinho
document.getElementById('add-to-cart').addEventListener('click', () => {
  shop.addToCart({
    id: 123,
    name: 'Product X',
    price: 99.90
  }, 1);
});
```

## 📝 Exemplo 2: Social Media App

### Native Side

```typescript
import React, { useEffect, useRef } from 'react';
import { Share, Alert } from 'react-native';
import MobileBridge from './src/bridge/MobileBridge';
import OfflineStorage from './src/storage/OfflineStorage';

function SocialMediaApp() {
  const webViewRef = useRef(null);

  useEffect(() => {
    // Handler: Criar post
    MobileBridge.registerHandler('createPost', async (payload) => {
      const { content, images } = payload;

      try {
        // Se offline, adicionar à fila
        const result = await SyncManager.executeWithOffline(
          'createPost',
          { content, images },
          async (data) => {
            const response = await fetch('https://api.social.com/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            return await response.json();
          },
          { cacheKey: `post-${Date.now()}` }
        );

        return { success: true, post: result };
      } catch (error) {
        // Post será sincronizado quando voltar online
        return { success: true, queued: true };
      }
    });

    // Handler: Share
    MobileBridge.registerHandler('sharePost', async (payload) => {
      const { title, message, url } = payload;

      try {
        await Share.share({ title, message, url });
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Handler: Notificações
    MobileBridge.registerHandler('getNotifications', async () => {
      const notifications = await OfflineStorage.getCachedData('notifications') || [];
      return { success: true, notifications };
    });

    return () => {
      MobileBridge.clear();
    };
  }, []);

  // ... handleMessage ...
}
```

### Web Side

```javascript
class SocialApp {
  async createPost(content, images) {
    try {
      const result = await window.WebBridge.send('createPost', {
        content,
        images
      });

      if (result.queued) {
        this.showInfo('Post será publicado quando você estiver online');
      } else {
        this.showSuccess('Post publicado!');
      }

      return result;
    } catch (error) {
      this.showError('Erro ao criar post');
    }
  }

  async sharePost(postId) {
    try {
      await window.WebBridge.send('sharePost', {
        title: 'Check this out!',
        message: 'Amazing post',
        url: `https://social.com/posts/${postId}`
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  async loadNotifications() {
    try {
      const result = await window.WebBridge.send('getNotifications');
      this.renderNotifications(result.notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }
}

const app = new SocialApp();
```

## 📊 Exemplo 3: Dashboard Analytics

### Native Side

```typescript
import React, { useEffect } from 'react';
import MobileBridge from './src/bridge/MobileBridge';
import OfflineStorage from './src/storage/OfflineStorage';

function DashboardApp() {
  useEffect(() => {
    // Handler: Buscar dados do dashboard
    MobileBridge.registerHandler('getDashboardData', async (payload) => {
      const { dateRange } = payload;

      try {
        const cacheKey = `dashboard-${dateRange}`;

        // Usar cache-first strategy
        const result = await SyncManager.executeWithOffline(
          'fetchDashboard',
          { dateRange },
          async (data) => {
            const response = await fetch(
              `https://api.example.com/dashboard?range=${data.dateRange}`
            );
            return await response.json();
          },
          {
            cacheKey,
            useCache: true,
            cacheDuration: 5 * 60 * 1000 // 5 minutos
          }
        );

        return { success: true, data: result };
      } catch (error) {
        // Retornar dados cacheados se disponível
        const cached = await OfflineStorage.getCachedData(cacheKey);
        if (cached) {
          return { success: true, data: cached, fromCache: true };
        }
        return { success: false, error: error.message };
      }
    });

    // Handler: Export data
    MobileBridge.registerHandler('exportData', async (payload) => {
      const { format, data } = payload;

      // Salvar arquivo localmente
      const filePath = await saveFile(`export.${format}`, data);

      return { success: true, filePath };
    });

    return () => {
      MobileBridge.clear();
    };
  }, []);
}
```

### Web Side

```javascript
class Dashboard {
  constructor() {
    this.data = null;
    this.isLoading = false;
  }

  async loadData(dateRange) {
    this.isLoading = true;
    this.showLoader();

    try {
      const result = await window.WebBridge.send('getDashboardData', {
        dateRange
      });

      this.data = result.data;
      this.renderCharts(result.data);

      if (result.fromCache) {
        this.showWarning('Mostrando dados em cache');
      }
    } catch (error) {
      this.showError('Erro ao carregar dados');
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }

  async exportData(format) {
    try {
      const result = await window.WebBridge.send('exportData', {
        format,
        data: this.data
      });

      this.showSuccess(`Arquivo exportado: ${result.filePath}`);
    } catch (error) {
      this.showError('Erro ao exportar dados');
    }
  }

  renderCharts(data) {
    // Renderizar gráficos
  }
}
```

## 🎮 Exemplo 4: Gaming App

### Native Side

```typescript
import React, { useEffect, useState } from 'react';
import MobileBridge from './src/bridge/MobileBridge';
import OfflineStorage from './src/storage/OfflineStorage';

function GamingApp() {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Handler: Salvar progresso
    MobileBridge.registerHandler('saveProgress', async (payload) => {
      const { level, score, achievements } = payload;

      // Salvar localmente
      await OfflineStorage.cacheData('gameProgress', {
        level,
        score,
        achievements,
        savedAt: Date.now()
      });

      // Sincronizar com servidor quando online
      await SyncManager.executeWithOffline(
        'syncProgress',
        { level, score, achievements },
        async (data) => {
          await fetch('https://api.game.com/progress', {
            method: 'POST',
            body: JSON.stringify(data)
          });
        }
      );

      return { success: true };
    });

    // Handler: Carregar progresso
    MobileBridge.registerHandler('loadProgress', async () => {
      const progress = await OfflineStorage.getCachedData('gameProgress');
      return { success: true, progress };
    });

    // Handler: Compra in-app
    MobileBridge.registerHandler('purchaseItem', async (payload) => {
      const { itemId, price } = payload;

      // Lógica de in-app purchase nativa
      // ...

      return { success: true };
    });

    return () => {
      MobileBridge.clear();
    };
  }, []);
}
```

### Web Side

```javascript
class Game {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.achievements = [];
  }

  async init() {
    // Carregar progresso salvo
    try {
      const result = await window.WebBridge.send('loadProgress');
      if (result.progress) {
        this.level = result.progress.level;
        this.score = result.progress.score;
        this.achievements = result.progress.achievements;
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  async saveProgress() {
    try {
      await window.WebBridge.send('saveProgress', {
        level: this.level,
        score: this.score,
        achievements: this.achievements
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  async purchaseItem(itemId, price) {
    try {
      const result = await window.WebBridge.send('purchaseItem', {
        itemId,
        price
      });

      if (result.success) {
        this.unlockItem(itemId);
      }
    } catch (error) {
      this.showError('Erro na compra');
    }
  }

  // Auto-save a cada 30 segundos
  startAutoSave() {
    setInterval(() => {
      this.saveProgress();
    }, 30000);
  }
}

const game = new Game();
game.init();
game.startAutoSave();
```

## 🏥 Exemplo 5: Healthcare App

### Native Side

```typescript
import React, { useEffect } from 'react';
import MobileBridge from './src/bridge/MobileBridge';
import SecureStorage from './src/storage/SecureStorage';

function HealthcareApp() {
  useEffect(() => {
    // Handler: Salvar dados de saúde (sensíveis)
    MobileBridge.registerHandler('saveHealthData', async (payload) => {
      const { type, value, timestamp } = payload;

      // Usar secure storage para dados sensíveis
      const healthData = await SecureStorage.getObject('healthData') || [];
      healthData.push({ type, value, timestamp });
      await SecureStorage.setObject('healthData', healthData);

      return { success: true };
    });

    // Handler: Obter dados de saúde
    MobileBridge.registerHandler('getHealthData', async (payload) => {
      const { type, startDate, endDate } = payload;

      const healthData = await SecureStorage.getObject('healthData') || [];

      // Filtrar por tipo e data
      const filtered = healthData.filter(item =>
        item.type === type &&
        item.timestamp >= startDate &&
        item.timestamp <= endDate
      );

      return { success: true, data: filtered };
    });

    // Handler: Biometric authentication
    MobileBridge.registerHandler('authenticate', async () => {
      // Implementar autenticação biométrica
      // const result = await BiometricAuth.authenticate();
      return { success: true };
    });

    return () => {
      MobileBridge.clear();
    };
  }, []);
}
```

### Web Side

```javascript
class HealthApp {
  async saveHealthData(type, value) {
    try {
      await window.WebBridge.send('saveHealthData', {
        type,
        value,
        timestamp: Date.now()
      });

      this.showSuccess('Dados salvos com segurança');
    } catch (error) {
      this.showError('Erro ao salvar dados');
    }
  }

  async getHealthData(type, startDate, endDate) {
    try {
      // Autenticar antes de acessar dados sensíveis
      const authResult = await window.WebBridge.send('authenticate');

      if (!authResult.success) {
        this.showError('Autenticação necessária');
        return;
      }

      const result = await window.WebBridge.send('getHealthData', {
        type,
        startDate,
        endDate
      });

      this.renderChart(result.data);
    } catch (error) {
      this.showError('Erro ao carregar dados');
    }
  }
}
```

## 🔄 Exemplo 6: Real-time Chat

### Native Side

```typescript
import React, { useEffect, useRef } from 'react';
import MobileBridge from './src/bridge/MobileBridge';

function ChatApp() {
  const webViewRef = useRef(null);
  const ws = useRef(null);

  useEffect(() => {
    // Conectar WebSocket
    ws.current = new WebSocket('wss://chat.example.com');

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Enviar mensagem para o web
      MobileBridge.sendToWeb(webViewRef, 'newMessage', message);
    };

    // Handler: Enviar mensagem
    MobileBridge.registerHandler('sendMessage', async (payload) => {
      const { chatId, text } = payload;

      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ chatId, text }));
        return { success: true };
      }

      return { success: false, error: 'Not connected' };
    });

    return () => {
      ws.current?.close();
      MobileBridge.clear();
    };
  }, []);
}
```

### Web Side

```javascript
class ChatApp {
  constructor() {
    this.messages = [];
    this.init();
  }

  init() {
    // Listener para novas mensagens
    window.WebBridge.on('newMessage', (message) => {
      this.messages.push(message);
      this.renderMessage(message);
      this.playNotificationSound();
    });
  }

  async sendMessage(chatId, text) {
    try {
      await window.WebBridge.send('sendMessage', { chatId, text });

      // Adicionar à UI imediatamente
      this.addMessageToUI({ chatId, text, sender: 'me' });
    } catch (error) {
      this.showError('Erro ao enviar mensagem');
    }
  }
}
```

## 💡 Dicas Gerais

### 1. Sempre faça tratamento de erros

```javascript
async function safeCall(handler, payload) {
  try {
    return await window.WebBridge.send(handler, payload);
  } catch (error) {
    console.error(`Error calling ${handler}:`, error);
    // Fallback ou UI feedback
    return null;
  }
}
```

### 2. Use TypeScript para type safety

```typescript
interface AddToCartPayload {
  product: Product;
  quantity: number;
}

interface AddToCartResponse {
  success: boolean;
  cart: CartItem[];
}

async function addToCart(payload: AddToCartPayload): Promise<AddToCartResponse> {
  return await bridge.send<AddToCartResponse>('addToCart', payload);
}
```

### 3. Implemente loading states

```javascript
class App {
  async loadData() {
    this.setState({ loading: true });

    try {
      const data = await window.WebBridge.send('getData');
      this.setState({ data });
    } finally {
      this.setState({ loading: false });
    }
  }
}
```

### 4. Cache strategicamente

```typescript
// Cache-first para dados que mudam pouco
MobileBridge.registerHandler('getCategories', async () => {
  const cached = await OfflineStorage.getCachedData('categories');
  if (cached) return { success: true, data: cached };

  const data = await fetchCategories();
  await OfflineStorage.cacheData('categories', data, 24 * 60 * 60 * 1000);
  return { success: true, data };
});
```

### 5. Teste offline scenarios

```javascript
// Simular offline
window.addEventListener('offline', () => {
  console.log('App is offline - testing offline features');
});
```

## 📚 Mais Recursos

- Ver `INTEGRATION_GUIDE.md` para setup detalhado
- Ver `WEB_INTEGRATION.md` para exemplos web completos
- Ver `ARCHITECTURE.md` para entender a arquitetura
