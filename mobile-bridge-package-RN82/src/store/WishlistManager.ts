import AsyncStorage from '@react-native-async-storage/async-storage';
import { WishlistItem, Product } from '../types';

const WISHLIST_STORAGE_KEY = '@ecommerce_wishlist';

export class WishlistManager {
  private static instance: WishlistManager;
  private wishlist: WishlistItem[] = [];
  private listeners: Array<(wishlist: WishlistItem[]) => void> = [];

  private constructor() {
    this.loadWishlist();
  }

  static getInstance(): WishlistManager {
    if (!WishlistManager.instance) {
      WishlistManager.instance = new WishlistManager();
    }
    return WishlistManager.instance;
  }

  subscribe(listener: (wishlist: WishlistItem[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.wishlist]));
  }

  private async loadWishlist() {
    try {
      const wishlistData = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (wishlistData) {
        this.wishlist = JSON.parse(wishlistData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }

  private async saveWishlist() {
    try {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.wishlist));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }

  async addItem(product: Product): Promise<void> {
    const exists = this.wishlist.some(item => item.productId === product.id);
    if (!exists) {
      this.wishlist.push({
        productId: product.id,
        product,
        addedAt: new Date().toISOString()
      });
      await this.saveWishlist();
    }
  }

  async removeItem(productId: string): Promise<void> {
    this.wishlist = this.wishlist.filter(item => item.productId !== productId);
    await this.saveWishlist();
  }

  async toggleItem(product: Product): Promise<boolean> {
    const exists = this.hasItem(product.id);
    if (exists) {
      await this.removeItem(product.id);
      return false;
    } else {
      await this.addItem(product);
      return true;
    }
  }

  async clear(): Promise<void> {
    this.wishlist = [];
    await this.saveWishlist();
  }

  getItems(): WishlistItem[] {
    return [...this.wishlist];
  }

  hasItem(productId: string): boolean {
    return this.wishlist.some(item => item.productId === productId);
  }

  getItemCount(): number {
    return this.wishlist.length;
  }
}
