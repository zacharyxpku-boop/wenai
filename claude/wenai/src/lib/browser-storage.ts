const memoryStore = new Map<string, string>();

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    const storage = window.localStorage;
    const testKey = '__wenai_storage_probe__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

export function hasPersistentBrowserStorage() {
  return getStorage() !== null;
}

export function readBrowserStorage(key: string, fallback = '') {
  const storage = getStorage();
  if (!storage) return memoryStore.get(key) ?? fallback;
  try {
    return storage.getItem(key) ?? memoryStore.get(key) ?? fallback;
  } catch {
    return memoryStore.get(key) ?? fallback;
  }
}

export function writeBrowserStorage(key: string, value: string) {
  memoryStore.set(key, value);
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeBrowserStorage(key: string) {
  memoryStore.delete(key);
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function readJsonStorage<T>(key: string, fallback: T): T {
  const raw = readBrowserStorage(key, '');
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage<T>(key: string, value: T) {
  return writeBrowserStorage(key, JSON.stringify(value));
}
