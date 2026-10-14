/**
 * SDETube Asynchronous IndexedDB Storage Layer
 * Migrates heavy 4MB JSON catalogs, submissions, and drivers off the main JavaScript thread
 * to prevent frame drops and typing lag inside Monaco Editor.
 * Includes automatic read-through migration from localStorage.
 */

const DB_NAME = 'edustream_storage_v1';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

/**
 * Retrieves a value from IndexedDB with transparent read-through fallback to localStorage.
 */
export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    const result = await new Promise<T | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => reject(req.error);
    });

    if (result !== null) {
      return result;
    }
  } catch (err) {
    // If IDB fails, fallback to localStorage
  }

  // Fallback to localStorage and migrate to IDB if found
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw);
          // Asynchronously migrate to IDB in background
          idbSet(key, parsed).catch(() => {});
          return parsed as T;
        } catch {
          idbSet(key, raw).catch(() => {});
          return raw as unknown as T;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Stores a value asynchronously in IndexedDB without blocking the UI thread.
 */
export async function idbSet<T = any>(key: string, value: T): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage if IDB fails or is disabled in private browsing
    if (typeof localStorage !== 'undefined') {
      try {
        const valStr = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, valStr);
      } catch {}
    }
  }
}

/**
 * Removes a key from IndexedDB and localStorage.
 */
export async function idbDel(key: string): Promise<void> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * Clears expired or oversized cache entries from IndexedDB.
 */
export async function idbPruneLargePayloads(prefix: string, maxItems: number = 30): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const keysReq = store.getAllKeys();

    keysReq.onsuccess = () => {
      const allKeys = (keysReq.result || []) as string[];
      const matched = allKeys.filter(k => typeof k === 'string' && k.startsWith(prefix));
      if (matched.length > maxItems) {
        const toDelete = matched.slice(0, matched.length - maxItems);
        for (const k of toDelete) {
          store.delete(k);
        }
      }
    };
  } catch {}
}
