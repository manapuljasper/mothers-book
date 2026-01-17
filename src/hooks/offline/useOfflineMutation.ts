/**
 * useOfflineMutation Hook
 *
 * A wrapper that queues mutations when offline and executes them when online.
 * Supports optimistic updates for immediate UI feedback.
 */

import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';
import { CacheService } from '../../services/storage.service';
import {
  useSyncStore,
  selectIsOffline,
  SyncableTable,
  MutationOperation,
} from '../../stores';

export interface UseOfflineMutationOptions<TArgs, TResult> {
  /** Table name for cache invalidation */
  tableName: SyncableTable;
  /** Operation type (create, update, delete) */
  operation: MutationOperation;
  /** Apply optimistic update before mutation completes */
  optimisticUpdate?: (args: TArgs) => void;
  /** Called when mutation succeeds (online execution) */
  onSuccess?: (result: TResult) => void;
  /** Called when mutation fails */
  onError?: (error: Error) => void;
  /** Called when mutation is queued for offline sync */
  onQueued?: (queueId: string) => void;
  /** Entity ID extractor for updates/deletes */
  getEntityId?: (args: TArgs) => string | undefined;
}

export interface UseOfflineMutationResult<TArgs, TResult> {
  /** Execute the mutation */
  mutate: (args: TArgs) => Promise<TResult | string>;
  /** True while mutation is executing */
  isPending: boolean;
  /** True if mutation was queued for offline sync */
  isQueued: boolean;
  /** Queue ID if mutation was queued */
  queueId: string | null;
  /** Error if mutation failed */
  error: Error | null;
  /** Reset error state */
  reset: () => void;
}

/**
 * Offline-aware mutation hook that queues operations when offline.
 *
 * @param mutation - Convex mutation function reference
 * @param options - Configuration options
 */
export function useOfflineMutation<Mutation extends FunctionReference<'mutation'>>(
  mutation: Mutation,
  options: UseOfflineMutationOptions<FunctionArgs<Mutation>, FunctionReturnType<Mutation>>
): UseOfflineMutationResult<FunctionArgs<Mutation>, FunctionReturnType<Mutation>> {
  type TArgs = FunctionArgs<Mutation>;
  type TResult = FunctionReturnType<Mutation>;

  const {
    tableName,
    operation,
    optimisticUpdate,
    onSuccess,
    onError,
    onQueued,
    getEntityId,
  } = options;

  // Get sync store actions
  const isOffline = useSyncStore(selectIsOffline);
  const queueMutation = useSyncStore((state) => state.queueMutation);

  // Get Convex mutation
  const convexMutation = useMutation(mutation);

  // Local state
  const [isPending, setIsPending] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Reset state
  const reset = useCallback(() => {
    setIsQueued(false);
    setQueueId(null);
    setError(null);
  }, []);

  // Execute mutation
  const mutate = useCallback(
    async (args: TArgs): Promise<TResult | string> => {
      // Reset previous state
      setError(null);
      setIsQueued(false);
      setQueueId(null);

      // Apply optimistic update if provided
      if (optimisticUpdate) {
        try {
          optimisticUpdate(args);
        } catch (err) {
          console.warn('Optimistic update failed:', err);
        }
      }

      // If offline, queue the mutation
      if (isOffline) {
        const entityId = getEntityId?.(args);
        const id = queueMutation({
          tableName,
          operation,
          payload: args as Record<string, unknown>,
          entityId,
        });

        setIsQueued(true);
        setQueueId(id);
        onQueued?.(id);

        return id;
      }

      // Online: execute immediately
      setIsPending(true);

      try {
        const result = await convexMutation(args);

        // Invalidate related caches
        CacheService.invalidateTableCaches(tableName);

        onSuccess?.(result);
        return result;
      } catch (err) {
        const mutationError = err instanceof Error ? err : new Error(String(err));
        setError(mutationError);
        onError?.(mutationError);
        throw mutationError;
      } finally {
        setIsPending(false);
      }
    },
    [
      isOffline,
      convexMutation,
      queueMutation,
      tableName,
      operation,
      optimisticUpdate,
      onSuccess,
      onError,
      onQueued,
      getEntityId,
    ]
  );

  return {
    mutate,
    isPending,
    isQueued,
    queueId,
    error,
    reset,
  };
}

export default useOfflineMutation;
