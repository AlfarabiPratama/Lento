/**
 * Offline-First Reminder System
 * 
 * Queue reminders untuk offline support dengan Background Sync API
 */

/**
 * Schedule reminder yang akan ditampilkan bahkan ketika offline
 */
export async function scheduleOfflineReminder(reminder) {
  if (!('serviceWorker' in navigator)) {
    console.warn('[OfflineReminders] Service Worker not supported')
    return false
  }

  try {
    // Simpan reminder ke IndexedDB
    const db = await openReminderDB()
    await addReminder(db, {
      title: reminder.title,
      body: reminder.body,
      scheduledAt: reminder.scheduledAt,
      data: reminder.data,
      status: 'pending',
      createdAt: Date.now()
    })

    // Register background sync jika tersedia
    if ('sync' in navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-pending-reminders')
      console.log('[OfflineReminders] Background sync registered')
    }
    
    console.log('[OfflineReminders] Reminder scheduled:', reminder.title)
    return true
  } catch (error) {
    console.error('[OfflineReminders] Error scheduling reminder:', error)
    return false
  }
}

/**
 * Get all pending reminders
 */
export async function getPendingReminders() {
  try {
    const db = await openReminderDB()
    return await getAllReminders(db)
  } catch (error) {
    console.error('[OfflineReminders] Error getting reminders:', error)
    return []
  }
}

/**
 * Mark reminder as sent/completed
 */
export async function markReminderAsSent(reminderId) {
  try {
    const db = await openReminderDB()
    await deleteReminder(db, reminderId)
    return true
  } catch (error) {
    console.error('[OfflineReminders] Error marking reminder:', error)
    return false
  }
}

/**
 * Clear all pending reminders
 */
export async function clearAllReminders() {
  try {
    const db = await openReminderDB()
    const transaction = db.transaction(['reminders'], 'readwrite')
    const store = transaction.objectStore('reminders')
    store.clear()
    return true
  } catch (error) {
    console.error('[OfflineReminders] Error clearing reminders:', error)
    return false
  }
}

// ==================== IndexedDB Helpers ====================

function openReminderDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LentoReminders', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      if (!db.objectStoreNames.contains('reminders')) {
        const store = db.createObjectStore('reminders', { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        store.createIndex('scheduledAt', 'scheduledAt', { unique: false })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

function addReminder(db, reminder) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['reminders'], 'readwrite')
    const store = transaction.objectStore('reminders')
    const request = store.add(reminder)
    
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function getAllReminders(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['reminders'], 'readonly')
    const store = transaction.objectStore('reminders')
    const request = store.getAll()
    
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

function deleteReminder(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['reminders'], 'readwrite')
    const store = transaction.objectStore('reminders')
    const request = store.delete(id)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
