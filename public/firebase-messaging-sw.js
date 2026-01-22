/**
 * Firebase Cloud Messaging Service Worker (Enhanced)
 * 
 * Handles:
 * - Background push notifications
 * - Notification click with deep linking
 * - Background sync for offline reminders
 * - PWA update lifecycle
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
    apiKey: "AIzaSyCYRo3gTs5yXvIwbxs0GCNV51llUIWuoHI",
    authDomain: "lento-less-rush-more-rhythm.firebaseapp.com",
    projectId: "lento-less-rush-more-rhythm",
    storageBucket: "lento-less-rush-more-rhythm.firebasestorage.app",
    messagingSenderId: "868861531602",
    appId: "1:868861531602:web:13f8b476e77b4a9687e40b",
})

const messaging = firebase.messaging()

// ==================== INSTALL & ACTIVATE ====================

self.addEventListener('install', (event) => {
    console.log('[SW] Installing...')
    // Skip waiting untuk update cepat
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...')
    event.waitUntil(self.clients.claim())
})

// Best Practice PWA: Handle SKIP_WAITING message
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})

// ==================== FCM BACKGROUND MESSAGES ====================

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload)
    
    const { notification, data } = payload
    
    const notificationTitle = notification?.title || 'Lento'
    const notificationOptions = {
        body: notification?.body || data?.body || 'Anda memiliki notifikasi baru',
        icon: '/pwa-192.png',
        badge: '/pwa-192.png',
        tag: data?.type || 'general', // Prevent duplicates dengan tag
        renotify: false, // Jangan vibrate lagi jika tag sama
        requireInteraction: data?.priority === 'high', // Hanya high priority yang persist
        vibrate: [200, 100, 200],
        data: {
            route: data?.route || '/',
            type: data?.type,
            entityId: data?.entityId,
            timestamp: Date.now()
        },
        actions: [
            { action: 'open', title: 'Lihat', icon: '/pwa-192.png' },
            { action: 'dismiss', title: 'Tutup' }
        ]
    }
    
    return self.registration.showNotification(notificationTitle, notificationOptions)
})

// ==================== NOTIFICATION CLICK HANDLER ====================

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action, event.notification.data)

    event.notification.close()

    if (event.action === 'dismiss') {
        return // User dismissed
    }

    // Best Practice PWA: Deep linking berdasarkan notification type
    const notificationData = event.notification.data || {}
    let route = notificationData.route || '/'
    
    // Route mapping berdasarkan notification type
    switch (notificationData.type) {
        case 'habit':
        case 'habit_reminder':
            route = '/habits'
            break
        case 'journal':
        case 'journal_reminder':
            route = '/journal'
            break
        case 'goal':
        case 'goal_milestone':
            route = '/goals'
            if (notificationData.goalId) {
                route += `?goalId=${notificationData.goalId}`
            }
            break
        case 'finance':
        case 'bill_reminder':
        case 'budget_warning':
            route = '/finance'
            if (notificationData.billId) {
                route += `?tab=bills&billId=${notificationData.billId}`
            } else if (notificationData.type === 'budget_warning') {
                route += `?tab=budget`
            }
            break
        case 'book':
        case 'reading_streak':
            route = '/books'
            break
        case 'pomodoro':
            route = '/fokus'
            break
        default:
            route = notificationData.route || '/'
    }

    const urlToOpen = new URL(route, self.location.origin).href

    // Best Practice PWA: Fokus ke existing window atau buka baru
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Cari window yang sudah buka origin yang sama
            for (const client of clientList) {
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    return client.focus().then((focusedClient) => {
                        // Navigate ke route spesifik via postMessage
                        return focusedClient.postMessage({
                            type: 'NAVIGATE',
                            route: route,
                            data: notificationData
                        })
                    })
                }
            }

            // Tidak ada window, buka baru
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen)
            }
        })
    )
})

// ==================== BACKGROUND SYNC ====================

self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag)
    
    if (event.tag === 'sync-pending-reminders') {
        event.waitUntil(syncPendingReminders())
    }
})

async function syncPendingReminders() {
    try {
        console.log('[SW] Syncing pending reminders...')
        
        const db = await openReminderDB()
        const pendingReminders = await getAllPendingReminders(db)
        
        console.log(`[SW] Found ${pendingReminders.length} pending reminders`)
        
        for (const reminder of pendingReminders) {
            // Tampilkan notification
            await self.registration.showNotification(reminder.title, {
                body: reminder.body,
                icon: '/pwa-192.png',
                badge: '/pwa-192.png',
                tag: reminder.data?.type || 'reminder',
                data: reminder.data,
                vibrate: [200, 100, 200],
                actions: [
                    { action: 'open', title: 'Lihat' },
                    { action: 'dismiss', title: 'Tutup' }
                ]
            })
            
            // Mark as sent
            await markReminderAsSent(db, reminder.id)
        }
        
        console.log('[SW] Sync completed')
    } catch (error) {
        console.error('[SW] Error syncing reminders:', error)
    }
}

// ==================== INDEXEDDB HELPERS ====================

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
            }
        }
    })
}

function getAllPendingReminders(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reminders'], 'readonly')
        const store = transaction.objectStore('reminders')
        const request = store.getAll()
        
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
    })
}

function markReminderAsSent(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reminders'], 'readwrite')
        const store = transaction.objectStore('reminders')
        const request = store.delete(id)
        
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

// ==================== NOTIFICATION CLOSE HANDLER (OPTIONAL) ====================

self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed:', event.notification.tag)
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus if already open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus()
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow('/')
            }
        })
    )
})
