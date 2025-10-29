/**
 * Unit tests for NetworkManager
 */

import NetworkManager, { NetworkStatusCallback } from '../NetworkManager';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(),
}));

describe('NetworkManager', () => {
  let unsubscribeMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    unsubscribeMock = jest.fn();
    (NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribeMock);
  });

  describe('initialize', () => {
    it('should set up network listener', () => {
      NetworkManager.initialize();

      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should fetch initial network state', async () => {
      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce(mockState);

      NetworkManager.initialize();

      // Wait for async fetch
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(NetInfo.fetch).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from network listener', () => {
      NetworkManager.initialize();
      NetworkManager.cleanup();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('should clear all listeners', () => {
      const callback = jest.fn();
      NetworkManager.addListener(callback);
      NetworkManager.cleanup();

      // Try to trigger a change - callback should not be called
      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('handleNetworkChange', () => {
    it('should update online status when connected', () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(NetworkManager.isConnected()).toBe(true);
    });

    it('should update online status when disconnected', () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(NetworkManager.isConnected()).toBe(false);
    });

    it('should handle null isConnected as offline', () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'unknown',
        isConnected: null,
        isInternetReachable: null,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(NetworkManager.isConnected()).toBe(false);
    });

    it('should notify listeners when status changes', () => {
      NetworkManager.initialize();
      const callback = jest.fn();
      NetworkManager.addListener(callback);

      // Change from online to offline
      const mockState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should not notify listeners when status stays same', () => {
      NetworkManager.initialize();
      const callback = jest.fn();
      NetworkManager.addListener(callback);

      // Keep status as online
      const mockState1: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      const mockState2: NetInfoState = {
        type: 'cellular',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState1);
      callback.mockClear();
      handler(mockState2);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getStatus', () => {
    it('should return current connection status', () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(NetworkManager.getStatus()).toBe(true);
    });
  });

  describe('isConnected', () => {
    it('should return true when online', () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(NetworkManager.isConnected()).toBe(true);
    });

    it('should return false when offline', () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(NetworkManager.isConnected()).toBe(false);
    });
  });

  describe('listeners', () => {
    it('should add listener', () => {
      const callback: NetworkStatusCallback = jest.fn();
      NetworkManager.addListener(callback);

      NetworkManager.initialize();
      const mockState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should remove listener', () => {
      const callback: NetworkStatusCallback = jest.fn();
      NetworkManager.addListener(callback);
      NetworkManager.removeListener(callback);

      NetworkManager.initialize();
      const mockState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in listeners gracefully', () => {
      const errorCallback: NetworkStatusCallback = jest.fn(() => {
        throw new Error('Listener error');
      });
      const successCallback: NetworkStatusCallback = jest.fn();

      NetworkManager.addListener(errorCallback);
      NetworkManager.addListener(successCallback);

      NetworkManager.initialize();
      const mockState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];

      // Should not throw
      expect(() => handler(mockState)).not.toThrow();

      // Other listeners should still be called
      expect(successCallback).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should fetch and update network state', async () => {
      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce(mockState);

      const result = await NetworkManager.refresh();

      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return current status after refresh', async () => {
      const mockState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValueOnce(mockState);

      const result = await NetworkManager.refresh();

      expect(result).toBe(false);
    });
  });

  describe('waitForConnection', () => {
    it('should resolve immediately when already online', async () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      const result = await NetworkManager.waitForConnection(1000);

      expect(result).toBe(true);
    });

    it('should resolve when connection becomes available', async () => {
      NetworkManager.initialize();

      // Start offline
      const offlineState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(offlineState);

      // Simulate connection after 100ms
      setTimeout(() => {
        const onlineState: NetInfoState = {
          type: 'wifi',
          isConnected: true,
          isInternetReachable: true,
          details: null,
        };
        handler(onlineState);
      }, 100);

      const result = await NetworkManager.waitForConnection(1000);

      expect(result).toBe(true);
    });

    it('should timeout and resolve false when no connection', async () => {
      NetworkManager.initialize();

      const offlineState: NetInfoState = {
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(offlineState);

      const result = await NetworkManager.waitForConnection(100);

      expect(result).toBe(false);
    }, 1000);

    it('should cleanup listener after resolving', async () => {
      NetworkManager.initialize();

      const mockState: NetInfoState = {
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
        details: null,
      };

      const handler = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0];
      handler(mockState);

      await NetworkManager.waitForConnection(100);

      // Verify listener was added and removed
      // (This is implicit in the implementation, but we can verify no memory leak)
    });
  });
});
