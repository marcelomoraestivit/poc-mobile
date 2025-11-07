# Exemplo Completo de Uso

## Aplicação React Native Completa

```tsx
// App.tsx
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import {
  TurboWebView,
  MobileBridge,
  NetworkStatusIndicator,
  Toast,
  ErrorBoundary,
  SecureStorage,
  SyncManager,
} from 'react-native-mobile-bridge';

interface ToastData {
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

function App() {
  const webViewRef = useRef<WebView>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Inicializar Sync Manager
    SyncManager.initialize();

    // Handler: Obter dados do usuário
    MobileBridge.registerHandler('getUserData', async () => {
      const userId = await SecureStorage.getItem('userId');
      const userName = await SecureStorage.getItem('userName');

      return {
        id: userId || 'guest',
        name: userName || 'Guest User',
        email: 'user@example.com',
        isAuthenticated: !!userId,
      };
    });

    // Handler: Login
    MobileBridge.registerHandler('login', async (payload) => {
      const { email, password } = payload;

      try {
        // Simular chamada de API
        const response = await fetch('https://api.example.com/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
          // Salvar dados de autenticação
          await SecureStorage.setItem('authToken', data.token);
          await SecureStorage.setItem('userId', data.user.id);
          await SecureStorage.setItem('userName', data.user.name);

          setToast({
            title: 'Bem-vindo!',
            message: `Login realizado com sucesso`,
            type: 'success',
          });

          return { success: true, user: data.user };
        } else {
          throw new Error(data.message || 'Login falhou');
        }
      } catch (error) {
        setToast({
          title: 'Erro',
          message: error instanceof Error ? error.message : 'Erro ao fazer login',
          type: 'error',
        });

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Handler: Logout
    MobileBridge.registerHandler('logout', async () => {
      await SecureStorage.removeItem('authToken');
      await SecureStorage.removeItem('userId');
      await SecureStorage.removeItem('userName');

      setToast({
        title: 'Até logo!',
        message: 'Logout realizado com sucesso',
        type: 'info',
      });

      return { success: true };
    });

    // Handler: Adicionar ao carrinho (com suporte offline)
    MobileBridge.registerHandler('addToCart', async (payload) => {
      const { product, quantity } = payload;

      try {
        const result = await SyncManager.executeWithOffline(
          'addToCart',
          { product, quantity },
          async (data) => {
            // Esta função só executa quando online
            const token = await SecureStorage.getItem('authToken');

            const response = await fetch('https://api.example.com/cart', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(data),
            });

            return await response.json();
          },
          {
            cacheKey: 'cart',
            useCache: true,
            cacheDuration: 300000, // 5 minutos
          }
        );

        // Atualizar contador
        setCartCount(prev => prev + quantity);

        // Notificar WebView
        await MobileBridge.sendToWeb(webViewRef, 'cartUpdated', {
          count: cartCount + quantity,
          items: result.items || [],
        });

        setToast({
          title: 'Adicionado!',
          message: `${product.name} foi adicionado ao carrinho`,
          type: 'success',
        });

        return { success: true, cart: result };
      } catch (error) {
        console.error('Error adding to cart:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Handler: Remover do carrinho
    MobileBridge.registerHandler('removeFromCart', async (payload) => {
      const { productId } = payload;

      try {
        const token = await SecureStorage.getItem('authToken');

        const response = await fetch(`https://api.example.com/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        setCartCount(result.count || 0);

        setToast({
          title: 'Removido',
          message: 'Item removido do carrinho',
          type: 'info',
        });

        return { success: true, cart: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Handler: Obter carrinho
    MobileBridge.registerHandler('getCart', async () => {
      try {
        const token = await SecureStorage.getItem('authToken');

        const response = await fetch('https://api.example.com/cart', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const cart = await response.json();
        setCartCount(cart.count || 0);

        return cart;
      } catch (error) {
        return {
          items: [],
          count: 0,
          total: 0,
        };
      }
    });

    // Handler: Mostrar notificação
    MobileBridge.registerHandler('showNotification', async (payload) => {
      const { title, message, type = 'info' } = payload;

      setToast({ title, message, type });

      return { success: true };
    });

    // Handler: Compartilhar
    MobileBridge.registerHandler('share', async (payload) => {
      const { title, message, url } = payload;

      // Implementar share nativo aqui
      console.log('Share:', { title, message, url });

      return { success: true };
    });

    // Handler: Obter informações do dispositivo
    MobileBridge.registerHandler('getDeviceInfo', async () => {
      const { Platform, Dimensions } = require('react-native');

      return {
        platform: Platform.OS,
        version: Platform.Version,
        isOnline,
        screen: {
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        },
      };
    });

    // Cleanup
    return () => {
      MobileBridge.clear();
      SyncManager.cleanup();
    };
  }, [isOnline, cartCount]);

  const handleNetworkChange = (online: boolean) => {
    setIsOnline(online);

    // Notificar WebView sobre mudança de status
    MobileBridge.sendToWeb(webViewRef, 'networkChange', {
      isOnline: online,
    });
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* Indicador de Status de Rede */}
        <NetworkStatusIndicator onStatusChange={handleNetworkChange} />

        {/* WebView */}
        <TurboWebView
          ref={webViewRef}
          source={{ uri: 'https://your-web-app.com' }}
          onLoad={() => console.log('WebView loaded')}
          onError={(error) => console.error('WebView error:', error)}
        />

        {/* Toast para notificações */}
        {toast && (
          <Toast
            message={toast.message}
            title={toast.title}
            type={toast.type}
            duration={3000}
            onDismiss={() => setToast(null)}
          />
        )}
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});

