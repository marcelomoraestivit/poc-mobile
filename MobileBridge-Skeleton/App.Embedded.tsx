/**
 * Mobile Bridge Skeleton - Embedded Mode
 *
 * Este modo é ideal para incorporar o WebView dentro de uma
 * aplicação React Native existente como uma tela adicional.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TurboWebView from './src/components/TurboWebView';
import NetworkStatusIndicator from './src/components/NetworkStatusIndicator';
import Toast from './src/components/Toast';
import MobileBridge from './src/bridge/MobileBridge';
import NetworkManager from './src/network/NetworkManager';
import SyncManager from './src/sync/SyncManager';

interface ToastData {
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppEmbeddedProps {
  isVisible?: boolean; // Optional prop to control visibility
  webAppUrl?: string; // Optional URL override
  onBack?: () => void; // Optional callback for back navigation
}

function AppEmbedded({
  isVisible = true,
  webAppUrl = 'http://10.0.2.2:3000',
  onBack,
}: AppEmbeddedProps = {}): React.JSX.Element {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const webViewRef = useRef<any>(null);

  // Initialize services
  useEffect(() => {
    NetworkManager.initialize();
    SyncManager.initialize();

    return () => {
      NetworkManager.cleanup();
      SyncManager.cleanup();
    };
  }, []);

  // Initialize Mobile Bridge handlers
  useEffect(() => {
    // Navigation handler
    MobileBridge.registerHandler('navigate', async (payload) => {
      const { page, params } = payload;
      console.log('Navigate to:', page, params);

      // Implemente sua lógica de navegação aqui
      // Pode usar hash router ou stack navigator

      return { success: true };
    });

    // Notification handler
    MobileBridge.registerHandler('showNotification', async (payload) => {
      const { title, message, type = 'info' } = payload;
      setToast({ title, message, type });
      return { success: true };
    });

    // Device info handler
    MobileBridge.registerHandler('getDeviceInfo', async () => {
      return {
        platform: 'react-native',
        isOnline,
        timestamp: new Date().toISOString(),
      };
    });

    // Adicione seus próprios handlers aqui
    // MobileBridge.registerHandler('yourHandler', async (payload) => {
    //   // Sua lógica aqui
    //   return { success: true, data: 'seu retorno' };
    // });

    return () => {
      MobileBridge.clear();
    };
  }, [isOnline]);

  // Handle messages from WebView
  const handleMessage = useCallback(async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('[Embedded] Message from WebView:', message);

      // Handle Mobile Bridge messages
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
      console.error('[Embedded] Error handling message:', error);
    }
  }, []);

  // Handle network status change
  const handleNetworkChange = useCallback(async (online: boolean) => {
    setIsOnline(online);

    // Notify WebView about network status using Mobile Bridge
    try {
      await MobileBridge.sendToWeb(webViewRef, 'networkChange', { isOnline: online });
    } catch (error) {
      console.warn('[Bridge] Failed to notify web about network change:', error);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        {/* Optional: Network Status Indicator */}
        <NetworkStatusIndicator onStatusChange={handleNetworkChange} />

        {/* WebView */}
        <View style={styles.webViewContainer}>
          <TurboWebView
            ref={webViewRef}
            source={{ uri: webAppUrl }}
            onLoad={() => console.log('[Embedded] WebView loaded:', webAppUrl)}
            onError={(event) => console.error('[Embedded] WebView error:', event.nativeEvent)}
            onMessage={handleMessage}
          />
        </View>

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

export default AppEmbedded;
