/**
 * Secure Storage wrapper
 * Falls back to AsyncStorage if EncryptedStorage is not available
 *
 * NOTE: To use encrypted storage in production, install:
 * npm install react-native-encrypted-storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import EncryptedStorage, fallback to null if not available
let EncryptedStorage: any = null;
try {
  EncryptedStorage = require('react-native-encrypted-storage').default;
} catch (error) {
  console.warn('[SecureStorage] EncryptedStorage not available, falling back to AsyncStorage');
  console.warn('[SecureStorage] Install react-native-encrypted-storage for production use');
}

/**
 * Secure Storage class
 * Uses EncryptedStorage when available, falls back to AsyncStorage
 */
export class SecureStorage {
  private static isEncryptedAvailable = EncryptedStorage !== null;

  /**
   * Store data securely
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isEncryptedAvailable) {
        await EncryptedStorage.setItem(key, value);
      } else {
        // Fallback to AsyncStorage with warning
        console.warn(`[SecureStorage] Storing ${key} in AsyncStorage (not encrypted)`);
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('[SecureStorage] Error storing item:', error);
      throw error;
    }
  }

  /**
   * Retrieve data securely
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      if (this.isEncryptedAvailable) {
        return await EncryptedStorage.getItem(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error('[SecureStorage] Error retrieving item:', error);
      return null;
    }
  }

  /**
   * Remove data securely
   */
  static async removeItem(key: string): Promise<void> {
    try {
      if (this.isEncryptedAvailable) {
        await EncryptedStorage.removeItem(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('[SecureStorage] Error removing item:', error);
      throw error;
    }
  }

  /**
   * Clear all secure storage
   */
  static async clear(): Promise<void> {
    try {
      if (this.isEncryptedAvailable) {
        await EncryptedStorage.clear();
      } else {
        // Only clear items we manage, not all AsyncStorage
        console.warn('[SecureStorage] Clear not implemented for AsyncStorage fallback');
      }
    } catch (error) {
      console.error('[SecureStorage] Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Store object as JSON
   */
  static async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await this.setItem(key, jsonValue);
    } catch (error) {
      console.error('[SecureStorage] Error storing object:', error);
      throw error;
    }
  }

  /**
   * Retrieve object from JSON
   */
  static async getObject<T = any>(key: string): Promise<T | null> {
    try {
      const jsonValue = await this.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('[SecureStorage] Error retrieving object:', error);
      return null;
    }
  }

  /**
   * Check if EncryptedStorage is available
   */
  static isEncrypted(): boolean {
    return this.isEncryptedAvailable;
  }

  /**
   * Log storage status
   */
  static logStatus(): void {
    console.log('[SecureStorage] Status:', {
      encrypted: this.isEncryptedAvailable,
      storage: this.isEncryptedAvailable ? 'EncryptedStorage' : 'AsyncStorage (FALLBACK)',
      warning: !this.isEncryptedAvailable
        ? 'Install react-native-encrypted-storage for production'
        : undefined,
    });
  }
}

export default SecureStorage;
