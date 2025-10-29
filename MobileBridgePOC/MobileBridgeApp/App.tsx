/**
 * E-Commerce Mobile App with Mobile Bridge
 * Web pages (HTML/CSS/JS) + Native logic
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabBar, { TabItem } from './src/components/TabBar';
import TurboWebView from './src/components/TurboWebView';
import NetworkStatusIndicator from './src/components/NetworkStatusIndicator';
import Toast from './src/components/Toast';
import MobileBridge from './src/bridge/MobileBridge';
import { CartManager } from './src/store/CartManager';
import { WishlistManager } from './src/store/WishlistManager';
import { NotificationService } from './src/services/NotificationService';

interface ToastData {
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('home');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<ToastData | null>(null);
  const webViewRef = useRef<any>(null);
  const bridge = MobileBridge;

  // Initialize Mobile Bridge handlers
  useEffect(() => {
    const cartManager = CartManager.getInstance();
    const wishlistManager = WishlistManager.getInstance();
    const notificationService = NotificationService.getInstance();

    // Update cart count
    const updateCartCount = () => {
      setCartItemCount(cartManager.getItemCount());
    };
    updateCartCount();
    const unsubCart = cartManager.subscribe(updateCartCount);

    // Navigation handler - navigate React web app via hash router
    bridge.registerHandler('navigate', async (payload) => {
      const { page, params } = payload;
      console.log('Navigate to:', page, params);

      // Map page names to routes
      const routeMap: Record<string, string> = {
        home: '/',
        search: '/search',
        wishlist: '/wishlist',
        cart: '/cart',
        checkout: '/checkout',
        product: '/product',
      };

      let route = routeMap[page] || '/';

      // Add params to route (for product detail page)
      if (params && params.id && page === 'product') {
        route = `/product/${params.id}`;
      }

      // Update active tab based on page
      if (page === 'home') setActiveTab('home');
      else if (page === 'search') setActiveTab('search');
      else if (page === 'wishlist') setActiveTab('wishlist');
      else if (page === 'cart') setActiveTab('cart');

      // Navigate in WebView via hash router
      if (webViewRef.current) {
        const script = `
          (function() {
            console.log('Bridge navigating to:', '${route}');
            window.location.hash = '${route}';
          })();
        `;
        webViewRef.current.injectJavaScript(script);
      }

      return { success: true };
    });

    // Cart handlers
    bridge.registerHandler('addToCart', async (payload) => {
      try {
        const { product, quantity, selectedColor, selectedSize } = payload;
        await cartManager.addItem(product, quantity, selectedColor, selectedSize);

        // Notify web
        if (webViewRef.current) {
          const cart = {
            items: cartManager.getItems(),
            count: cartManager.getItemCount(),
            total: cartManager.getTotal()
          };
          const script = `
            if (window.WebBridge && window.WebBridge.emit) {
              window.WebBridge.emit('cartUpdated', ${JSON.stringify(cart)});
            }
          `;
          webViewRef.current.injectJavaScript(script);
        }

        return { success: true };
      } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('removeFromCart', async (payload) => {
      try {
        const { productId, selectedColor, selectedSize } = payload;
        await cartManager.removeItem(productId, selectedColor, selectedSize);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('updateCartQuantity', async (payload) => {
      try {
        const { productId, quantity, selectedColor, selectedSize } = payload;
        await cartManager.updateQuantity(productId, quantity, selectedColor, selectedSize);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('getCart', async () => {
      return {
        items: cartManager.getItems(),
        count: cartManager.getItemCount(),
        total: cartManager.getTotal(),
        subtotal: cartManager.getSubtotal(),
        discount: cartManager.getDiscount()
      };
    });

    bridge.registerHandler('clearCart', async () => {
      await cartManager.clear();
      return { success: true };
    });

    bridge.registerHandler('applyCoupon', async (payload) => {
      const { code } = payload;
      const validCoupons: Record<string, number> = {
        'DESCONTO10': 10,
        'PRIMEIRACOMPRA': 15,
        'BLACKFRIDAY': 20,
      };

      const discount = validCoupons[code.toUpperCase()];
      if (discount) {
        return { success: true, discount, message: `Cupom aplicado! ${discount}% de desconto` };
      } else {
        return { success: false, message: 'Cupom inválido' };
      }
    });

    // Wishlist handlers
    bridge.registerHandler('toggleWishlist', async (payload) => {
      try {
        const { product } = payload;
        const inWishlist = await wishlistManager.toggleItem(product);

        // Notify web
        if (webViewRef.current) {
          const wishlist = {
            items: wishlistManager.getItems(),
            count: wishlistManager.getItemCount()
          };
          const script = `
            if (window.WebBridge && window.WebBridge.emit) {
              window.WebBridge.emit('wishlistUpdated', ${JSON.stringify(wishlist)});
            }
          `;
          webViewRef.current.injectJavaScript(script);
        }

        return { inWishlist };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('getWishlist', async () => {
      return {
        items: wishlistManager.getItems(),
        count: wishlistManager.getItemCount()
      };
    });

    bridge.registerHandler('isInWishlist', async (payload) => {
      const { productId } = payload;
      return { inWishlist: wishlistManager.hasItem(productId) };
    });

    // Order handler
    bridge.registerHandler('createOrder', async (payload) => {
      try {
        const orderId = `ORD-${Date.now()}`;

        // Clear cart after order
        await cartManager.clear();

        // Send notification
        await notificationService.addNotification({
          type: 'order_update',
          title: 'Pedido Confirmado! 📦',
          message: `Seu pedido #${orderId} foi confirmado e está sendo preparado!`,
          orderId
        });

        return { success: true, orderId };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    // Notification handler - Native Toast
    bridge.registerHandler('showNotification', async (payload) => {
      const { title, message, color } = payload;

      // Map Mantine colors to toast types
      const typeMap: Record<string, 'success' | 'error' | 'info' | 'warning'> = {
        'green': 'success',
        'red': 'error',
        'blue': 'info',
        'yellow': 'warning',
        'orange': 'warning',
      };

      const type = typeMap[color] || 'info';

      setToast({ title, message, type });
      return { success: true };
    });

    // Storage handlers
    bridge.registerHandler('getStorageItem', async (payload) => {
      // Could use AsyncStorage here
      return { value: null };
    });

    bridge.registerHandler('setStorageItem', async (payload) => {
      // Could use AsyncStorage here
      return { success: true };
    });

    // Device info handler
    bridge.registerHandler('getDeviceInfo', async () => {
      return {
        platform: Platform.OS,
        version: Platform.Version,
        isTablet: false
      };
    });

    // Simulate flash sale notification
    setTimeout(() => {
      notificationService.simulateFlashSaleNotification();
    }, 5000);

    return () => {
      unsubCart();
    };
  }, []);

  // Handle messages from WebView
  const handleMessage = useCallback(async (event: any) => {
    try {
      console.log('Received message from WebView:', event.nativeEvent.data);
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Parsed message:', message);

      // Handle image error messages
      if (message.type === 'imageError') {
        console.error('❌ Image failed to load in WebView:', message.data.src);
        return;
      }

      // Handle test message
      if (message.type === 'test') {
        console.log('🧪 Test message received from web app!', message.data);
        return;
      }

      // Handle cart update notifications from web app
      if (message.type === 'cartUpdated') {
        console.log('✅ Cart updated from web app! New count:', message.data.count);
        setCartItemCount(message.data.count);
        console.log('✅ cartItemCount state updated to:', message.data.count);
        return;
      }

      // Handle Mobile Bridge messages
      console.log('Handling as Mobile Bridge message...');
      const response = await MobileBridge.handleMessage(message);

      // Send response back to WebView
      if (webViewRef.current) {
        const script = `
          (function() {
            if (window.WebBridge && window.WebBridge.handleNativeResponse) {
              window.WebBridge.handleNativeResponse(${JSON.stringify(response)});
            }
          })();
        `;
        webViewRef.current.injectJavaScript(script);
      }
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  }, []);

  // Handle network status change
  const handleNetworkChange = useCallback((connected: boolean) => {
    setIsOnline(connected);

    if (webViewRef.current) {
      const script = `
        (function() {
          if (window.WebBridge) {
            window.dispatchEvent(new CustomEvent('networkStatusChanged', {
              detail: { isOnline: ${connected} }
            }));
          }
        })();
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, []);

  // Navigate in React web app via hash router
  const navigateWebApp = (route: string) => {
    if (webViewRef.current) {
      const script = `
        (function() {
          console.log('Native navigating to:', '${route}');
          window.location.hash = '${route}';
        })();
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  // Tab configuration
  const tabs: TabItem[] = [
    {
      id: 'home',
      label: 'Início',
      icon: '⌂',
      onPress: () => {
        setActiveTab('home');
        navigateWebApp('/');
      },
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: '⌕',
      onPress: () => {
        setActiveTab('search');
        navigateWebApp('/search');
      },
    },
    {
      id: 'wishlist',
      label: 'Favoritos',
      icon: '♡',
      onPress: () => {
        setActiveTab('wishlist');
        navigateWebApp('/wishlist');
      },
    },
    {
      id: 'cart',
      label: 'Carrinho',
      icon: '⊞',
      badge: cartItemCount > 0 ? cartItemCount.toString() : undefined,
      onPress: () => {
        setActiveTab('cart');
        navigateWebApp('/cart');
      },
    },
  ];

  // Use React web app running on localhost for POC
  const webAppUrl = 'http://10.0.2.2:5174';

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <NetworkStatusIndicator onStatusChange={handleNetworkChange} />

        <View style={styles.webViewContainer}>
          <TurboWebView
            ref={webViewRef}
            source={{ uri: webAppUrl }}
            onMessage={handleMessage}
            onLoad={() => console.log('WebView loaded React App:', webAppUrl)}
            onError={(event) => console.error('WebView error:', event.nativeEvent)}
          />
        </View>

        <TabBar tabs={tabs} activeTabId={activeTab} />

        {/* Native Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            title={toast.title}
            type={toast.type}
            onHide={() => setToast(null)}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  webViewContainer: {
    flex: 1,
  },
});

export default App;
