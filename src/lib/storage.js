/**
 * Storage Management Utilities
 * 
 * Handles persistent storage, quota management, and storage health checks.
 * Critical for offline-first PWA to prevent data eviction.
 */

/**
 * Request persistent storage to prevent data eviction
 * @returns {Promise<{success: boolean, persisted: boolean, message: string}>}
 */
export async function requestPersistentStorage() {
    if (!navigator.storage || !navigator.storage.persist) {
        return {
            success: false,
            persisted: false,
            message: 'Browser tidak mendukung persistent storage'
        }
    }

    try {
        const persisted = await navigator.storage.persist()
        return {
            success: true,
            persisted,
            message: persisted
                ? 'Data diproteksi dari penghapusan otomatis'
                : 'Browser menolak request persistent storage'
        }
    } catch (error) {
        return {
            success: false,
            persisted: false,
            message: error.message
        }
    }
}

/**
 * Check if storage is already persistent
 * @returns {Promise<boolean>}
 */
export async function isStoragePersistent() {
    if (!navigator.storage || !navigator.storage.persisted) {
        return false
    }
    return await navigator.storage.persisted()
}

/**
 * Get storage quota and usage
 * @returns {Promise<{usage: number, quota: number, percent: number, usageText: string, quotaText: string}>}
 */
export async function getStorageEstimate() {
    if (!navigator.storage || !navigator.storage.estimate) {
        return {
            usage: 0,
            quota: 0,
            percent: 0,
            usageText: 'N/A',
            quotaText: 'N/A'
        }
    }

    try {
        const { usage, quota } = await navigator.storage.estimate()
        const percent = quota > 0 ? Math.round((usage / quota) * 100) : 0

        return {
            usage,
            quota,
            percent,
            usageText: formatBytes(usage),
            quotaText: formatBytes(quota)
        }
    } catch (error) {
        console.error('Storage estimate error:', error)
        return {
            usage: 0,
            quota: 0,
            percent: 0,
            usageText: 'Error',
            quotaText: 'Error'
        }
    }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Full storage health check
 * @returns {Promise<object>}
 */
export async function getStorageHealth() {
    const [persisted, estimate] = await Promise.all([
        isStoragePersistent(),
        getStorageEstimate()
    ])

    return {
        persisted,
        ...estimate,
        healthy: persisted && estimate.percent < 80,
        warning: estimate.percent >= 80 && estimate.percent < 95,
        critical: estimate.percent >= 95
    }
}

export default {
    requestPersistentStorage,
    isStoragePersistent,
    getStorageEstimate,
    getStorageHealth,
}
