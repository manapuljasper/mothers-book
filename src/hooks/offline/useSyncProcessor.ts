/**
 * useSyncProcessor Hook
 *
 * Background processor that syncs pending mutations when online.
 * Handles retries with exponential backoff and error tracking.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CacheService } from '../../services/storage.service';
import {
  useSyncStore,
  selectIsOnline,
  selectPendingMutations,
  PendingMutation,
  SyncableTable,
  MutationOperation,
} from '../../stores';

// Sync configuration
const SYNC_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 5000, 15000], // Exponential backoff
  BATCH_SIZE: 10, // Process mutations in batches
  SYNC_DEBOUNCE_MS: 500, // Debounce sync start
};

/**
 * Hook that processes pending mutations in the background.
 * Should be initialized once at the app root level.
 */
export function useSyncProcessor() {
  // Get sync store state and actions
  const isOnline = useSyncStore(selectIsOnline);
  const pendingMutations = useSyncStore(selectPendingMutations);
  const {
    setSyncStatus,
    markSyncing,
    markFailed,
    incrementRetry,
    removeMutation,
    updateSyncMeta,
  } = useSyncStore();

  // Track if sync is in progress
  const isSyncing = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get all mutation functions
  // Booklets
  const createBooklet = useMutation(api.booklets.create);
  const updateBooklet = useMutation(api.booklets.update);
  const grantBookletAccess = useMutation(api.booklets.grantAccess);
  const revokeBookletAccess = useMutation(api.booklets.revokeAccess);

  // Medical entries
  const createEntry = useMutation(api.medical.createEntry);
  const updateEntry = useMutation(api.medical.updateEntry);

  // Lab requests
  const createLab = useMutation(api.medical.createLab);
  const updateLabStatus = useMutation(api.medical.updateLabStatus);
  const deleteLab = useMutation(api.medical.deleteLab);

  // Medications
  const createMedication = useMutation(api.medications.create);
  const updateMedication = useMutation(api.medications.update);
  const deactivateMedication = useMutation(api.medications.deactivate);

  // Medication intake logs
  const logIntake = useMutation(api.medications.logIntake);

  /**
   * Get the appropriate mutation function for a pending mutation.
   */
  const getMutationFunction = useCallback(
    (tableName: SyncableTable, operation: MutationOperation) => {
      const mutationMap: Record<SyncableTable, Record<MutationOperation, unknown>> = {
        booklets: {
          create: createBooklet,
          update: updateBooklet,
          delete: null, // Booklets are archived, not deleted
        },
        bookletAccess: {
          create: grantBookletAccess,
          update: null,
          delete: revokeBookletAccess,
        },
        medicalEntries: {
          create: createEntry,
          update: updateEntry,
          delete: null, // Medical entries are not deleted
        },
        labRequests: {
          create: createLab,
          update: updateLabStatus,
          delete: deleteLab,
        },
        medications: {
          create: createMedication,
          update: updateMedication,
          delete: deactivateMedication,
        },
        medicationIntakeLogs: {
          create: logIntake,
          update: logIntake, // Intake logs use same function
          delete: null, // Intake logs are not deleted
        },
      };

      return mutationMap[tableName]?.[operation] as
        | ((args: Record<string, unknown>) => Promise<unknown>)
        | null;
    },
    [
      createBooklet,
      updateBooklet,
      grantBookletAccess,
      revokeBookletAccess,
      createEntry,
      updateEntry,
      createLab,
      updateLabStatus,
      deleteLab,
      createMedication,
      updateMedication,
      deactivateMedication,
      logIntake,
    ]
  );

  /**
   * Check if an error is retryable (network vs validation).
   */
  const isRetryableError = (error: unknown): boolean => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // Network errors are retryable
      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('timeout') ||
        message.includes('connection')
      ) {
        return true;
      }
      // Server errors (5xx) are retryable
      if (message.includes('500') || message.includes('502') || message.includes('503')) {
        return true;
      }
    }
    // Validation errors, auth errors are not retryable
    return false;
  };

  /**
   * Process a single mutation.
   */
  const processMutation = useCallback(
    async (mutation: PendingMutation): Promise<boolean> => {
      const mutationFn = getMutationFunction(mutation.tableName, mutation.operation);

      if (!mutationFn) {
        console.warn(
          `No mutation function for ${mutation.tableName}.${mutation.operation}`
        );
        // Mark as failed with descriptive error
        markFailed(mutation.id, `Unsupported operation: ${mutation.tableName}.${mutation.operation}`);
        return false;
      }

      // Mark as syncing
      markSyncing(mutation.id);

      try {
        // Execute the mutation
        await mutationFn(mutation.payload);

        // Success - remove from queue
        removeMutation(mutation.id);

        // Invalidate related caches
        CacheService.invalidateTableCaches(mutation.tableName);

        // Update sync metadata
        updateSyncMeta(mutation.tableName, Date.now());

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if we should retry
        const shouldRetry = isRetryableError(error) && mutation.retryCount < SYNC_CONFIG.MAX_RETRIES;

        if (shouldRetry) {
          // Increment retry count and keep as pending for next sync cycle
          console.log(`Will retry mutation ${mutation.id} (attempt ${mutation.retryCount + 2}/${SYNC_CONFIG.MAX_RETRIES})`);
          incrementRetry(mutation.id, errorMessage);
          // The processor will pick it up again on the next sync cycle
          return false;
        }

        // Max retries exceeded or non-retryable error - mark as failed
        markFailed(mutation.id, errorMessage);
        console.error(`Mutation ${mutation.id} failed permanently:`, errorMessage);
        return false;
      }
    },
    [getMutationFunction, markSyncing, markFailed, incrementRetry, removeMutation, updateSyncMeta]
  );

  /**
   * Process all pending mutations.
   */
  const processQueue = useCallback(async () => {
    if (isSyncing.current) return;
    if (pendingMutations.length === 0) return;

    isSyncing.current = true;
    setSyncStatus('syncing');

    try {
      // Process mutations in order (oldest first)
      const sortedMutations = [...pendingMutations].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      for (const mutation of sortedMutations) {
        // Check if still online
        if (useSyncStore.getState().networkStatus !== 'online') {
          console.log('Lost connection during sync, pausing');
          break;
        }

        await processMutation(mutation);

        // Small delay between mutations to avoid overwhelming server
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } finally {
      isSyncing.current = false;

      // Update final sync status
      const state = useSyncStore.getState();
      const hasFailures = state.pendingMutations.some((m) => m.status === 'failed');
      const hasPending = state.pendingMutations.some((m) => m.status === 'pending');

      if (hasFailures) {
        setSyncStatus('has_failures');
      } else if (hasPending) {
        // Still have pending, schedule another sync
        setSyncStatus('idle');
      } else {
        setSyncStatus('idle');
      }
    }
  }, [pendingMutations, processMutation, setSyncStatus]);

  // Trigger sync when going online or when new mutations are added
  useEffect(() => {
    if (!isOnline || pendingMutations.length === 0) {
      return;
    }

    // Debounce sync start
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      processQueue();
    }, SYNC_CONFIG.SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isOnline, pendingMutations.length, processQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);
}

export default useSyncProcessor;
