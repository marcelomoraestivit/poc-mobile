/**
 * SyncManager - Synchronization manager for offline-first functionality
 */

import OfflineStorage, { PendingAction } from '../storage/OfflineStorage';
import NetworkManager from '../network/NetworkManager';
import MobileBridge from '../bridge/MobileBridge';

export type SyncCallback = (success: boolean, syncedCount: number) => void;

class SyncManager {
  private isSyncing: boolean = false;
  private syncCallbacks: Set<SyncCallback> = new Set();
  private maxRetries: number = 3;
  private autoSyncEnabled: boolean = true;

  /**
   * Initialize sync manager
   */
  initialize(): void {
    // Listen for network changes
    NetworkManager.addListener(this.handleNetworkChange);

    // Try initial sync if online
    if (NetworkManager.isConnected()) {
      this.syncPendingActions();
    }
  }

  /**
   * Cleanup sync manager
   */
  cleanup(): void {
    NetworkManager.removeListener(this.handleNetworkChange);
    this.syncCallbacks.clear();
  }

  /**
   * Handle network status changes
   */
  private handleNetworkChange = (isConnected: boolean): void => {
    console.log('Network changed, connected:', isConnected);

    if (isConnected && this.autoSyncEnabled) {
      // Auto-sync when connection is restored
      this.syncPendingActions();
    }
  };

  /**
   * Execute action with offline support
   */
  async executeWithOffline<T>(
    actionType: string,
    payload: any,
    executor: (payload: any) => Promise<T>,
    options?: {
      cacheKey?: string;
      useCache?: boolean;
      cacheDuration?: number;
    }
  ): Promise<T> {
    // Check cache first if enabled
    if (options?.useCache && options?.cacheKey) {
      const cached = await OfflineStorage.getCachedData(options.cacheKey);
      if (cached !== null) {
        console.log('Returning cached data for:', options.cacheKey);
        return cached as T;
      }
    }

    // If offline, queue the action and return cached data or throw
    if (!NetworkManager.isConnected()) {
      console.log('Offline: Queuing action', actionType);
      await OfflineStorage.queueAction(actionType, payload);

      // Return cached data if available
      if (options?.cacheKey) {
        const cached = await OfflineStorage.getCachedData(options.cacheKey);
        if (cached !== null) {
          return cached as T;
        }
      }

      throw new Error('Offline: Action queued for later sync');
    }

    // Online: Execute action
    try {
      const result = await executor(payload);

      // Cache result if caching is enabled
      if (options?.cacheKey) {
        await OfflineStorage.cacheData(
          options.cacheKey,
          result,
          options.cacheDuration
        );
      }

      return result;
    } catch (error) {
      // If execution fails and we have cached data, return it
      if (options?.cacheKey) {
        const cached = await OfflineStorage.getCachedData(options.cacheKey);
        if (cached !== null) {
          console.log('Execution failed, returning cached data');
          return cached as T;
        }
      }

      throw error;
    }
  }

  /**
   * Sync all pending actions
   */
  async syncPendingActions(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!NetworkManager.isConnected()) {
      console.log('Cannot sync: offline');
      return;
    }

    this.isSyncing = true;
    let syncedCount = 0;

    try {
      const actions = await OfflineStorage.getPendingActions();
      console.log(`Starting sync of ${actions.length} pending actions`);

      for (const action of actions) {
        try {
          // Skip if max retries exceeded
          if (action.retryCount >= this.maxRetries) {
            console.log(`Max retries exceeded for action ${action.id}`);
            await OfflineStorage.removeAction(action.id);
            continue;
          }

          // Execute action via bridge
          await MobileBridge.handleMessage({
            id: action.id,
            type: action.type,
            payload: action.payload,
          });

          // Success: remove from queue
          await OfflineStorage.removeAction(action.id);
          syncedCount++;

          console.log(`Synced action ${action.id}`);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);

          // Increment retry count
          await OfflineStorage.incrementRetryCount(action.id);
        }
      }

      console.log(`Sync completed: ${syncedCount}/${actions.length} synced`);
      this.notifySyncCallbacks(true, syncedCount);
    } catch (error) {
      console.error('Sync error:', error);
      this.notifySyncCallbacks(false, syncedCount);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Add sync callback
   */
  addSyncCallback(callback: SyncCallback): void {
    this.syncCallbacks.add(callback);
  }

  /**
   * Remove sync callback
   */
  removeSyncCallback(callback: SyncCallback): void {
    this.syncCallbacks.delete(callback);
  }

  /**
   * Notify sync callbacks
   */
  private notifySyncCallbacks(success: boolean, syncedCount: number): void {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(success, syncedCount);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isSyncing: boolean;
    isOnline: boolean;
  } {
    return {
      isSyncing: this.isSyncing,
      isOnline: NetworkManager.isConnected(),
    };
  }

  /**
   * Enable/disable auto-sync
   */
  setAutoSync(enabled: boolean): void {
    this.autoSyncEnabled = enabled;
  }

  /**
   * Set max retries
   */
  setMaxRetries(retries: number): void {
    this.maxRetries = retries;
  }

  /**
   * Clear all pending actions
   */
  async clearPendingActions(): Promise<void> {
    await OfflineStorage.clearQueue();
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await OfflineStorage.clearCache();
  }
}

export default new SyncManager();
