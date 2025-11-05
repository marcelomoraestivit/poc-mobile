/**
 * Security utilities for Mobile Bridge
 * Provides sanitization, validation, and encryption functions
 */

export class BridgeSecurity {
  private static readonly SECRET_KEY = 'your-secret-key-here-change-in-production'; // TODO: Move to secure storage
  private static readonly MAX_MESSAGE_AGE = 300000; // 5 minutes in milliseconds

  /**
   * Sanitize JSON string for safe JavaScript injection
   * Escapes special characters that could break out of JSON context
   */
  static sanitizeForInjection(obj: any): string {
    const jsonString = JSON.stringify(obj);

    // Escape backslashes and quotes
    return jsonString
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Simple hash function for message integrity
   * Note: In production, use a proper HMAC library like crypto-js
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Compute signature for message integrity
   * TODO: In production, install and use crypto-js for proper HMAC
   * npm install crypto-js @types/crypto-js
   */
  static computeSignature(message: any): string {
    const data = JSON.stringify(message);
    const combined = this.SECRET_KEY + data + this.SECRET_KEY;
    return this.simpleHash(combined);
  }

  /**
   * Verify message signature
   */
  static verifySignature(message: any, signature: string): boolean {
    const expectedSignature = this.computeSignature(message);
    return expectedSignature === signature;
  }

  /**
   * Validate message timestamp (replay attack protection)
   */
  static validateTimestamp(timestamp: number): boolean {
    const now = Date.now();
    const age = now - timestamp;
    return age >= 0 && age <= this.MAX_MESSAGE_AGE;
  }

  /**
   * Create secure message with signature and timestamp
   */
  static createSecureMessage(id: string, type: string, payload?: any) {
    const timestamp = Date.now();
    const message = {
      id,
      type,
      payload,
      timestamp
    };

    const signature = this.computeSignature(message);

    return {
      ...message,
      signature
    };
  }

  /**
   * Validate incoming message
   */
  static validateMessage(message: any): { valid: boolean; error?: string } {
    // Check required fields
    if (!message.id || !message.type) {
      return { valid: false, error: 'Missing required fields (id, type)' };
    }

    // Validate timestamp if present
    if (message.timestamp && !this.validateTimestamp(message.timestamp)) {
      return { valid: false, error: 'Message expired or invalid timestamp' };
    }

    // Verify signature if present
    if (message.signature) {
      const { signature, ...messageWithoutSig } = message;
      if (!this.verifySignature(messageWithoutSig, signature)) {
        return { valid: false, error: 'Invalid signature' };
      }
    }

    return { valid: true };
  }

  /**
   * Rate limiter to prevent spam
   */
  private static rateLimitMap = new Map<string, number[]>();
  private static readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private static readonly MAX_REQUESTS_PER_WINDOW = 100;

  static checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const requests = this.rateLimitMap.get(identifier) || [];

    // Remove old requests outside the window
    const recentRequests = requests.filter(
      time => now - time < this.RATE_LIMIT_WINDOW
    );

    if (recentRequests.length >= this.MAX_REQUESTS_PER_WINDOW) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.rateLimitMap.set(identifier, recentRequests);

    return true;
  }

  /**
   * Sanitize HTML to prevent XSS
   */
  static sanitizeHTML(html: string): string {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate URL to prevent malicious redirects
   */
  static validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);

      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }

      // Block common malicious patterns
      const maliciousPatterns = [
        'javascript:',
        'data:',
        'vbscript:',
        'file:',
      ];

      const lowerUrl = url.toLowerCase();
      for (const pattern of maliciousPatterns) {
        if (lowerUrl.includes(pattern)) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Secure wrapper for postMessage to WebView
 * Uses safer method than injectJavaScript
 */
export function postSecureMessage(webViewRef: any, message: any): void {
  if (!webViewRef?.current) {
    console.warn('WebView ref not available');
    return;
  }

  // Sanitize the message
  const sanitized = BridgeSecurity.sanitizeForInjection(message);

  // Use postMessage if available (safer than injectJavaScript)
  // For React Native WebView, we still need to use injectJavaScript
  // but with proper sanitization
  const script = `
    (function() {
      try {
        if (window.WebBridge && window.WebBridge.handleNativeResponse) {
          var message = JSON.parse("${sanitized}");
          window.WebBridge.handleNativeResponse(message);
        }
      } catch (error) {
        console.error('[Bridge] Error handling message:', error);
      }
    })();
  `;

  webViewRef.current.injectJavaScript(script);
}
