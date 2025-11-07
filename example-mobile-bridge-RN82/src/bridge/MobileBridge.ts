/**
 * Mobile Bridge - Communication layer between WebView and React Native
 * Based on Shopify's MobileBridge pattern with security enhancements
 */

import { BridgeSecurity } from '../utils/BridgeSecurity';

export interface BridgeMessage {
  id: string;
  type: string;
  payload?: any;
  timestamp?: number;
  signature?: string;
}

export interface BridgeResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: number;
}

export type MessageHandler = (payload: any) => Promise<any> | any;

class MobileBridge {
  private handlers: Map<string, MessageHandler> = new Map();
  private pendingCallbacks: Map<string, {
    callback: (response: BridgeResponse) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private messageId = 0;
  private readonly MESSAGE_TIMEOUT = 30000; // 30 seconds

  /**
   * Register a handler for a specific message type
   */
  registerHandler(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Unregister a handler
   */
  unregisterHandler(type: string): void {
    this.handlers.delete(type);
  }

  /**
   * Handle incoming messages from WebView with security validation
   */
  async handleMessage(message: BridgeMessage): Promise<BridgeResponse> {
    // Basic structure validation before security checks
    if (!message || typeof message !== 'object') {
      return {
        id: 'unknown',
        success: false,
        error: 'Invalid message structure',
        timestamp: Date.now(),
      };
    }

    if (!message.id || !message.type) {
      return {
        id: message.id || 'unknown',
        success: false,
        error: 'Missing required fields (id, type)',
        timestamp: Date.now(),
      };
    }

    // Validate message structure and security
    const validation = BridgeSecurity.validateMessage(message);
    if (!validation.valid) {
      return {
        id: message.id,
        success: false,
        error: `Security validation failed: ${validation.error}`,
        timestamp: Date.now(),
      };
    }

    // Check rate limit
    if (!BridgeSecurity.checkRateLimit(message.type)) {
      return {
        id: message.id,
        success: false,
        error: 'Rate limit exceeded',
        timestamp: Date.now(),
      };
    }

    const handler = this.handlers.get(message.type);

    if (!handler) {
      return {
        id: message.id,
        success: false,
        error: `No handler registered for message type: ${message.type}`,
        timestamp: Date.now(),
      };
    }

    try {
      const data = await handler(message.payload);
      return {
        id: message.id,
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[Bridge] Handler error:', error);
      return {
        id: message.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Send a message to the WebView with security
   */
  sendToWeb(
    webViewRef: any,
    type: string,
    payload?: any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = `native_${this.messageId++}`;

      // Reset messageId if it gets too large (prevent overflow)
      if (this.messageId > 1000000) {
        this.messageId = 0;
      }

      // Create secure message with timestamp
      const message = BridgeSecurity.createSecureMessage(id, type, payload);

      // Set timeout to prevent memory leaks
      const timeout = setTimeout(() => {
        this.pendingCallbacks.delete(id);
        reject(new Error('Message timeout'));
      }, this.MESSAGE_TIMEOUT);

      // Store callback for response with timeout
      this.pendingCallbacks.set(id, {
        callback: (response: BridgeResponse) => {
          clearTimeout(timeout);
          this.pendingCallbacks.delete(id);
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        },
        timeout,
      });

      // Send message to WebView with sanitization
      const sanitized = BridgeSecurity.sanitizeForInjection(message);
      const script = `
        (function() {
          try {
            if (window.WebBridge && window.WebBridge.handleNativeMessage) {
              var message = JSON.parse("${sanitized}");
              window.WebBridge.handleNativeMessage(message);
            }
          } catch (error) {
            console.error('[Bridge] Error sending message:', error);
          }
        })();
      `;

      if (webViewRef?.current) {
        webViewRef.current.injectJavaScript(script);
      } else {
        clearTimeout(timeout);
        this.pendingCallbacks.delete(id);
        reject(new Error('WebView ref not available'));
      }
    });
  }

  /**
   * Handle response from WebView
   */
  handleResponse(response: BridgeResponse): void {
    const entry = this.pendingCallbacks.get(response.id);
    if (entry) {
      clearTimeout(entry.timeout);
      entry.callback(response);
    }
  }

  /**
   * Clear all handlers and pending callbacks
   */
  clear(): void {
    // Clear all timeouts before clearing
    this.pendingCallbacks.forEach(entry => {
      clearTimeout(entry.timeout);
    });

    this.handlers.clear();
    this.pendingCallbacks.clear();
  }
}

export default new MobileBridge();
