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

export default StorageService;
