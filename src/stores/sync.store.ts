/**
 * Sync Store
 *
 * Manages sync state, pending mutations queue, and sync timestamps.
 * Persists pending mutations to MMKV for offline resilience.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '../services/storage.service';
import { NetworkStatus } from '../services/network.service';

// Mutation queue statuses
export type MutationStatus = 'pending' | 'syncing' | 'failed';

// Sync status for the overall sync state
export type SyncStatus = 'idle' | 'syncing' | 'has_failures';

// Table names that can be synced
export type SyncableTable =
  | 'booklets'
  | 'bookletAccess'
  | 'medicalEntries'
  | 'labRequests'
  | 'medications'
  | 'medicationIntakeLogs';

// Mutation operation types
export type MutationOperation = 'create' | 'update' | 'delete';

// Pending mutation in the queue
export interface PendingMutation {
  id: string;
  status: MutationStatus;
  timestamp: number; // When originally queued
  tableName: SyncableTable;
  operation: MutationOperation;
  entityId?: string; // For updates/deletes
  payload: Record<string, unknown>;
  retryCount: number;
  lastError?: string; // Error message for display
  lastAttempt?: number; // Timestamp of last sync attempt
}

// Sync metadata per entity type
interface EntitySyncMeta {
  lastSyncTimestamp: number;
  version: number;
}

// Store state interface
interface SyncState {
  // State
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  pendingMutations: PendingMutation[];
  entitySyncMeta: Record<string, EntitySyncMeta>;
  lastSyncError: string | null;

  // Actions
  setNetworkStatus: (status: NetworkStatus) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncError: (error: string | null) => void;

  // Mutation queue management
  queueMutation: (
    mutation: Omit<PendingMutation, 'id' | 'timestamp' | 'retryCount' | 'status'>
  ) => string;
  removeMutation: (id: string) => void;
  markSyncing: (id: string) => void;
  markFailed: (id: string, error: string) => void;
  incrementRetry: (id: string, error: string) => void;
  retryMutation: (id: string) => void;
  discardMutation: (id: string) => void;
  clearAllPending: () => void;

  // Sync metadata
  updateSyncMeta: (tableName: string, timestamp: number) => void;
  getSyncMeta: (tableName: string) => EntitySyncMeta | undefined;
}

// Generate unique ID for mutations
function generateMutationId(): string {
  return `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      // Initial state
      networkStatus: 'unknown',
      syncStatus: 'idle',
      pendingMutations: [],
      entitySyncMeta: {},
      lastSyncError: null,

      // Network status
      setNetworkStatus: (status: NetworkStatus) => {
        set({ networkStatus: status });
      },

      // Sync status
      setSyncStatus: (status: SyncStatus) => {
        set({ syncStatus: status });
      },

      setLastSyncError: (error: string | null) => {
        set({ lastSyncError: error });
      },

      // Queue a new mutation
      queueMutation: (mutation) => {
        const id = generateMutationId();
        const newMutation: PendingMutation = {
          ...mutation,
          id,
          status: 'pending',
          timestamp: Date.now(),
          retryCount: 0,
        };

        set((state) => ({
          pendingMutations: [...state.pendingMutations, newMutation],
        }));

        return id;
      },

      // Remove a mutation from queue (after successful sync)
      removeMutation: (id: string) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.filter((m) => m.id !== id),
        }));

        // Update sync status if no more failures
        const remaining = get().pendingMutations;
        const hasFailures = remaining.some((m) => m.status === 'failed');
        if (!hasFailures && get().syncStatus === 'has_failures') {
          set({ syncStatus: 'idle' });
        }
      },

      // Mark mutation as currently syncing
      markSyncing: (id: string) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.map((m) =>
            m.id === id ? { ...m, status: 'syncing' as const, lastAttempt: Date.now() } : m
          ),
        }));
      },

      // Mark mutation as failed
      markFailed: (id: string, error: string) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'failed' as const,
                  lastError: error,
                  lastAttempt: Date.now(),
                }
              : m
          ),
          syncStatus: 'has_failures',
        }));
      },

      // Increment retry count without marking as failed (for retryable errors)
      incrementRetry: (id: string, error: string) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'pending' as const,
                  lastError: error,
                  retryCount: m.retryCount + 1,
                  lastAttempt: Date.now(),
                }
              : m
          ),
        }));
      },

      // Retry a failed mutation (reset retry count and status)
      retryMutation: (id: string) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'pending' as const,
                  retryCount: 0,
                  lastError: undefined,
                }
              : m
          ),
        }));

        // Update sync status
        const remaining = get().pendingMutations;
        const hasFailures = remaining.some((m) => m.status === 'failed' && m.id !== id);
        if (!hasFailures) {
          set({ syncStatus: 'idle' });
        }
      },

      // Discard a failed mutation (remove without syncing)
      discardMutation: (id: string) => {
        set((state) => ({
          pendingMutations: state.pendingMutations.filter((m) => m.id !== id),
        }));

        // Update sync status if no more failures
        const remaining = get().pendingMutations;
        const hasFailures = remaining.some((m) => m.status === 'failed');
        if (!hasFailures && get().syncStatus === 'has_failures') {
          set({ syncStatus: 'idle' });
        }
      },

      // Clear all pending mutations
      clearAllPending: () => {
        set({ pendingMutations: [], syncStatus: 'idle' });
      },

      // Update sync metadata for a table
      updateSyncMeta: (tableName: string, timestamp: number) => {
        set((state) => ({
          entitySyncMeta: {
            ...state.entitySyncMeta,
            [tableName]: {
              lastSyncTimestamp: timestamp,
              version: (state.entitySyncMeta[tableName]?.version ?? 0) + 1,
            },
          },
        }));
      },

      // Get sync metadata for a table
      getSyncMeta: (tableName: string) => {
        return get().entitySyncMeta[tableName];
      },
    }),
    {
      name: 'sync-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist pendingMutations and entitySyncMeta
      partialize: (state) => ({
        pendingMutations: state.pendingMutations,
        entitySyncMeta: state.entitySyncMeta,
      }),
      onRehydrateStorage: () => (state) => {
        // Reset transient state after rehydration
        if (state) {
          // Reset syncing mutations to pending (app may have crashed mid-sync)
          state.pendingMutations = state.pendingMutations.map((m) =>
            m.status === 'syncing' ? { ...m, status: 'pending' } : m
          );

          // Check if there are failures
          const hasFailures = state.pendingMutations.some((m) => m.status === 'failed');
          state.syncStatus = hasFailures ? 'has_failures' : 'idle';
        }
      },
    }
  )
);

// Selectors
export const selectPendingCount = (state: SyncState) =>
  state.pendingMutations.filter((m) => m.status === 'pending').length;

export const selectFailedCount = (state: SyncState) =>
  state.pendingMutations.filter((m) => m.status === 'failed').length;

export const selectSyncingCount = (state: SyncState) =>
  state.pendingMutations.filter((m) => m.status === 'syncing').length;

export const selectHasPendingChanges = (state: SyncState) =>
  state.pendingMutations.some((m) => m.status === 'pending' || m.status === 'syncing');

export const selectHasFailures = (state: SyncState) =>
  state.pendingMutations.some((m) => m.status === 'failed');

export const selectIsOffline = (state: SyncState) => state.networkStatus === 'offline';

export const selectIsOnline = (state: SyncState) => state.networkStatus === 'online';

export const selectPendingMutations = (state: SyncState) =>
  state.pendingMutations.filter((m) => m.status === 'pending');

export const selectFailedMutations = (state: SyncState) =>
  state.pendingMutations.filter((m) => m.status === 'failed');
