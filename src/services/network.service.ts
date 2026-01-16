/**
 * Network Service
 *
 * Singleton service for detecting network connectivity changes.
 * Wraps @react-native-community/netinfo with debouncing and subscription pattern.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type NetworkListener = (status: NetworkStatus) => void;

// Debounce rapid connectivity changes (flaky networks)
const DEBOUNCE_MS = 1000;

class NetworkServiceClass {
  private status: NetworkStatus = 'unknown';
  private listeners: Set<NetworkListener> = new Set();
  private unsubscribeNetInfo: (() => void) | null = null;
  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;

  /**
   * Initialize the network service and start listening for connectivity changes.
   * Should be called once at app startup.
   */
  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Get initial state
    NetInfo.fetch().then((state) => {
      this.updateStatus(this.netInfoStateToStatus(state));
    });

    // Subscribe to changes
    this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      this.handleNetInfoChange(state);
    });
  }

  /**
   * Clean up the network service.
   * Should be called when the app is unmounting.
   */
  cleanup(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    this.listeners.clear();
    this.initialized = false;
  }

  /**
   * Get current network status.
   */
  getStatus(): NetworkStatus {
    return this.status;
  }

  /**
   * Check if currently online.
   */
  isOnline(): boolean {
    return this.status === 'online';
  }

  /**
   * Check if currently offline.
   */
  isOffline(): boolean {
    return this.status === 'offline';
  }

  /**
   * Subscribe to network status changes.
   * Returns unsubscribe function.
   */
  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);

    // Immediately notify with current status
    listener(this.status);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Force check current connection status.
   * Useful for verifying connectivity before critical operations.
   */
  async checkConnection(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      const newStatus = this.netInfoStateToStatus(state);
      this.updateStatus(newStatus);
      return newStatus === 'online';
    } catch {
      return false;
    }
  }

  private netInfoStateToStatus(state: NetInfoState): NetworkStatus {
    if (state.isConnected === null) {
      return 'unknown';
    }
    // Consider both isConnected and isInternetReachable
    // isInternetReachable can be null on some platforms, so we primarily use isConnected
    if (state.isConnected && state.isInternetReachable !== false) {
      return 'online';
    }
    return 'offline';
  }

  private handleNetInfoChange(state: NetInfoState): void {
    const newStatus = this.netInfoStateToStatus(state);

    // Debounce rapid changes
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.updateStatus(newStatus);
      this.debounceTimeout = null;
    }, DEBOUNCE_MS);
  }

  private updateStatus(newStatus: NetworkStatus): void {
    if (this.status === newStatus) return;

    this.status = newStatus;

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(newStatus);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const NetworkService = new NetworkServiceClass();

export default NetworkService;
