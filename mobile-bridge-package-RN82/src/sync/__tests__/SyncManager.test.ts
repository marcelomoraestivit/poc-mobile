/**
 * Unit tests for SyncManager
 */

import SyncManager, { SyncCallback } from '../SyncManager';
import OfflineStorage, { PendingAction } from '../../storage/OfflineStorage';
import NetworkManager from '../../network/NetworkManager';
import MobileBridge from '../../bridge/MobileBridge';

// Mock dependencies
jest.mock('../../storage/OfflineStorage');
jest.mock('../../network/NetworkManager');
jest.mock('../../bridge/MobileBridge');

describe('SyncManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
  });

  describe('initialize', () => {
    it('should add network listener', () => {
      SyncManager.initialize();

      expect(NetworkManager.addListener).toHaveBeenCalled();
    });

    it('should sync pending actions if online', () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue([]);

      SyncManager.initialize();

      // Wait for async operation
      return new Promise(resolve => setTimeout(resolve, 0));
    });

    it('should not sync if offline', () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(false);

      SyncManager.initialize();

      expect(OfflineStorage.getPendingActions).not.toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should remove network listener', () => {
      SyncManager.cleanup();

      expect(NetworkManager.removeListener).toHaveBeenCalled();
    });

    it('should clear sync callbacks', () => {
      const callback: SyncCallback = jest.fn();
      SyncManager.addSyncCallback(callback);
      SyncManager.cleanup();

      // Callbacks should be cleared
    });
  });

  describe('handleNetworkChange', () => {
    it('should trigger sync when connection is restored', () => {
      SyncManager.initialize();
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue([]);

      const networkListener = (NetworkManager.addListener as jest.Mock).mock
        .calls[0][0];

      networkListener(true);

      // Sync should be triggered
      expect(OfflineStorage.getPendingActions).toHaveBeenCalled();
    });

    it('should not sync when disconnected', () => {
      SyncManager.initialize();
      jest.clearAllMocks();

      const networkListener = (NetworkManager.addListener as jest.Mock).mock
        .calls[0][0];

      networkListener(false);

      expect(OfflineStorage.getPendingActions).not.toHaveBeenCalled();
    });
  });

  describe('executeWithOffline', () => {
    it('should execute action when online', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      const executor = jest.fn().mockResolvedValue({ success: true });

      const result = await SyncManager.executeWithOffline(
        'testAction',
        { data: 'test' },
        executor
      );

      expect(executor).toHaveBeenCalledWith({ data: 'test' });
      expect(result).toEqual({ success: true });
    });

    it('should cache result when cacheKey provided', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      const executor = jest.fn().mockResolvedValue({ id: 1 });

      await SyncManager.executeWithOffline(
        'testAction',
        {},
        executor,
        { cacheKey: 'test-cache', cacheDuration: 5000 }
      );

      expect(OfflineStorage.cacheData).toHaveBeenCalledWith(
        'test-cache',
        { id: 1 },
        5000
      );
    });

    it('should return cached data if available and useCache enabled', async () => {
      (OfflineStorage.getCachedData as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Cached',
      });

      const executor = jest.fn();

      const result = await SyncManager.executeWithOffline(
        'testAction',
        {},
        executor,
        { cacheKey: 'test-cache', useCache: true }
      );

      expect(executor).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: 'Cached' });
    });

    it('should queue action when offline', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(false);
      (OfflineStorage.getCachedData as jest.Mock).mockResolvedValue(null);

      const executor = jest.fn();

      await expect(
        SyncManager.executeWithOffline('testAction', { data: 'test' }, executor)
      ).rejects.toThrow('Offline: Action queued for later sync');

      expect(OfflineStorage.queueAction).toHaveBeenCalledWith('testAction', {
        data: 'test',
      });
      expect(executor).not.toHaveBeenCalled();
    });

    it('should return cached data when offline if available', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(false);
      (OfflineStorage.getCachedData as jest.Mock).mockResolvedValue({
        id: 1,
        cached: true,
      });

      const executor = jest.fn();

      const result = await SyncManager.executeWithOffline(
        'testAction',
        {},
        executor,
        { cacheKey: 'test-cache' }
      );

      expect(result).toEqual({ id: 1, cached: true });
      expect(OfflineStorage.queueAction).toHaveBeenCalled();
    });

    it('should return cached data on execution failure', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getCachedData as jest.Mock).mockResolvedValue({
        id: 1,
        fallback: true,
      });

      const executor = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await SyncManager.executeWithOffline(
        'testAction',
        {},
        executor,
        { cacheKey: 'test-cache' }
      );

      expect(result).toEqual({ id: 1, fallback: true });
    });

    it('should throw error when execution fails and no cache', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getCachedData as jest.Mock).mockResolvedValue(null);

      const executor = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        SyncManager.executeWithOffline('testAction', {}, executor)
      ).rejects.toThrow('Network error');
    });
  });

  describe('syncPendingActions', () => {
    it('should sync all pending actions', async () => {
      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'addToCart',
          payload: { productId: '1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'action_2',
          type: 'removeFromCart',
          payload: { productId: '2' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue(actions);
      (MobileBridge.handleMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      await SyncManager.syncPendingActions();

      expect(MobileBridge.handleMessage).toHaveBeenCalledTimes(2);
      expect(OfflineStorage.removeAction).toHaveBeenCalledWith('action_1');
      expect(OfflineStorage.removeAction).toHaveBeenCalledWith('action_2');
    });

    it('should not sync when offline', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(false);

      await SyncManager.syncPendingActions();

      expect(OfflineStorage.getPendingActions).not.toHaveBeenCalled();
    });

    it('should not sync when already syncing', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      SyncManager.syncPendingActions();
      await SyncManager.syncPendingActions();

      expect(OfflineStorage.getPendingActions).toHaveBeenCalledTimes(1);
    });

    it('should skip actions exceeding max retries', async () => {
      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'addToCart',
          payload: {},
          timestamp: Date.now(),
          retryCount: 3, // Exceeds default max of 3
        },
      ];

      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue(actions);

      await SyncManager.syncPendingActions();

      expect(MobileBridge.handleMessage).not.toHaveBeenCalled();
      expect(OfflineStorage.removeAction).toHaveBeenCalledWith('action_1');
    });

    it('should increment retry count on failure', async () => {
      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'addToCart',
          payload: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue(actions);
      (MobileBridge.handleMessage as jest.Mock).mockRejectedValue(
        new Error('Sync failed')
      );

      await SyncManager.syncPendingActions();

      expect(OfflineStorage.incrementRetryCount).toHaveBeenCalledWith(
        'action_1'
      );
      expect(OfflineStorage.removeAction).not.toHaveBeenCalled();
    });

    it('should notify callbacks on successful sync', async () => {
      const callback: SyncCallback = jest.fn();
      SyncManager.addSyncCallback(callback);

      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'test',
          payload: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue(actions);
      (MobileBridge.handleMessage as jest.Mock).mockResolvedValue({});

      await SyncManager.syncPendingActions();

      expect(callback).toHaveBeenCalledWith(true, 1);
    });

    it('should notify callbacks on sync error', async () => {
      const callback: SyncCallback = jest.fn();
      SyncManager.addSyncCallback(callback);

      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockRejectedValue(
        new Error('Failed to get actions')
      );

      await SyncManager.syncPendingActions();

      expect(callback).toHaveBeenCalledWith(false, 0);
    });
  });

  describe('sync callbacks', () => {
    it('should add sync callback', () => {
      const callback: SyncCallback = jest.fn();
      SyncManager.addSyncCallback(callback);

      // Callback should be registered
    });

    it('should remove sync callback', () => {
      const callback: SyncCallback = jest.fn();
      SyncManager.addSyncCallback(callback);
      SyncManager.removeSyncCallback(callback);

      // Callback should be removed
    });

    it('should handle errors in callbacks gracefully', async () => {
      const errorCallback: SyncCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const successCallback: SyncCallback = jest.fn();

      SyncManager.addSyncCallback(errorCallback);
      SyncManager.addSyncCallback(successCallback);

      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue([]);

      await expect(SyncManager.syncPendingActions()).resolves.not.toThrow();

      expect(successCallback).toHaveBeenCalled();
    });
  });

  describe('getSyncStatus', () => {
    it('should return sync status', () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);

      const status = SyncManager.getSyncStatus();

      expect(status).toEqual({
        isSyncing: false,
        isOnline: true,
      });
    });

    it('should reflect syncing state', async () => {
      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve([]), 100);
          })
      );

      SyncManager.syncPendingActions();

      const status = SyncManager.getSyncStatus();

      expect(status.isSyncing).toBe(true);
    });
  });

  describe('setAutoSync', () => {
    it('should enable auto-sync', () => {
      SyncManager.setAutoSync(true);

      // Auto-sync should be enabled
    });

    it('should disable auto-sync', () => {
      SyncManager.setAutoSync(false);
      SyncManager.initialize();
      jest.clearAllMocks();

      const networkListener = (NetworkManager.addListener as jest.Mock).mock
        .calls[0][0];

      networkListener(true);

      expect(OfflineStorage.getPendingActions).not.toHaveBeenCalled();
    });
  });

  describe('setMaxRetries', () => {
    it('should set max retries', async () => {
      SyncManager.setMaxRetries(5);

      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'test',
          payload: {},
          timestamp: Date.now(),
          retryCount: 4, // Less than new max of 5
        },
      ];

      (NetworkManager.isConnected as jest.Mock).mockReturnValue(true);
      (OfflineStorage.getPendingActions as jest.Mock).mockResolvedValue(actions);
      (MobileBridge.handleMessage as jest.Mock).mockResolvedValue({});

      await SyncManager.syncPendingActions();

      // Action should be synced (not skipped)
      expect(MobileBridge.handleMessage).toHaveBeenCalled();
    });
  });

  describe('clearPendingActions', () => {
    it('should clear all pending actions', async () => {
      await SyncManager.clearPendingActions();

      expect(OfflineStorage.clearQueue).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      await SyncManager.clearCache();

      expect(OfflineStorage.clearCache).toHaveBeenCalled();
    });
  });
});