export default App;
```

## Código do WebApp (JavaScript/TypeScript)

```typescript
// web-bridge.ts
export class WebBridgeClient {
  private static instance: WebBridgeClient;

  private constructor() {
    this.setupHandlers();
  }

  static getInstance(): WebBridgeClient {
    if (!WebBridgeClient.instance) {
      WebBridgeClient.instance = new WebBridgeClient();
    }
    return WebBridgeClient.instance;
  }

  private setupHandlers() {
    // Handler para atualização do carrinho (recebida do native)
    if (window.WebBridge) {
      window.WebBridge.registerHandler('cartUpdated', (payload) => {
        console.log('Cart updated from native:', payload);
        this.updateCartUI(payload);
      });

      window.WebBridge.registerHandler('networkChange', (payload) => {
        console.log('Network status changed:', payload);
        this.handleNetworkChange(payload.isOnline);
      });
    }
  }

  async login(email: string, password: string) {
    try {
      const result = await window.WebBridge.sendToNative('login', {
        email,
        password,
      });

      if (result.success) {
        console.log('Login successful:', result.user);
        return result.user;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await window.WebBridge.sendToNative('logout', {});
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async addToCart(product: any, quantity: number = 1) {
    try {
      const result = await window.WebBridge.sendToNative('addToCart', {
        product,
        quantity,
      });

      if (result.success) {
        console.log('Added to cart:', result.cart);
        return result.cart;
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  }

  async getCart() {
    try {
      const cart = await window.WebBridge.sendToNative('getCart', {});
      return cart;
    } catch (error) {
      console.error('Get cart error:', error);
      return { items: [], count: 0, total: 0 };
    }
  }

  async showNotification(title: string, message: string, type = 'info') {
    try {
      await window.WebBridge.sendToNative('showNotification', {
        title,
        message,
        type,
      });
    } catch (error) {
      console.error('Show notification error:', error);
    }
  }

  async share(title: string, message: string, url: string) {
    try {
      await window.WebBridge.sendToNative('share', { title, message, url });
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  private updateCartUI(payload: any) {
    // Atualizar UI do carrinho
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
      cartBadge.textContent = payload.count.toString();
    }
  }

  private handleNetworkChange(isOnline: boolean) {
    // Mostrar/esconder banner de offline
    const offlineBanner = document.querySelector('.offline-banner');
    if (offlineBanner) {
      offlineBanner.style.display = isOnline ? 'none' : 'block';
    }
  }

  isNativeApp(): boolean {
    return !!(window.TurboNative && window.TurboNative.isAvailable());
  }
}

// Exportar instância singleton
export const bridgeClient = WebBridgeClient.getInstance();
```

## Uso no WebApp (React/Vue/Vanilla)

```tsx
// React Component
import React, { useEffect, useState } from 'react';
import { bridgeClient } from './web-bridge';

function ProductPage({ product }) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(bridgeClient.isNativeApp());
  }, []);

  const handleAddToCart = async () => {
    try {
      const cart = await bridgeClient.addToCart(product, 1);
      console.log('Cart updated:', cart);

      // Mostrar feedback
      await bridgeClient.showNotification(
        'Sucesso!',
        `${product.name} foi adicionado ao carrinho`,
        'success'
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleShare = async () => {
    await bridgeClient.share(
      product.name,
      product.description,
      window.location.href
    );
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      <button onClick={handleAddToCart}>
        Adicionar ao Carrinho
      </button>

      {isNative && (
        <button onClick={handleShare}>
          Compartilhar
        </button>
      )}
    </div>
  );
}

export default ProductPage;
```

## TypeScript Declarations (para WebApp)

```typescript
// declarations.d.ts
interface WebBridge {
  sendToNative(type: string, payload: any): Promise<any>;
  registerHandler(type: string, handler: (payload: any) => void): void;
  handleNativeMessage(message: any): void;
  handleNativeResponse(response: any): void;
}

interface TurboNative {
  visit(url: string): Promise<any>;
  isNativeApp: boolean;
  isAvailable(): boolean;
}

interface Window {
  WebBridge: WebBridge;
  TurboNative: TurboNative;
  ReactNativeWebView: {
    postMessage(message: string): void;
  };
}
```
