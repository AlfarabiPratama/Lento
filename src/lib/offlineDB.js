/**
 * IndexedDB Manager for Offline Data Persistence
 * 
 * Features:
 * - Stores habits, finance, journal data offline
 * - Queue for pending sync operations
 * - Conflict resolution strategies
 * - Local-first architecture
 */

const DB_NAME = 'lento-offline-db'
const DB_VERSION = 1

// Store names
const STORES = {
  HABITS: 'habits',
  FINANCE: 'finance',
  JOURNAL: 'journal',
  SYNC_QUEUE: 'sync_queue',
  METADATA: 'metadata',
}

/**
 * Initialize IndexedDB
 */
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Habits store
      if (!db.objectStoreNames.contains(STORES.HABITS)) {
        const habitsStore = db.createObjectStore(STORES.HABITS, { keyPath: 'id' })
        habitsStore.createIndex('userId', 'userId', { unique: false })
        habitsStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Finance store
      if (!db.objectStoreNames.contains(STORES.FINANCE)) {
        const financeStore = db.createObjectStore(STORES.FINANCE, { keyPath: 'id' })
        financeStore.createIndex('userId', 'userId', { unique: false })
        financeStore.createIndex('date', 'date', { unique: false })
        financeStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Journal store
      if (!db.objectStoreNames.contains(STORES.JOURNAL)) {
        const journalStore = db.createObjectStore(STORES.JOURNAL, { keyPath: 'id' })
        journalStore.createIndex('userId', 'userId', { unique: false })
        journalStore.createIndex('date', 'date', { unique: false })
        journalStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Sync queue store (for offline operations)
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        queueStore.createIndex('timestamp', 'timestamp', { unique: false })
        queueStore.createIndex('type', 'type', { unique: false })
        queueStore.createIndex('status', 'status', { unique: false })
      }

      // Metadata store (last sync time, version, etc.)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' })
      }

      console.log('IndexedDB: Database initialized')
    }
  })
}

/**
 * Generic CRUD operations
 */
export async function add(storeName, data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    const request = store.add({
      ...data,
      updatedAt: Date.now(),
    })

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function get(storeName, id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAll(storeName, userId = null) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    let request
    if (userId) {
      const index = store.index('userId')
      request = index.getAll(userId)
    } else {
      request = store.getAll()
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function update(storeName, data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    const request = store.put({
      ...data,
      updatedAt: Date.now(),
    })

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function remove(storeName, id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Sync Queue Management
 */
export async function addToSyncQueue(operation) {
  const queueItem = {
    ...operation,
    timestamp: Date.now(),
    status: 'pending', // pending, syncing, completed, failed
    retryCount: 0,
  }
  
  return add(STORES.SYNC_QUEUE, queueItem)
}

export async function getSyncQueue() {
  return getAll(STORES.SYNC_QUEUE)
}

export async function markSyncCompleted(id) {
  const item = await get(STORES.SYNC_QUEUE, id)
  if (item) {
    item.status = 'completed'
    item.completedAt = Date.now()
    await update(STORES.SYNC_QUEUE, item)
  }
}

export async function markSyncFailed(id, error) {
  const item = await get(STORES.SYNC_QUEUE, id)
  if (item) {
    item.status = 'failed'
    item.error = error.message
    item.retryCount++
    await update(STORES.SYNC_QUEUE, item)
  }
}

export async function clearCompletedSyncs() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite')
    const store = transaction.objectStore(storeName)
    const index = store.index('status')
    const request = index.openCursor(IDBKeyRange.only('completed'))

    request.onsuccess = (event) => {
      const cursor = event.target.result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      } else {
        resolve()
      }
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Metadata operations
 */
export async function setMetadata(key, value) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.METADATA], 'readwrite')
    const store = transaction.objectStore(STORES.METADATA)
    const request = store.put({ key, value, updatedAt: Date.now() })

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getMetadata(key) {
  const result = await get(STORES.METADATA, key)
  return result?.value
}

export async function getLastSyncTime() {
  return getMetadata('lastSyncTime')
}

export async function setLastSyncTime(timestamp) {
  return setMetadata('lastSyncTime', timestamp)
}

/**
 * Conflict resolution strategies
 */
export function resolveConflict(localData, remoteData, strategy = 'last-write-wins') {
  switch (strategy) {
    case 'last-write-wins':
      // Most recent update wins
      return localData.updatedAt > remoteData.updatedAt ? localData : remoteData

    case 'remote-wins':
      // Always use remote data
      return remoteData

    case 'local-wins':
      // Always use local data
      return localData

    case 'merge':
      // Merge both (custom logic per data type)
      return {
        ...remoteData,
        ...localData,
        updatedAt: Math.max(localData.updatedAt, remoteData.updatedAt),
      }

    default:
      return remoteData
  }
}

/**
 * Export for debugging
 */
export async function exportAllData() {
  const data = {}
  
  for (const storeName of Object.values(STORES)) {
    data[storeName] = await getAll(storeName)
  }
  
  return data
}

/**
 * Clear all data (for testing or logout)
 */
export async function clearAllData() {
  const db = await openDB()
  
  for (const storeName of Object.values(STORES)) {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    await store.clear()
  }
  
  console.log('IndexedDB: All data cleared')
}

export { STORES }
