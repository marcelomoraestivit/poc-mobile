/**
 * Embedded App - WebView with Native TabBar
 * Perfect for embedding into another application
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
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

interface AppEmbeddedProps {
  isVisible?: boolean; // Optional prop to control notification timing
}

function App({ isVisible = true }: AppEmbeddedProps = {}): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [notificationShown, setNotificationShown] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const bridge = MobileBridge;

  // Initialize Mobile Bridge handlers
  useEffect(() => {
    const cartManager = CartManager.getInstance();
    const wishlistManager = WishlistManager.getInstance();
    const notificationService = NotificationService.getInstance();

    // Update cart count when cart changes
    const updateCartCount = () => {
      const count = cartManager.getItemCount();
      setCartItemCount(count);

      // Notify WebView about cart count change
      // This ensures the TabBar inside WebView stays in sync
      if (webViewRef.current && count >= 0) {
        try {
          bridge.sendToWeb(webViewRef, 'cartCountUpdated', { count });
        } catch (error) {
          console.warn('[Embedded] Failed to notify web about cart count:', error);
        }
      }
    };
    updateCartCount();
    const unsubCart = cartManager.subscribe(updateCartCount);

    // Navigation handler - navigate React web app via hash router
    bridge.registerHandler('navigate', async (payload) => {
      const { page, params } = payload;
      console.log('[Embedded] Navigate to:', page, params);

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

        // Notify web about cart update
        const cart = {
          items: cartManager.getItems(),
          count: cartManager.getItemCount(),
          total: cartManager.getTotal()
        };

        // Send notification to WebView via direct postMessage (for cartUpdated compatibility)
        if (webViewRef.current) {
          const script = `
            (function() {
              // Send via WebBridge.emit if available
              if (window.WebBridge && window.WebBridge.emit) {
                window.WebBridge.emit('cartUpdated', ${JSON.stringify(cart)});
              }
              // Also send via postMessage for compatibility
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'cartUpdated',
                  data: ${JSON.stringify(cart)}
                }));
              }
            })();
          `;
          webViewRef.current.injectJavaScript(script);
        }

        // Also try Mobile Bridge (for other handlers)
        try {
          await bridge.sendToWeb(webViewRef, 'cartUpdated', cart);
        } catch (error) {
          console.warn('[Embedded] Failed to notify web via Mobile Bridge:', error);
        }

        setToast({
          title: 'Adicionado!',
          message: `${product.name} foi adicionado ao carrinho`,
          type: 'success'
        });

        console.log('✅ [Embedded] Item added to cart. New count:', cart.count);
        return { success: true, cart: cartManager.getItems() };
      } catch (error: any) {
        console.error('❌ [Embedded] Error adding to cart:', error);
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('removeFromCart', async (payload) => {
      try {
        const { productId, selectedColor, selectedSize, itemId } = payload;
        
        console.log('🛒 [Embedded] Removing item from cart:', { productId, selectedColor, selectedSize, itemId });
        
        // If itemId is provided, remove by itemId (more specific)
        // Otherwise use productId + color + size
        if (itemId) {
          const items = cartManager.getItems();
          const itemToRemove = items.find(item => item.productId === itemId || item.product?.id === itemId);
          if (itemToRemove) {
            await cartManager.removeItem(
              itemToRemove.productId,
              itemToRemove.selectedColor,
              itemToRemove.selectedSize
            );
          } else {
            console.warn('⚠️ [Embedded] Item not found with itemId:', itemId);
            await cartManager.removeItem(productId || itemId, selectedColor, selectedSize);
          }
        } else {
          await cartManager.removeItem(productId, selectedColor, selectedSize);
        }

        // Notify web about cart update
        const cart = {
          items: cartManager.getItems(),
          count: cartManager.getItemCount(),
          total: cartManager.getTotal()
        };

        if (webViewRef.current) {
          const script = `
            (function() {
              if (window.WebBridge && window.WebBridge.emit) {
                window.WebBridge.emit('cartUpdated', ${JSON.stringify(cart)});
              }
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'cartUpdated',
                  data: ${JSON.stringify(cart)}
                }));
              }
            })();
          `;
          webViewRef.current.injectJavaScript(script);
        }

        console.log('✅ [Embedded] Item removed from cart. New count:', cart.count);
        return { success: true, cart: cart.items };
      } catch (error: any) {
        console.error('❌ [Embedded] Error removing from cart:', error);
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('updateCartQuantity', async (payload) => {
      try {
        const { productId, quantity, selectedColor, selectedSize } = payload;
        await cartManager.updateQuantity(productId, quantity, selectedColor, selectedSize);

        // Notify web about cart update
        const cart = {
          items: cartManager.getItems(),
          count: cartManager.getItemCount(),
          total: cartManager.getTotal()
        };

        if (webViewRef.current) {
          const script = `
            (function() {
              if (window.WebBridge && window.WebBridge.emit) {
                window.WebBridge.emit('cartUpdated', ${JSON.stringify(cart)});
              }
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'cartUpdated',
                  data: ${JSON.stringify(cart)}
                }));
              }
            })();
          `;
          webViewRef.current.injectJavaScript(script);
        }

        console.log('✅ [Embedded] Cart quantity updated. New count:', cart.count);
        return { success: true, cart: cart.items };
      } catch (error: any) {
        console.error('❌ [Embedded] Error updating cart quantity:', error);
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('getCart', async () => {
      return {
        items: cartManager.getItems(),
        count: cartManager.getItemCount(),
        total: cartManager.getTotal()
      };
    });

    bridge.registerHandler('clearCart', async () => {
      await cartManager.clear();

      // Notify web about cart update
      const cart = {
        items: [],
        count: 0,
        total: 0
      };

      if (webViewRef.current) {
        const script = `
          (function() {
            if (window.WebBridge && window.WebBridge.emit) {
              window.WebBridge.emit('cartUpdated', ${JSON.stringify(cart)});
            }
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'cartUpdated',
                data: ${JSON.stringify(cart)}
              }));
            }
          })();
        `;
        webViewRef.current.injectJavaScript(script);
      }

      console.log('✅ [Embedded] Cart cleared');
      return { success: true };
    });

    // Wishlist handlers
    bridge.registerHandler('addToWishlist', async (payload) => {
      try {
        const { product } = payload;
        await wishlistManager.addItem(product);

        setToast({
          title: 'Favoritado!',
          message: `${product.name} foi adicionado aos favoritos`,
          type: 'success'
        });

        return { success: true, wishlist: wishlistManager.getItems() };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('removeFromWishlist', async (payload) => {
      try {
        const { productId } = payload;
        await wishlistManager.removeItem(productId);
        return { success: true, wishlist: wishlistManager.getItems() };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('getWishlist', async () => {
      return { items: wishlistManager.getItems() };
    });

    bridge.registerHandler('isInWishlist', async (payload) => {
      const { productId } = payload;
      return { inWishlist: wishlistManager.hasItem(productId) };
    });

    // Notification handler
    bridge.registerHandler('showNotification', async (payload) => {
      const { title, message, type = 'info' } = payload;
      setToast({ title, message, type });
      return { success: true };
    });

    // Device info
    bridge.registerHandler('getDeviceInfo', async () => {
      return {
        platform: 'react-native',
        isOnline,
        timestamp: new Date().toISOString(),
      };
    });

    return () => {
      unsubCart();
      bridge.clear();
    };
  }, [isOnline]);

  // Handle messages from WebView (custom messages like cartUpdated)
  const handleMessage = useCallback(async (event: any) => {
    try {
      console.log('📨 [Embedded] Received raw message from WebView:', event.nativeEvent.data);
      const message = JSON.parse(event.nativeEvent.data);
      console.log('📨 [Embedded] Parsed message:', JSON.stringify(message, null, 2));
      
      // Handle cart update notifications from web app
      // Check both direct format {type: 'cartUpdated', data: {...}} and Mobile Bridge format {id, type, payload: {...}}
      if (message.type === 'cartUpdated') {
        console.log('🛒 [Embedded] Cart update message detected!');
        console.log('🛒 [Embedded] Message structure:', {
          hasId: !!message.id,
          hasData: !!message.data,
          hasPayload: !!message.payload,
          type: message.type
        });
        
        // Handle Mobile Bridge format (with payload) or direct format (with data)
        const cartData = message.payload || message.data;
        const count = cartData?.count ?? cartData?.items?.length ?? 0;
        
        if (typeof count === 'number' && count >= 0) {
          console.log('✅ [Embedded] Cart updated from web app! New count:', count);
          console.log('✅ [Embedded] Setting cartItemCount to:', count);
          setCartItemCount(count);
          console.log('✅ [Embedded] cartItemCount state updated successfully');
          
          // Sync with CartManager
          const cartManager = CartManager.getInstance();
          const currentCount = cartManager.getItemCount();
          if (currentCount !== count) {
            console.log('⚠️ [Embedded] Cart count mismatch - WebView:', count, 'Native CartManager:', currentCount);
            // The WebView is the source of truth here, so we trust its count
            // The CartManager will be updated when items are added via native handlers
          }
        } else {
          console.warn('⚠️ [Embedded] Cart update message received but count is invalid:', {
            count,
            cartData,
            messageData: message.data,
            messagePayload: message.payload
          });
        }
        return;
      }

      // Handle other custom messages here if needed
    } catch (error) {
      console.error('❌ [Embedded] Error handling message:', error);
    }
  }, []);

  const handleNetworkChange = async (online: boolean) => {
    setIsOnline(online);

    // Notify web about network status using Mobile Bridge (correct way)
    try {
      await bridge.sendToWeb(webViewRef, 'networkChange', { isOnline: online });
    } catch (error) {
      console.warn('[Bridge] Failed to notify web about network change:', error);
    }
  };

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
  const tabs: TabItem[] = React.useMemo(() => {
    const tabItems: TabItem[] = [
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

    console.log('📱 [Embedded] Tabs configured:', tabItems.map(t => ({ id: t.id, badge: t.badge })));
    return tabItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItemCount]);

  // Debug: Log cart count changes
  useEffect(() => {
    console.log('🛒 [Embedded] Cart item count changed:', cartItemCount);
    const badge = cartItemCount > 0 ? cartItemCount.toString() : undefined;
    console.log('🛒 [Embedded] Cart tab badge will be:', badge);
  }, [cartItemCount]);

  // Simulate flash sale notification when component becomes visible (only once per session)
  // Note: In embedded mode, we assume the user is already authenticated
  // since the host app (App.TestHost.tsx) handles authentication
  useEffect(() => {
    if (isVisible && !notificationShown) {
      const notificationService = NotificationService.getInstance();
      const timer = setTimeout(() => {
        console.log('[Embedded] Triggering flash sale notification (first time only)...');
        notificationService.simulateFlashSaleNotification();
        setNotificationShown(true); // Mark as shown so it won't trigger again
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, notificationShown]); // Runs when isVisible becomes true AND notification hasn't been shown

  // Configure your web app URL here
  const webAppUrl = 'http://localhost:5174';

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* Optional: Network Status Indicator */}
        <NetworkStatusIndicator onStatusChange={handleNetworkChange} />

        {/* WebView with TabBar */}
        <View style={styles.webViewContainer}>
          <TurboWebView
            ref={webViewRef}
            source={{ uri: webAppUrl }}
            onLoad={() => console.log('[Embedded] WebView loaded:', webAppUrl)}
            onError={(event) => console.error('[Embedded] WebView error:', event.nativeEvent)}
            onMessage={handleMessage}
          />
        </View>

        {/* Native TabBar */}
        <TabBar tabs={tabs} activeTabId={activeTab} />

        {/* Native Toast Notifications */}
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
