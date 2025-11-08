/**
 * Embedded App - WebView with Native TabBar
 * Perfect for embedding into another application
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import TabBar, { TabItem } from './src/components/TabBar';
import { TurboWebView, NetworkStatusIndicator, Toast, MobileBridge } from 'react-native-mobile-bridge';
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

function App({ isVisible = true }: AppEmbeddedProps = {}): JSX.Element {
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [cartItemCount, setCartItemCountRaw] = useState(() => {
    return 0;
  });

  // Wrapped setState with logging to catch ALL updates
  const setCartItemCount = useCallback((value: number | ((prev: number) => number)) => {
    const newValue = typeof value === 'function' ? value(cartItemCount) : value;
    setCartItemCountRaw(newValue);
  }, [cartItemCount]);
  const [notificationShown, setNotificationShown] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const lastValidCartCount = useRef<number>(0); // Keep track of last valid count
  const bridge = MobileBridge;

  // Track all cartItemCount changes
  useEffect(() => {
  }, [cartItemCount]);

  // Safe function to update cart count - validates before setting
  const updateCartCountSafely = useCallback((newCount: number, source: string) => {

    // Special handling: WebView is the source of truth for cart in embedded mode
    if (source === 'WebView.cartUpdated') {
      setCartItemCount(newCount);
      lastValidCartCount.current = newCount;
      return;
    }

    // For other sources, check if we should use lastValid instead
    if (newCount === 0 && lastValidCartCount.current > 0) {
      setCartItemCount(lastValidCartCount.current);
      return;
    }

    // Otherwise accept the new count
    setCartItemCount(newCount);
    if (newCount > 0) {
      lastValidCartCount.current = newCount;
    }
  }, [cartItemCount]);

  // Initialize Mobile Bridge handlers
  useEffect(() => {
    const cartManager = CartManager.getInstance();
    const wishlistManager = WishlistManager.getInstance();
    const notificationService = NotificationService.getInstance();

    // Update cart count when cart changes
    const updateCartCount = () => {
      const count = cartManager.getItemCount();
      updateCartCountSafely(count, 'CartManager.subscribe');

      // Note: We don't send cartCountUpdated back to WebView because:
      // - WebView manages its own cart state
      // - WebView sends cartUpdated to us when it changes
      // - We just display the count in the native TabBar
    };

    // Initial cart count update with delay to ensure cart is loaded
    const initialTimer = setTimeout(() => {
      updateCartCount();
    }, 200);

    const unsubCart = cartManager.subscribe(updateCartCount);

    // Navigation handler - navigate React web app via hash router
    bridge.registerHandler('navigate', async (payload) => {
      const { page, params } = payload;

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
        return { success: true, cart: cartManager.getItems() };
      } catch (error: any) {
        console.error(' [Embedded] Error adding to cart:', error);
        return { success: false, error: error.message };
      }
    });

    bridge.registerHandler('removeFromCart', async (payload) => {
      try {
        const { productId, selectedColor, selectedSize, itemId } = payload;
                
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
            console.warn(' [Embedded] Item not found with itemId:', itemId);
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

        return { success: true, cart: cart.items };
      } catch (error: any) {
        console.error('[Embedded] Error updating cart quantity:', error);
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
      clearTimeout(initialTimer);
      unsubCart();
      bridge.clear();
    };
  }, [isOnline, updateCartCountSafely]);

  // Handle messages from WebView (custom messages like cartUpdated)
  const handleMessage = useCallback(async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // Handle cart update notifications from web app
      // Check both direct format {type: 'cartUpdated', data: {...}} and Mobile Bridge format {id, type, payload: {...}}
      if (message.type === 'cartUpdated') {
        
        // Handle Mobile Bridge format (with payload) or direct format (with data)
        const cartData = message.payload || message.data;
        const count = cartData?.count ?? cartData?.items?.length ?? 0;

        if (typeof count === 'number' && count >= 0) {

          // Verify with CartManager before accepting the count
          const cartManager = CartManager.getInstance();
          const currentCount = cartManager.getItemCount();

          // Use safe update function
          updateCartCountSafely(count, 'WebView.cartUpdated');
        }
        return;
      }

      // Handle other custom messages here if needed
    } catch (error) {
      console.error('[Embedded] Error handling message:', error);
    }
  }, [updateCartCountSafely]);

  const handleNetworkChange = async (online: boolean) => {
    setIsOnline(online);

    // Notify web about network status via JavaScript injection
    // if (webViewRef.current) {
    //   const script = `
    //     (function() {
    //       if (window.WebBridge) {
    //         window.dispatchEvent(new CustomEvent('networkStatusChanged', {
    //           detail: { isOnline: ${online} }
    //         }));
    //       }
    //     })();
    //   `;
    //   webViewRef.current.injectJavaScript(script);
    // }

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

    return tabItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItemCount]);

  // Debug: Log cart count changes
  useEffect(() => {
    const badge = cartItemCount > 0 ? cartItemCount.toString() : undefined;
  }, [cartItemCount]);

  // Sync cart count when component becomes visible (iOS fix)
  useEffect(() => {
    if (isVisible) {
      // Add small delay to ensure CartManager is fully loaded
      const timer = setTimeout(() => {
        const cartManager = CartManager.getInstance();
        const currentCount = cartManager.getItemCount();

        // Use safe update function
        updateCartCountSafely(currentCount, 'isVisible.sync');
      }, 100); // 100ms delay to allow async load to complete

      return () => clearTimeout(timer);
    }
  }, [isVisible, updateCartCountSafely, cartItemCount]); // Dependencies for sync

  // Simulate flash sale notification when component becomes visible (only once per session)
  // Note: In embedded mode, we assume the user is already authenticated
  // since the host app (App.TestHost.tsx) handles authentication
  useEffect(() => {
    if (isVisible && !notificationShown) {
      const notificationService = NotificationService.getInstance();
      const timer = setTimeout(() => {
        notificationService.simulateFlashSaleNotification();
        setNotificationShown(true); // Mark as shown so it won't trigger again
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, notificationShown]); // Runs when isVisible becomes true AND notification hasn't been shown

  // Configure your web app URL here
  const webAppUrl = 'http://10.0.2.2:5174';

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
