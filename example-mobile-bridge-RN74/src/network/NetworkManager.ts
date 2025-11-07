/**
 * NetworkManager - Network connectivity detection and monitoring
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkStatusCallback = (isConnected: boolean) => void;

class NetworkManager {
  private isOnline: boolean = true;
  private listeners: Set<NetworkStatusCallback> = new Set();
  private unsubscribe?: () => void;

  /**
   * Initialize network monitoring
   */
  initialize(): void {
    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);

    // Get initial state
    NetInfo.fetch().then(state => {
      this.handleNetworkChange(state);
    });
  }

  /**
   * Stop network monitoring
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.listeners.clear();
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    const wasOnline = this.isOnline;
    this.isOnline = state.isConnected ?? false;

    console.log('Network status:', {
      isConnected: this.isOnline,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    });

    // Notify listeners if status changed
    if (wasOnline !== this.isOnline) {
      this.notifyListeners();
    }
  };

  /**
   * Get current network status
   */
  getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Check if currently online
   */
  isConnected(): boolean {
    return this.isOnline;
  }

  /**
   * Add network status listener
   */
  addListener(callback: NetworkStatusCallback): void {
    this.listeners.add(callback);
  }

  /**
   * Remove network status listener
   */
  removeListener(callback: NetworkStatusCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Refresh network state
   */
  async refresh(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.handleNetworkChange(state);
    return this.isOnline;
  }

  /**
   * Wait for connection
   */
  async waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
    if (this.isOnline) {
      return true;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.removeListener(listener);
        resolve(false);
      }, timeoutMs);

      const listener = (isConnected: boolean) => {
        if (isConnected) {
          clearTimeout(timeout);
          this.removeListener(listener);
          resolve(true);
        }
      };

      this.addListener(listener);
    });
  }
}

export default new NetworkManager();
