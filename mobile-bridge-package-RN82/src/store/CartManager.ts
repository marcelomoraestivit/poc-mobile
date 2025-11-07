import { SecureStorage } from 'react-native-mobile-bridge';
import { CartItem, Product } from '../types';

const CART_STORAGE_KEY = '@ecommerce_cart';

export class CartManager {
  private static instance: CartManager;
  private cart: CartItem[] = [];
  private listeners: Array<(cart: CartItem[]) => void> = [];
  private loadPromise?: Promise<void>;
  private isLoaded: boolean = false;

  private constructor() {
    this.loadPromise = this.loadCart();
  }

  static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    } else {
      console.log('[CartManager] Reusing existing CartManager instance');
    }
    return CartManager.instance;
  }

  // Ensure cart is loaded before operations
  private async ensureLoaded(): Promise<void> {
    if (!this.isLoaded && this.loadPromise) {
      await this.loadPromise;
    }
  }

  subscribe(listener: (cart: CartItem[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.cart]));
  }

  private async loadCart() {
    try {
      const cart = await SecureStorage.getObject<CartItem[]>(CART_STORAGE_KEY);
      if (cart) {
        this.cart = cart;
        this.notifyListeners();
      } else {
        console.log('[CartManager] No cart found in storage, starting with empty cart');
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('[CartManager] Error loading cart:', error);
      this.isLoaded = true;
    }
  }

  private async saveCart() {
    try {
      await SecureStorage.setObject(CART_STORAGE_KEY, this.cart);
      this.notifyListeners();
    } catch (error) {
      console.error('[CartManager] Error saving cart:', error);
    }
  }

  async addItem(product: Product, quantity: number = 1, selectedColor?: string, selectedSize?: string): Promise<void> {
    const existingIndex = this.cart.findIndex(item =>
      item.productId === product.id &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize
    );

    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        productId: product.id,
        product,
        quantity,
        selectedColor,
        selectedSize
      });
    }

    await this.saveCart();
  }

  async removeItem(productId: string, selectedColor?: string, selectedSize?: string): Promise<void> {
    this.cart = this.cart.filter(item =>
      !(item.productId === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize)
    );
    await this.saveCart();
  }

  async updateQuantity(productId: string, quantity: number, selectedColor?: string, selectedSize?: string): Promise<void> {
    const item = this.cart.find(item =>
      item.productId === productId &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize
    );

    if (item) {
      if (quantity <= 0) {
        await this.removeItem(productId, selectedColor, selectedSize);
      } else {
        item.quantity = quantity;
        await this.saveCart();
      }
    }
  }

  async clear(): Promise<void> {
    this.cart = [];
    await this.saveCart();
    console.error('🗑️ [CartManager] Cart cleared and saved');
  }

  getItems(): CartItem[] {
    return [...this.cart];
  }

  getItemCount(): number {
    const count = this.cart.reduce((total, item) => total + item.quantity, 0);
    return count;
  }

  getTotal(): number {
    return this.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getSubtotal(): number {
    return this.getTotal();
  }

  getDiscount(): number {
    return this.cart.reduce((total, item) => {
      const discount = item.product.originalPrice
        ? (item.product.originalPrice - item.product.price) * item.quantity
        : 0;
      return total + discount;
    }, 0);
  }

  hasItem(productId: string, selectedColor?: string, selectedSize?: string): boolean {
    return this.cart.some(item =>
      item.productId === productId &&
      item.selectedColor === selectedColor &&
      item.selectedSize === selectedSize
    );
  }
}
