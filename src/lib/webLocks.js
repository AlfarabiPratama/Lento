/**
 * Web Locks API Utility
 * 
 * Prevents race conditions in multi-tab scenarios.
 * Critical for: migrations, recurring generator, sync operations.
 */

/**
 * Execute a function with a lock (only one tab can run at a time)
 * @param {string} lockName - Unique name for the lock
 * @param {function} fn - Function to execute while holding lock
 * @param {object} options - Lock options
 * @returns {Promise<any>} Result of the function
 */
export async function withLock(lockName, fn, options = {}) {
    const { timeout = 5000, ifAvailable = false } = options

    // Fallback if Web Locks not supported
    if (!('locks' in navigator)) {
        console.log('[WebLock] API not supported, running without lock')
        return await fn()
    }

    const lockOptions = {
        mode: 'exclusive',
        ifAvailable
    }

    // Create a timeout promise if needed
    let timeoutId
    const timeoutPromise = timeout > 0 ? new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error(`Lock "${lockName}" timeout after ${timeout}ms`))
        }, timeout)
    }) : null

    try {
        const lockPromise = navigator.locks.request(lockName, lockOptions, async (lock) => {
            if (!lock && ifAvailable) {
                console.log(`[WebLock] "${lockName}" not available, skipping`)
                return null
            }
            console.log(`[WebLock] Acquired "${lockName}"`)
            try {
                return await fn()
            } finally {
                console.log(`[WebLock] Released "${lockName}"`)
            }
        })

        // Race between lock operation and timeout
        if (timeoutPromise) {
            return await Promise.race([lockPromise, timeoutPromise])
        }
        return await lockPromise
    } finally {
        if (timeoutId) clearTimeout(timeoutId)
    }
}

/**
 * Run a function only if lock is immediately available
 * If another tab holds the lock, returns null without waiting
 * @param {string} lockName - Lock name
 * @param {function} fn - Function to run
 */
export async function withLockIfAvailable(lockName, fn) {
    return await withLock(lockName, fn, { ifAvailable: true, timeout: 0 })
}

/**
 * Check if a lock is currently held (by any tab)
 * @param {string} lockName - Lock name to check
 */
export async function isLockHeld(lockName) {
    if (!('locks' in navigator)) return false

    try {
        const { held } = await navigator.locks.query()
        return held.some(lock => lock.name === lockName)
    } catch (error) {
        return false
    }
}

// Pre-defined lock names for consistency
export const LOCK_NAMES = {
    RECURRING_GENERATOR: 'lento_recurring_generator',
    DB_MIGRATION: 'lento_db_migration',
    SYNC_OPERATION: 'lento_sync',
    EXPORT_OPERATION: 'lento_export',
    IMPORT_OPERATION: 'lento_import',
}

export default {
    withLock,
    withLockIfAvailable,
    isLockHeld,
    LOCK_NAMES,
}
