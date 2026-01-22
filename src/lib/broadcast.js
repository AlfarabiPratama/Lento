/**
 * BroadcastChannel Utility for Multi-Tab Sync
 * 
 * Enables real-time sync between multiple browser tabs.
 * When data changes in one tab, other tabs update automatically.
 */

const CHANNEL_NAME = 'lento-sync'
let channel = null
const listeners = new Map()

/**
 * Initialize broadcast channel
 */
export function initBroadcastChannel() {
    if (!('BroadcastChannel' in window)) {
        console.log('[Broadcast] API not supported')
        return false
    }

    if (channel) {
        return true // Already initialized
    }

    channel = new BroadcastChannel(CHANNEL_NAME)

    channel.onmessage = (event) => {
        const { type, payload } = event.data
        console.log('[Broadcast] Received:', type)

        // Notify all registered listeners for this type
        const typeListeners = listeners.get(type) || []
        typeListeners.forEach(callback => callback(payload))

        // Also notify global listeners
        const globalListeners = listeners.get('*') || []
        globalListeners.forEach(callback => callback(type, payload))
    }

    console.log('[Broadcast] Channel initialized')
    return true
}

/**
 * Send message to other tabs
 * @param {string} type - Message type (e.g., 'transaction_created', 'habit_checked')
 * @param {any} payload - Data to send
 */
export function broadcast(type, payload = null) {
    if (!channel) {
        initBroadcastChannel()
    }

    if (channel) {
        channel.postMessage({ type, payload })
        console.log('[Broadcast] Sent:', type)
    }
}

/**
 * Subscribe to messages of a specific type
 * @param {string} type - Message type to listen for ('*' for all)
 * @param {function} callback - Handler function
 * @returns {function} Unsubscribe function
 */
export function onBroadcast(type, callback) {
    if (!channel) {
        initBroadcastChannel()
    }

    if (!listeners.has(type)) {
        listeners.set(type, [])
    }
    listeners.get(type).push(callback)

    // Return unsubscribe function
    return () => {
        const typeListeners = listeners.get(type) || []
        const index = typeListeners.indexOf(callback)
        if (index > -1) {
            typeListeners.splice(index, 1)
        }
    }
}

/**
 * Close broadcast channel
 */
export function closeBroadcastChannel() {
    if (channel) {
        channel.close()
        channel = null
        listeners.clear()
        console.log('[Broadcast] Channel closed')
    }
}

// Pre-defined message types for consistency
export const BROADCAST_TYPES = {
    // Data changes
    TRANSACTION_CREATED: 'transaction_created',
    TRANSACTION_DELETED: 'transaction_deleted',
    HABIT_CHECKED: 'habit_checked',
    JOURNAL_SAVED: 'journal_saved',
    BOOK_UPDATED: 'book_updated',
    SESSION_LOGGED: 'session_logged',

    // Sync status
    SYNC_STARTED: 'sync_started',
    SYNC_COMPLETED: 'sync_completed',

    // Theme change
    THEME_CHANGED: 'theme_changed',

    // Data refresh request
    REFRESH_DATA: 'refresh_data',
}

export default {
    initBroadcastChannel,
    broadcast,
    onBroadcast,
    closeBroadcastChannel,
    BROADCAST_TYPES,
}
