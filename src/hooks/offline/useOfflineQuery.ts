/**
 * useOfflineQuery Hook
 *
 * A wrapper around Convex's useQuery that provides offline-first behavior.
 * Returns cached data immediately if available, updates cache when online data arrives.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';
import { CacheService } from '../../services/storage.service';
import { useSyncStore, selectIsOffline } from '../../stores';

export interface UseOfflineQueryOptions<TData> {
  /** Override auto-generated cache key */
  cacheKey?: string;
  /** How long before cache is considered stale (ms). Default: 5 minutes */
  staleTime?: number;
  /** Only return cached data, never fetch from network */
  cacheOnly?: boolean;
  /** Transform data before caching */
  transform?: (data: TData) => TData;
  /** Called when data is loaded from cache */
  onCacheHit?: (data: TData) => void;
  /** Called when fresh data arrives from server */
  onSuccess?: (data: TData) => void;
}

export interface UseOfflineQueryResult<TData> {
  /** The data (from cache or server) */
  data: TData | undefined;
  /** True while waiting for initial data (no cache, no server response yet) */
  isLoading: boolean;
  /** True if current data is from cache (server data not yet received) */
  isFromCache: boolean;
  /** True if cached data is older than staleTime */
  isStale: boolean;
  /** True if currently offline */
  isOffline: boolean;
  /** Force refetch (clears cache and refetches) */
  refetch: () => void;
  /** Timestamp of when data was cached */
  cacheTimestamp: number | undefined;
}

/**
 * Offline-aware query hook that wraps Convex useQuery with caching.
 *
 * @param query - Convex query function reference
 * @param args - Query arguments (or "skip" to skip the query)
 * @param options - Configuration options
 */
export function useOfflineQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: FunctionArgs<Query> | 'skip',
  options: UseOfflineQueryOptions<FunctionReturnType<Query>> = {}
): UseOfflineQueryResult<FunctionReturnType<Query>> {
  type TData = FunctionReturnType<Query>;

  const { staleTime = 5 * 60 * 1000, cacheOnly = false, transform, onCacheHit, onSuccess } = options;

  // Get network status from sync store
  const isOffline = useSyncStore(selectIsOffline);

  // Generate cache key
  const cacheKey = useMemo(() => {
    if (options.cacheKey) return options.cacheKey;
    if (args === 'skip') return '';
    // Use query name and args to generate key
    const queryName = query.toString();
    return CacheService.generateCacheKey(queryName, args as Record<string, unknown>);
  }, [options.cacheKey, query, args]);

  // Track cache state
  const [cachedData, setCachedData] = useState<TData | undefined>(() => {
    if (!cacheKey) return undefined;
    const cached = CacheService.getCachedQuery<TData>(cacheKey);
    return cached?.data;
  });
  const [cacheTimestamp, setCacheTimestamp] = useState<number | undefined>(() => {
    if (!cacheKey) return undefined;
    const cached = CacheService.getCachedQuery<TData>(cacheKey);
    return cached?.timestamp;
  });
  const [isFromCache, setIsFromCache] = useState(false);

  // Track if we've received server data
  const hasReceivedServerData = useRef(false);

  // Load cache on mount or when cache key changes
  useEffect(() => {
    if (!cacheKey) {
      setCachedData(undefined);
      setCacheTimestamp(undefined);
      return;
    }

    const cached = CacheService.getCachedQuery<TData>(cacheKey);
    if (cached) {
      setCachedData(cached.data);
      setCacheTimestamp(cached.timestamp);
      setIsFromCache(true);
      onCacheHit?.(cached.data);
    } else {
      setCachedData(undefined);
      setCacheTimestamp(undefined);
      setIsFromCache(false);
    }

    // Reset server data flag when key changes
    hasReceivedServerData.current = false;
  }, [cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine if we should skip the Convex query
  const shouldSkip = args === 'skip' || isOffline || cacheOnly;

  // Call Convex useQuery - use type assertion to handle the union type
  const queryArgs = shouldSkip ? 'skip' : args;
  const convexData = useQuery(query, queryArgs as FunctionArgs<Query> | 'skip');

  // Update cache when server data arrives
  useEffect(() => {
    if (convexData !== undefined && cacheKey) {
      hasReceivedServerData.current = true;

      // Apply transform if provided
      const dataToCache = transform ? transform(convexData) : convexData;

      // Update cache
      CacheService.cacheQuery(cacheKey, dataToCache);
      setCachedData(dataToCache);
      setCacheTimestamp(Date.now());
      setIsFromCache(false);

      onSuccess?.(dataToCache);
    }
  }, [convexData, cacheKey, transform]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine final data to return
  const data = useMemo(() => {
    // Prefer server data if available
    if (convexData !== undefined) {
      return transform ? transform(convexData) : convexData;
    }
    // Fall back to cached data
    return cachedData;
  }, [convexData, cachedData, transform]);

  // Calculate staleness
  const isStale = useMemo(() => {
    if (!isFromCache || !cacheTimestamp) return false;
    return Date.now() - cacheTimestamp > staleTime;
  }, [isFromCache, cacheTimestamp, staleTime]);

  // Loading state: no data yet (neither cache nor server)
  const isLoading = data === undefined;

  // Refetch function
  const refetch = useCallback(() => {
    if (cacheKey) {
      CacheService.invalidateCache(cacheKey);
      setCachedData(undefined);
      setCacheTimestamp(undefined);
      setIsFromCache(false);
      hasReceivedServerData.current = false;
    }
  }, [cacheKey]);

  return {
    data,
    isLoading,
    isFromCache,
    isStale,
    isOffline,
    refetch,
    cacheTimestamp,
  };
}

export default useOfflineQuery;
