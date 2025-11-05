/**
 * TurboWebView - WebView with Hotwire Turbo Native and Mobile Bridge integration
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent, WebViewErrorEvent } from 'react-native-webview';
import type { WebViewProps } from 'react-native-webview';
import MobileBridge, { BridgeMessage, BridgeResponse } from '../bridge/MobileBridge';
import SyncManager from '../sync/SyncManager';
import NetworkManager from '../network/NetworkManager';
import OfflineStorage from '../storage/OfflineStorage';

// Polyfill URL for React Native
import 'react-native-url-polyfill/auto';

interface TurboWebViewProps {
  source: WebViewProps['source'];
  onLoad?: () => void;
  onError?: (event: WebViewErrorEvent) => void;
  onNavigationChange?: (url: string) => void;
  onMessage?: (event: WebViewMessageEvent) => void;
}

const TurboWebView = React.forwardRef<WebView, TurboWebViewProps>(({
  source,
  onLoad,
  onError,
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

    // Register native handlers for Mobile Bridge with offline support
    MobileBridge.registerHandler('getDeviceInfo', async () => {
      return await SyncManager.executeWithOffline(
        'getDeviceInfo',
        {},
        async () => ({
          platform: 'react-native',
          timestamp: new Date().toISOString(),
          userAgent: 'TurboNative',
          isOnline: NetworkManager.isConnected(),
        }),
        {
          cacheKey: 'deviceInfo',
          useCache: true,
          cacheDuration: 1000 * 60 * 5, // 5 minutes
        }
      );
    });

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

    return () => {
      MobileBridge.clear();
      NetworkManager.cleanup();
      SyncManager.cleanup();
    };
  }, [onNavigationChange]);

  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // Check if it's a custom message type (not a Mobile Bridge message)
      // Custom messages don't have 'id' field or have types like 'test', 'cartUpdated', etc.
      const isCustomMessage = !data.id || ['test', 'cartUpdated', 'wishlistUpdated'].includes(data.type);

      if (isCustomMessage && onMessageProp) {
        // Pass custom messages to parent handler
        onMessageProp(event);
        return;
      }

      // Check if it's a response to a native message
      if (data.id && data.id.startsWith('native_')) {
        MobileBridge.handleResponse(data as BridgeResponse);
        return;
      }

      // Handle message from web via Mobile Bridge
      const message = data as BridgeMessage;
      const response = await MobileBridge.handleMessage(message);

      // Send response back to web with sanitization
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
      onNavigationStateChange={(navState) => {
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
      androidHardwareAccelerationDisabled={false}
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
