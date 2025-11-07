/**
 * Mobile Bridge Skeleton - Standalone App
 *
 * Este é um exemplo simplificado de como usar o Mobile Bridge
 * em uma aplicação standalone.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

function App(): React.JSX.Element {
  const [isOnline, setIsOnline] = useState(true);
  const [toast, setToast] = useState<ToastData | null>(null);
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
    // Exemplo: Handler de navegação
    MobileBridge.registerHandler('navigate', async (payload) => {
      const { page, params } = payload;
      console.log('Navigate to:', page, params);

      // Implemente sua lógica de navegação aqui

      return { success: true };
    });

    // Exemplo: Handler de notificação
    MobileBridge.registerHandler('showNotification', async (payload) => {
      const { title, message, type = 'info' } = payload;
      setToast({ title, message, type });
      return { success: true };
    });

    // Exemplo: Handler para obter informações do dispositivo
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
      console.log('Message from WebView:', message);

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
      console.error('Error handling message:', error);
    }
  }, []);

  // Handle network status change
  const handleNetworkChange = useCallback((connected: boolean) => {
    setIsOnline(connected);

    // Notify WebView about network status change
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

  // Configure your web app URL here
  const webAppUrl = 'http://10.0.2.2:3000'; // Change to your URL

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <NetworkStatusIndicator onStatusChange={handleNetworkChange} />

        <View style={styles.webViewContainer}>
          <TurboWebView
            ref={webViewRef}
            source={{ uri: webAppUrl }}
            onMessage={handleMessage}
            onLoadStart={() => console.log('[WebView] Load started:', webAppUrl)}
            onLoad={() => console.log('[WebView] Load completed:', webAppUrl)}
            onLoadEnd={() => console.log('[WebView] Load ended')}
            onError={(event) => console.error('[WebView] ERROR:', event.nativeEvent)}
            onHttpError={(event) => console.error('[WebView] HTTP ERROR:', event.nativeEvent)}
          />
        </View>

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
