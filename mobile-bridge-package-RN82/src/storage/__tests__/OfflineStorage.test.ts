/**
 * Unit tests for OfflineStorage
 */

import OfflineStorage, { CachedData, PendingAction } from '../OfflineStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

describe('OfflineStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheData', () => {
    it('should cache data successfully', async () => {
      const key = 'test-key';
      const data = { id: 1, name: 'Test Product' };

      await OfflineStorage.cacheData(key, data);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@cache:test-key',
        expect.stringContaining('"data":{"id":1,"name":"Test Product"}')
      );
    });

    it('should include expiration time when specified', async () => {
      const key = 'test-key';
      const data = { id: 1 };
      const expiresIn = 5000; // 5 seconds

      await OfflineStorage.cacheData(key, data, expiresIn);

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const cachedData: CachedData = JSON.parse(callArgs[1]);

      expect(cachedData.expiresAt).toBeGreaterThan(Date.now());
      expect(cachedData.expiresAt).toBeLessThanOrEqual(Date.now() + expiresIn + 100);
    });

    it('should throw error when AsyncStorage fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage full')
      );

      await expect(
        OfflineStorage.cacheData('test', { data: 'test' })
      ).rejects.toThrow('Storage full');
    });
  });

  describe('getCachedData', () => {
    it('should return cached data when valid', async () => {
      const cachedData: CachedData = {
        data: { id: 1, name: 'Test' },
        timestamp: Date.now(),
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(cachedData)
      );

      const result = await OfflineStorage.getCachedData('test-key');

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should return null when data not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await OfflineStorage.getCachedData('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null and remove expired data', async () => {
      const expiredData: CachedData = {
        data: { id: 1 },
        timestamp: Date.now(),
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(expiredData)
      );

      const result = await OfflineStorage.getCachedData('expired-key');

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@cache:expired-key');
    });

    it('should return null and remove data older than 24 hours', async () => {
      const oldData: CachedData = {
        data: { id: 1 },
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(oldData)
      );

      const result = await OfflineStorage.getCachedData('old-key');

      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@cache:old-key');
    });

    it('should return null when parsing fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid json');

      const result = await OfflineStorage.getCachedData('invalid');

      expect(result).toBeNull();
    });
  });

  describe('removeCachedData', () => {
    it('should remove cached data', async () => {
      await OfflineStorage.removeCachedData('test-key');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@cache:test-key');
    });

    it('should not throw when removal fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Remove failed')
      );

      await expect(
        OfflineStorage.removeCachedData('test')
      ).resolves.not.toThrow();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce([
        '@cache:key1',
        '@cache:key2',
        '@other:key3',
        '@cache:key4',
      ]);

      await OfflineStorage.clearCache();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@cache:key1',
        '@cache:key2',
        '@cache:key4',
      ]);
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValueOnce(
        new Error('Failed')
      );

      await expect(OfflineStorage.clearCache()).resolves.not.toThrow();
    });
  });

  describe('queueAction', () => {
    it('should add action to queue', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const actionId = await OfflineStorage.queueAction('addToCart', {
        productId: '123',
      });

      expect(actionId).toMatch(/^action_\d+_/);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@pending_actions',
        expect.stringContaining('"type":"addToCart"')
      );
    });

    it('should append to existing queue', async () => {
      const existingQueue: PendingAction[] = [
        {
          id: 'action_1',
          type: 'addToCart',
          payload: { productId: '1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(existingQueue)
      );

      await OfflineStorage.queueAction('removeFromCart', { productId: '2' });

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const queue: PendingAction[] = JSON.parse(callArgs[1]);

      expect(queue).toHaveLength(2);
      expect(queue[0].id).toBe('action_1');
      expect(queue[1].type).toBe('removeFromCart');
    });

    it('should initialize retry count to 0', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      await OfflineStorage.queueAction('test', {});

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const queue: PendingAction[] = JSON.parse(callArgs[1]);

      expect(queue[0].retryCount).toBe(0);
    });
  });

  describe('getPendingActions', () => {
    it('should return pending actions', async () => {
      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'addToCart',
          payload: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(actions)
      );

      const result = await OfflineStorage.getPendingActions();

      expect(result).toEqual(actions);
    });

    it('should return empty array when no actions', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await OfflineStorage.getPendingActions();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Failed')
      );

      const result = await OfflineStorage.getPendingActions();

      expect(result).toEqual([]);
    });
  });

  describe('removeAction', () => {
    it('should remove specific action from queue', async () => {
      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'addToCart',
          payload: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'action_2',
          type: 'removeFromCart',
          payload: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(actions)
      );

      await OfflineStorage.removeAction('action_1');

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const queue: PendingAction[] = JSON.parse(callArgs[1]);

      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe('action_2');
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count for specific action', async () => {
      const actions: PendingAction[] = [
        {
          id: 'action_1',
          type: 'addToCart',
          payload: {},
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'action_2',
          type: 'removeFromCart',
          payload: {},
          timestamp: Date.now(),
          retryCount: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(actions)
      );

      await OfflineStorage.incrementRetryCount('action_1');

      const callArgs = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const queue: PendingAction[] = JSON.parse(callArgs[1]);

      expect(queue[0].retryCount).toBe(1);
      expect(queue[1].retryCount).toBe(1); // Unchanged
    });
  });

  describe('clearQueue', () => {
    it('should clear all pending actions', async () => {
      await OfflineStorage.clearQueue();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@pending_actions');
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const now = Date.now();
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce([
        '@cache:key1',
        '@cache:key2',
        '@other:key3',
      ]);

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(
          JSON.stringify({ data: {}, timestamp: now - 1000 })
        )
        .mockResolvedValueOnce(
          JSON.stringify({ data: {}, timestamp: now - 5000 })
        );

      const stats = await OfflineStorage.getCacheStats();

      expect(stats.totalItems).toBe(2);
      expect(stats.oldestItem).toBe(now - 5000);
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValueOnce(
        new Error('Failed')
      );

      const stats = await OfflineStorage.getCacheStats();

      expect(stats).toEqual({
        totalItems: 0,
        totalSize: 0,
        oldestItem: null,
      });
    });
  });
});
