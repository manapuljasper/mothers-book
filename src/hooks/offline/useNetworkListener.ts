/**
 * useNetworkListener Hook
 *
 * Initializes network state monitoring and updates the sync store.
 * Should be called once at the app root level.
 */

import { useEffect } from 'react';
import { NetworkService } from '../../services/network.service';
import { useSyncStore } from '../../stores';

/**
 * Hook that initializes and manages network state monitoring.
 * Updates the sync store when network status changes.
 */
export function useNetworkListener() {
  const setNetworkStatus = useSyncStore((state) => state.setNetworkStatus);

  useEffect(() => {
    // Initialize network service
    NetworkService.initialize();

    // Subscribe to network status changes
    const unsubscribe = NetworkService.subscribe((status) => {
      setNetworkStatus(status);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      NetworkService.cleanup();
    };
  }, [setNetworkStatus]);
}

export default useNetworkListener;
