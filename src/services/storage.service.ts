import { MMKV } from 'react-native-mmkv';

// Storage keys for type safety
export enum StorageKey {
  // Auth
  AUTH_STATE = 'auth.state',

  // Data entities
  USERS = 'data.users',
  DOCTOR_PROFILES = 'data.doctorProfiles',
  MOTHER_PROFILES = 'data.motherProfiles',
  BOOKLETS = 'data.booklets',
  BOOKLET_ACCESS = 'data.bookletAccess',
  MEDICAL_ENTRIES = 'data.medicalEntries',
  LAB_REQUESTS = 'data.labRequests',
  MEDICATIONS = 'data.medications',
  INTAKE_LOGS = 'data.intakeLogs',
  QR_TOKENS = 'data.qrTokens',

  // App state
  ONBOARDING_COMPLETE = 'app.onboardingComplete',
  DATA_INITIALIZED = 'app.dataInitialized',
}

// Cache key prefix for query results
const CACHE_PREFIX = 'cache.';

// Lazy-initialized MMKV instance
let _storage: MMKV | null = null;

function getStorage(): MMKV {
  if (!_storage) {
    _storage = new MMKV({ id: 'mothers-book-storage' });
  }
  return _storage;
}

// Storage wrapper with lazy initialization
export const storage = {
  getString: (key: string) => getStorage().getString(key),
  set: (key: string, value: string) => getStorage().set(key, value),
  delete: (key: string) => getStorage().delete(key),
  contains: (key: string) => getStorage().contains(key),
  clearAll: () => getStorage().clearAll(),
  getAllKeys: () => getStorage().getAllKeys(),
};

// Zustand middleware storage adapter
export const mmkvStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};

// Type-safe storage helpers
export const StorageService = {
  get<T>(key: StorageKey): T | null {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value, dateReviver) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: StorageKey, value: T): void {
    storage.set(key, JSON.stringify(value));
  },

  delete(key: StorageKey): void {
    storage.delete(key);
  },

  has(key: StorageKey): boolean {
    return storage.contains(key);
  },

  clearAll(): void {
    storage.clearAll();
  },

  getAllKeys(): string[] {
    return storage.getAllKeys();
  },
};

// JSON date reviver to properly parse Date strings
function dateReviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string') {
    // ISO date string pattern
    const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    if (datePattern.test(value)) {
      return new Date(value);
    }
  }
  return value;
}

// Cache entry with metadata
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * CacheService - Specialized caching for Convex query results
 *
 * Stores query results with timestamps for offline access and staleness checking.
 */
export const CacheService = {
  /**
   * Generate a cache key from API path and arguments.
   * Creates a deterministic key based on the query and its parameters.
   */
  generateCacheKey(apiPath: string, args: Record<string, unknown>): string {
    // Sort keys for consistent hashing
    const sortedArgs = Object.keys(args)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = args[key];
          return acc;
        },
        {} as Record<string, unknown>
      );

    // Create a simple hash of the args
    const argsHash = hashString(JSON.stringify(sortedArgs));
    return `${CACHE_PREFIX}${apiPath}.${argsHash}`;
  },

  /**
   * Store query result with metadata.
   */
  cacheQuery<T>(key: string, data: T, timestamp?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: timestamp ?? Date.now(),
    };
    storage.set(key, JSON.stringify(entry));
  },

  /**
   * Retrieve cached query result with metadata.
   */
  getCachedQuery<T>(key: string): CacheEntry<T> | null {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value, dateReviver) as CacheEntry<T>;
    } catch {
      return null;
    }
  },

  /**
   * Check if cache entry is stale based on max age.
   * @param key - Cache key
   * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
   */
  isCacheStale(key: string, maxAgeMs: number = 5 * 60 * 1000): boolean {
    const entry = this.getCachedQuery(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > maxAgeMs;
  },

  /**
   * Invalidate a specific cache entry.
   */
  invalidateCache(key: string): void {
    storage.delete(key);
  },

  /**
   * Invalidate all caches for a specific table/entity type.
   * Useful after mutations that affect multiple queries.
   */
  invalidateTableCaches(tableName: string): void {
    const allKeys = storage.getAllKeys();
    const prefix = `${CACHE_PREFIX}${tableName}`;
    allKeys.forEach((key) => {
      if (key.startsWith(prefix)) {
        storage.delete(key);
      }
    });
  },

  /**
   * Clear all cached query results.
   */
  clearAllCaches(): void {
    const allKeys = storage.getAllKeys();
    allKeys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        storage.delete(key);
      }
    });
  },

  /**
   * Get all cache keys (for debugging).
   */
  getAllCacheKeys(): string[] {
    return storage.getAllKeys().filter((key) => key.startsWith(CACHE_PREFIX));
  },
};

/**
 * Simple string hash function for generating cache keys.
 * Uses djb2 algorithm for fast, low-collision hashing.
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Convert to base36 for shorter string
  return (hash >>> 0).toString(36);
}

export default StorageService;
