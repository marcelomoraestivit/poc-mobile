/**
 * TurboWebView - WebView with Hotwire Turbo Native and Mobile Bridge integration
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import type { WebViewProps } from 'react-native-webview';

// Define WebViewErrorEvent type if not exported
type WebViewErrorEvent = any;
import MobileBridge, { BridgeMessage, BridgeResponse } from '../bridge/MobileBridge';
import SyncManager from '../sync/SyncManager';
import NetworkManager from '../network/NetworkManager';
import OfflineStorage from '../storage/OfflineStorage';

// Polyfill URL for React Native
import 'react-native-url-polyfill/auto';

interface TurboWebViewProps {
  source: WebViewProps['source'];
  onLoad?: () => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (event: any) => void;
  onHttpError?: (event: any) => void;
  onNavigationChange?: (url: string) => void;
  onMessage?: (event: any) => void;
}

const TurboWebView = React.forwardRef<WebView, TurboWebViewProps>(({
  source,
  onLoad,
  onLoadStart,
  onLoadEnd,
  onError,
  onHttpError,
  onNavigationChange,
  onMessage: onMessageProp,
}, forwardedRef) => {
  const webViewRef = useRef<WebView>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  // Expose webView ref to parent
  React.useImperativeHandle(forwardedRef, () => webViewRef.current as WebView);

  useEffect(() => {
    // Initialize offline-first features
    NetworkManager.initialize();
    SyncManager.initialize();

    // Note: 'getDeviceInfo' handler is registered in App.Embedded
    // Removed duplicate registration to avoid conflicts

    MobileBridge.registerHandler('showAlert', async (payload: { message: string }) => {
      return await SyncManager.executeWithOffline(
        'showAlert',
        payload,
        async (data) => {
          console.log('Alert from web:', data.message);
          return { shown: true, timestamp: Date.now() };
        }
      );
    });

    MobileBridge.registerHandler('getUserData', async () => {
      return await SyncManager.executeWithOffline(
        'getUserData',
        {},
        async () => ({
          id: '12345',
          name: 'John Doe',
          email: 'john@example.com',
          lastUpdated: new Date().toISOString(),
        }),
        {
          cacheKey: 'userData',
          useCache: true,
          cacheDuration: 1000 * 60 * 10, // 10 minutes
        }
      );
    });

    // Turbo Native handlers
    MobileBridge.registerHandler('turbo.visit', async (payload: { url: string }) => {
      console.log('Turbo visit:', payload.url);
      setCurrentUrl(payload.url);
      if (onNavigationChange) {
        onNavigationChange(payload.url);
      }
      return { success: true };
    });

    // Handlers for offline status
    MobileBridge.registerHandler('getNetworkStatus', async () => {
      return {
        isOnline: NetworkManager.isConnected(),
        timestamp: Date.now(),
      };
    });

    MobileBridge.registerHandler('getPendingActions', async () => {
      const actions = await OfflineStorage.getPendingActions();
      return {
        count: actions.length,
        actions: actions.map(a => ({ id: a.id, type: a.type, timestamp: a.timestamp })),
      };
    });

    MobileBridge.registerHandler('syncNow', async () => {
      await SyncManager.syncPendingActions();
      return { synced: true };
    });

    // Handler for cart updates from WebView
    MobileBridge.registerHandler('cartUpdated', async (payload) => {
      console.log('[TurboWebView] Cart updated from web:', payload);
      // You can add additional logic here if needed (e.g., sync to backend)
      return { success: true, received: true };
    });

    return () => {
      MobileBridge.clear();
      NetworkManager.cleanup();
      SyncManager.cleanup();
    };
  }, [onNavigationChange]);

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Validate that we have at least some data
      if (!data || typeof data !== 'object') {
        console.warn('[WebView] Received invalid message data:', data);
        return;
      }

      // Check if it's a custom message type (not a Mobile Bridge message)
      // Custom messages can have 'id' (if sent via WebBridge.sendToNative) but have specific types
      // Messages sent via WebBridge.sendToNative will have: {id, type, payload}
      // Messages sent via postMessage directly will have: {type, data}
      const customMessageTypes = ['test', 'cartUpdated', 'wishlistUpdated', 'imageError'];
      const isCustomMessage = customMessageTypes.includes(data.type);

      if (isCustomMessage) {
        // Pass custom messages to parent handler if exists
        // This allows the parent (App.tsx) to handle cartUpdated, etc.
        if (onMessageProp) {
          onMessageProp(event);
        } else {
          console.warn('[TurboWebView] Custom message received but no parent handler:', data.type);
        }
        // Don't process as Mobile Bridge message
        return;
      }

      // Check if it's a response to a native message
      if (data.id && data.id.startsWith('native_')) {
        MobileBridge.handleResponse(data as BridgeResponse);
        return;
      }

      // Validate Mobile Bridge message format
      if (!data.id || !data.type) {
        console.warn('[WebView] Received message missing required fields (id or type):', data);
        return;
      }

      // Handle message from web via Mobile Bridge
      const message = data as BridgeMessage;
      const response = await MobileBridge.handleMessage(message);

      // Send response back to web with sanitization
      // Note: We need to send the response back because MobileBridge.handleMessage() only
      // processes the message and returns the response object, it doesn't send it back to WebView.
      // MobileBridge.sendToWeb() is used for NATIVE -> WEB messages (initiated by React Native).
      // This flow is WEB -> NATIVE -> WEB (response to WebView's request).
      const { BridgeSecurity } = require('../utils/BridgeSecurity');
      const sanitized = BridgeSecurity.sanitizeForInjection(response);

      const script = `
        (function() {
          try {
            if (window.WebBridge && window.WebBridge.handleNativeResponse) {
              var response = JSON.parse("${sanitized}");
              window.WebBridge.handleNativeResponse(response);
            }
          } catch (error) {
            console.error('[TurboWebView] Error handling response:', error);
          }
        })();
      `;

      webViewRef.current?.injectJavaScript(script);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  };

  // Inject Mobile Bridge + Turbo Native helpers
  const injectedJavaScript = `
    (function() {
      // Debug image loading
      console.log('=== Image Loading Debug Started ===');

      // Monitor all image errors
      document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
          console.error('Image failed to load:', e.target.src);
          console.error('Image error details:', {
            src: e.target.src,
            alt: e.target.alt,
            naturalWidth: e.target.naturalWidth,
            naturalHeight: e.target.naturalHeight
          });
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'imageError',
            data: { src: e.target.src, error: 'Failed to load' }
          }));
        }
      }, true);

      // Monitor successful image loads
      document.addEventListener('load', function(e) {
        if (e.target.tagName === 'IMG') {
          console.log('Image loaded successfully:', e.target.src);
        }
      }, true);

      // Check CSP
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (metaCSP) {
        console.log('CSP Found:', metaCSP.content);
      } else {
        console.log('No CSP meta tag found');
      }

      // Initialize WebBridge
      window.WebBridge = {
        pendingCallbacks: new Map(),
        handlers: new Map(),
        messageId: 0,

        sendToNative: function(type, payload) {
          return new Promise((resolve, reject) => {
            const id = 'web_' + this.messageId++;
            const message = { id, type, payload };

            this.pendingCallbacks.set(id, { resolve, reject });
            window.ReactNativeWebView.postMessage(JSON.stringify(message));
          });
        },

        handleNativeMessage: function(message) {
          const handler = this.handlers.get(message.type);
          if (!handler) {
            const response = {
              id: message.id,
              success: false,
              error: 'No handler registered for message type: ' + message.type
            };
            window.ReactNativeWebView.postMessage(JSON.stringify(response));
            return;
          }

          Promise.resolve(handler(message.payload))
            .then(data => {
              const response = { id: message.id, success: true, data };
              window.ReactNativeWebView.postMessage(JSON.stringify(response));
            })
            .catch(error => {
              const response = {
                id: message.id,
                success: false,
                error: error.message || 'Unknown error'
              };
              window.ReactNativeWebView.postMessage(JSON.stringify(response));
            });
        },

        handleNativeResponse: function(response) {
          const callback = this.pendingCallbacks.get(response.id);
          if (callback) {
            this.pendingCallbacks.delete(response.id);
            if (response.success) {
              callback.resolve(response.data);
            } else {
              callback.reject(new Error(response.error || 'Unknown error'));
            }
          }
        },

        registerHandler: function(type, handler) {
          this.handlers.set(type, handler);
        }
      };

      // Turbo Native helpers
      window.TurboNative = {
        visit: function(url) {
          return window.WebBridge.sendToNative('turbo.visit', { url: url });
        },

        isNativeApp: true,

        // Helper to check if running in native
        isAvailable: function() {
          return true;
        }
      };

      console.log('WebBridge and TurboNative initialized');
    })();
    true;
  `;

  return (
    <WebView
      ref={webViewRef}
      source={source}
      style={styles.webview}
      onMessage={handleMessage}
      onLoad={onLoad}
      onError={onError}
      onNavigationStateChange={(navState: any) => {
        setCurrentUrl(navState.url);
        if (onNavigationChange) {
          onNavigationChange(navState.url);
        }
      }}
      injectedJavaScript={injectedJavaScript}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      allowsBackForwardNavigationGestures={true}
      sharedCookiesEnabled={true}
      mixedContentMode="always"
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      cacheEnabled={true}
      cacheMode="LOAD_DEFAULT"
      androidLayerType="hardware"
      overScrollMode="never"
      thirdPartyCookiesEnabled={true}
    />
  );
});

TurboWebView.displayName = 'TurboWebView';

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default TurboWebView;
