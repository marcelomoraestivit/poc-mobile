/**
 * Analytics Service
 * Track user actions, page views, and events
 *
 * TODO: Integrate with Firebase Analytics or similar service
 * npm install @react-native-firebase/analytics
 */

import { Product, CartItem } from '../types';

export enum AnalyticsEvent {
  PAGE_VIEW = 'page_view',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  VIEW_PRODUCT = 'view_product',
  BEGIN_CHECKOUT = 'begin_checkout',
  PURCHASE = 'purchase',
  SEARCH = 'search',
  WISHLIST_ADD = 'add_to_wishlist',
  WISHLIST_REMOVE = 'remove_from_wishlist',
  APPLY_COUPON = 'apply_coupon',
  SHARE = 'share',
}

interface EventParams {
  [key: string]: string | number | boolean | undefined;
}

export class AnalyticsService {
  private static enabled = true;
  private static userId?: string;
  private static events: Array<{
    event: string;
    params?: EventParams;
    timestamp: number;
  }> = [];

  /**
   * Initialize analytics
   */
  static async initialize(): Promise<void> {
    // TODO: Initialize Firebase Analytics or other service
    // import analytics from '@react-native-firebase/analytics';
    // await analytics().setAnalyticsCollectionEnabled(true);

    console.log('[Analytics] Service initialized');
  }

  /**
   * Set user ID
   */
  static async setUserId(userId: string): Promise<void> {
    this.userId = userId;

    // TODO: Set user ID in analytics service
    // await analytics().setUserId(userId);

    console.log('[Analytics] User ID set:', userId);
  }

  /**
   * Set user properties
   */
  static async setUserProperties(properties: Record<string, string>): Promise<void> {
    // TODO: Set user properties
    // await analytics().setUserProperties(properties);

    console.log('[Analytics] User properties set:', properties);
  }

  /**
   * Enable/disable analytics
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Track custom event
   */
  static async logEvent(
    event: string,
    params?: EventParams
  ): Promise<void> {
    if (!this.enabled) return;

    // Store event locally
    this.events.push({
      event,
      params,
      timestamp: Date.now(),
    });

    // TODO: Send to analytics service
    // await analytics().logEvent(event, params);

    console.log('[Analytics] Event:', event, params);
  }

  /**
   * Track page view
   */
  static async trackPageView(pageName: string, params?: EventParams): Promise<void> {
    await this.logEvent(AnalyticsEvent.PAGE_VIEW, {
      page_name: pageName,
      timestamp: Date.now(),
      user_id: this.userId,
      ...params,
    });
  }

  /**
   * Track product view
   */
  static async trackProductView(product: Product): Promise<void> {
    await this.logEvent(AnalyticsEvent.VIEW_PRODUCT, {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      discount: product.discount || 0,
    });
  }

  /**
   * Track add to cart
   */
  static async trackAddToCart(
    product: Product,
    quantity: number,
    color?: string,
    size?: string
  ): Promise<void> {
    await this.logEvent(AnalyticsEvent.ADD_TO_CART, {
      item_id: product.id,
      item_name: product.name,
      item_category: product.category,
      price: product.price,
      quantity,
      currency: 'BRL',
      value: product.price * quantity,
      color,
      size,
    });
  }

  /**
   * Track remove from cart
   */
  static async trackRemoveFromCart(
    product: Product,
    quantity: number
  ): Promise<void> {
    await this.logEvent(AnalyticsEvent.REMOVE_FROM_CART, {
      item_id: product.id,
      item_name: product.name,
      quantity,
      value: product.price * quantity,
    });
  }

  /**
   * Track begin checkout
   */
  static async trackBeginCheckout(
    items: CartItem[],
    total: number
  ): Promise<void> {
    await this.logEvent(AnalyticsEvent.BEGIN_CHECKOUT, {
      currency: 'BRL',
      value: total,
      items_count: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }

  /**
   * Track purchase
   */
  static async trackPurchase(
    orderId: string,
    items: CartItem[],
    total: number,
    couponCode?: string
  ): Promise<void> {
    await this.logEvent(AnalyticsEvent.PURCHASE, {
      transaction_id: orderId,
      currency: 'BRL',
      value: total,
      items_count: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      coupon: couponCode,
      // Include item details
      items: JSON.stringify(
        items.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        }))
      ),
    });
  }

  /**
   * Track search
   */
  static async trackSearch(
    query: string,
    resultsCount: number
  ): Promise<void> {
    await this.logEvent(AnalyticsEvent.SEARCH, {
      search_term: query,
      results_count: resultsCount,
    });
  }

  /**
   * Track wishlist action
   */
  static async trackWishlistAdd(product: Product): Promise<void> {
    await this.logEvent(AnalyticsEvent.WISHLIST_ADD, {
      item_id: product.id,
      item_name: product.name,
      price: product.price,
    });
  }

  static async trackWishlistRemove(product: Product): Promise<void> {
    await this.logEvent(AnalyticsEvent.WISHLIST_REMOVE, {
      item_id: product.id,
      item_name: product.name,
    });
  }

  /**
   * Track coupon applied
   */
  static async trackApplyCoupon(
    couponCode: string,
    discount: number,
    success: boolean
  ): Promise<void> {
    await this.logEvent(AnalyticsEvent.APPLY_COUPON, {
      coupon_code: couponCode,
      discount_amount: discount,
      success,
    });
  }

  /**
   * Track share action
   */
  static async trackShare(
    contentType: string,
    contentId: string,
    method?: string
  ): Promise<void> {
    await this.logEvent(AnalyticsEvent.SHARE, {
      content_type: contentType,
      content_id: contentId,
      method,
    });
  }

  /**
   * Get all tracked events (for debugging)
   */
  static getEvents() {
    return [...this.events];
  }

  /**
   * Clear tracked events
   */
  static clearEvents(): void {
    this.events = [];
  }

  /**
   * Get analytics statistics
   */
  static getStats() {
    const eventCounts: Record<string, number> = {};

    this.events.forEach(e => {
      eventCounts[e.event] = (eventCounts[e.event] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      userId: this.userId,
      eventCounts,
      enabled: this.enabled,
    };
  }
}

export default AnalyticsService;
