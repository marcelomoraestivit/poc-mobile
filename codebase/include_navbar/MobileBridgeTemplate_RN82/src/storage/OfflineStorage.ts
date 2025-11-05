/**
 * OfflineStorage - Persistent storage layer for offline-first functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedData {
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export interface PendingAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

class OfflineStorage {
  private readonly CACHE_PREFIX = '@cache:';
  private readonly QUEUE_KEY = '@pending_actions';
  private readonly MAX_CACHE_AGE = 1000 * 60 * 60 * 24; // 24 hours

  /**
   * Save data to cache
   */
  async cacheData(key: string, data: any, expiresIn?: number): Promise<void> {
    const cached: CachedData = {
      data,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
    };

    try {
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(cached)
      );
    } catch (error) {
      console.error('Error caching data:', error);
      throw error;
    }
  }

  /**
   * Get data from cache
   */
  async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);

      if (!cached) {
        return null;
      }

      const data: CachedData = JSON.parse(cached);

      // Check if expired
      if (data.expiresAt && Date.now() > data.expiresAt) {
        await this.removeCachedData(key);
        return null;
      }

      // Check if too old
      if (Date.now() - data.timestamp > this.MAX_CACHE_AGE) {
        await this.removeCachedData(key);
        return null;
      }

      return data.data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  /**
   * Remove cached data
   */
  async removeCachedData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Add action to pending queue
   */
  async queueAction(type: string, payload: any): Promise<string> {
    const action: PendingAction = {
      id: `action_${Date.now()}_${Math.random()}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    try {
      const queue = await this.getPendingActions();
      queue.push(action);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
      return action.id;
    } catch (error) {
      console.error('Error queuing action:', error);
      throw error;
    }
  }

  /**
   * Get all pending actions
   */
  async getPendingActions(): Promise<PendingAction[]> {
    try {
      const queue = await AsyncStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting pending actions:', error);
      return [];
    }
  }

  /**
   * Remove action from queue
   */
  async removeAction(actionId: string): Promise<void> {
    try {
      const queue = await this.getPendingActions();
      const filtered = queue.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing action:', error);
    }
  }

  /**
   * Update action retry count
   */
  async incrementRetryCount(actionId: string): Promise<void> {
    try {
      const queue = await this.getPendingActions();
      const updated = queue.map(action => {
        if (action.id === actionId) {
          return { ...action, retryCount: action.retryCount + 1 };
        }
        return action;
      });
      await AsyncStorage.setItem(this.QUEUE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating retry count:', error);
    }
  }

  /**
   * Clear all pending actions
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.QUEUE_KEY);
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem: number | null;
    newestItem: number | null;
    expiredItems: number;
    averageAge: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

      let oldestTimestamp: number | null = null;
      let newestTimestamp: number | null = null;
      let totalSize = 0;
      let expiredCount = 0;
      let totalAge = 0;
      const now = Date.now();

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const data: CachedData = JSON.parse(cached);
          const dataSize = new Blob([cached]).size;
          totalSize += dataSize;

          // Track oldest and newest
          if (!oldestTimestamp || data.timestamp < oldestTimestamp) {
            oldestTimestamp = data.timestamp;
          }
          if (!newestTimestamp || data.timestamp > newestTimestamp) {
            newestTimestamp = data.timestamp;
          }

          // Count expired items
          if (
            (data.expiresAt && now > data.expiresAt) ||
            now - data.timestamp > this.MAX_CACHE_AGE
          ) {
            expiredCount++;
          }

          // Calculate age
          totalAge += now - data.timestamp;
        }
      }

      return {
        totalItems: cacheKeys.length,
        totalSize,
        oldestItem: oldestTimestamp,
        newestItem: newestTimestamp,
        expiredItems: expiredCount,
        averageAge:
          cacheKeys.length > 0 ? Math.floor(totalAge / cacheKeys.length) : 0,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalItems: 0,
        totalSize: 0,
        oldestItem: null,
        newestItem: null,
        expiredItems: 0,
        averageAge: 0,
      };
    }
  }

  /**
   * Clean up expired cache items
   */
  async cleanExpiredCache(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const data: CachedData = JSON.parse(cached);

          // Check if expired
          if (
            (data.expiresAt && now > data.expiresAt) ||
            now - data.timestamp > this.MAX_CACHE_AGE
          ) {
            expiredKeys.push(key);
          }
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
      }

      console.log(`Cleaned ${expiredKeys.length} expired cache items`);
      return expiredKeys.length;
    } catch (error) {
      console.error('Error cleaning expired cache:', error);
      return 0;
    }
  }

  /**
   * Get detailed cache info for debugging
   */
  async getCacheDetails(): Promise<
    Array<{
      key: string;
      size: number;
      age: number;
      isExpired: boolean;
      expiresIn?: number;
    }>
  > {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      const now = Date.now();
      const details: Array<{
        key: string;
        size: number;
        age: number;
        isExpired: boolean;
        expiresIn?: number;
      }> = [];

      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const data: CachedData = JSON.parse(cached);
          const size = new Blob([cached]).size;
          const age = now - data.timestamp;
          const isExpired =
            (data.expiresAt && now > data.expiresAt) ||
            age > this.MAX_CACHE_AGE;
          const expiresIn = data.expiresAt ? data.expiresAt - now : undefined;

          details.push({
            key: key.replace(this.CACHE_PREFIX, ''),
            size,
            age,
            isExpired,
            expiresIn,
          });
        }
      }

      return details;
    } catch (error) {
      console.error('Error getting cache details:', error);
      return [];
    }
  }

  /**
   * Get pending actions statistics
   */
  async getQueueStats(): Promise<{
    totalActions: number;
    actionsByType: Record<string, number>;
    oldestAction: number | null;
    newestAction: number | null;
    failedActions: number;
  }> {
    try {
      const actions = await this.getPendingActions();
      const actionsByType: Record<string, number> = {};
      let oldestTimestamp: number | null = null;
      let newestTimestamp: number | null = null;
      let failedCount = 0;

      for (const action of actions) {
        // Count by type
        actionsByType[action.type] = (actionsByType[action.type] || 0) + 1;

        // Track oldest and newest
        if (!oldestTimestamp || action.timestamp < oldestTimestamp) {
          oldestTimestamp = action.timestamp;
        }
        if (!newestTimestamp || action.timestamp > newestTimestamp) {
          newestTimestamp = action.timestamp;
        }

        // Count failed (retried) actions
        if (action.retryCount > 0) {
          failedCount++;
        }
      }

      return {
        totalActions: actions.length,
        actionsByType,
        oldestAction: oldestTimestamp,
        newestAction: newestTimestamp,
        failedActions: failedCount,
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        totalActions: 0,
        actionsByType: {},
        oldestAction: null,
        newestAction: null,
        failedActions: 0,
      };
    }
  }
}

export default new OfflineStorage();
