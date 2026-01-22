/**
 * Sync Preferences Storage
 * 
 * Manages user preferences for sync functionality.
 * Uses localStorage for MVP (small data only).
 * 
 * SAFETY RULES:
 * - ✅ Store ONLY small data (booleans, strings, dates)
 * - ✅ Always try/catch JSON parsing
 * - ✅ Namespace key for future migration
 * - ❌ NEVER store large data (localStorage is synchronous, blocks main thread)
 */

const STORAGE_KEY = 'lento.syncPrefs.v1'
const SCHEMA_VERSION = 1

/**
 * Default sync preferences
 */
export const DEFAULT_SYNC_PREFS = {
    schemaVersion: SCHEMA_VERSION,
    enabled: false,           // Sync is opt-in (local-first philosophy)
    autoSync: true,           // When enabled, auto-sync on app open/changes
    deviceName: getDeviceName(),
    lastSyncAt: null,         // ISO timestamp of last successful sync
}

/**
 * Get device name from navigator (fallback to 'Device')
 */
function getDeviceName() {
    if (typeof navigator === 'undefined') return 'Device'

    // Try to get a meaningful device name
    const platform = navigator.platform || 'Unknown'
    const ua = navigator.userAgent || ''

    if (ua.includes('Mobile')) return `${platform} Mobile`
    if (ua.includes('Tablet')) return `${platform} Tablet`

    return platform
}

/**
 * Load sync preferences from localStorage
 * @returns {Object} Sync preferences with fallback to defaults
 */
export function loadSyncPrefs() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)

        if (!stored) {
            return { ...DEFAULT_SYNC_PREFS }
        }

        const parsed = JSON.parse(stored)

        // Merge with defaults to handle new fields
        // Handle schema migration if needed
        if (parsed.schemaVersion !== SCHEMA_VERSION) {
            return migrateSyncPrefs(parsed)
        }

        return { ...DEFAULT_SYNC_PREFS, ...parsed }
    } catch (error) {
        console.warn('Failed to load sync prefs, using defaults:', error)
        return { ...DEFAULT_SYNC_PREFS }
    }
}

/**
 * Save sync preferences to localStorage
 * @param {Object} prefs - Preferences to save
 * @returns {Object} - Result object with success status and optional error
 */
export function saveSyncPrefs(prefs) {
    try {
        const toSave = {
            ...prefs,
            schemaVersion: SCHEMA_VERSION,
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        return { success: true }
    } catch (error) {
        console.error('Failed to save sync prefs:', error)

        // Handle quota exceeded error specifically
        if (error.name === 'QuotaExceededError') {
            return {
                success: false,
                error: 'quota_exceeded',
                message: 'Penyimpanan penuh. Coba export data & hapus yang tidak diperlukan.',
            }
        }

        // Generic error - fail silently for non-critical data
        return {
            success: false,
            error: 'storage_error',
            message: 'Gagal menyimpan preferensi. Perubahan mungkin tidak tersimpan.',
        }
    }
}

/**
 * Migrate old schema to current version
 * @param {Object} oldPrefs - Old preferences
 * @returns {Object} Migrated preferences
 */
function migrateSyncPrefs(oldPrefs) {
    // For now, just merge with defaults
    // Future: handle specific version migrations
    return {
        ...DEFAULT_SYNC_PREFS,
        ...oldPrefs,
        schemaVersion: SCHEMA_VERSION,
    }
}

/**
 * Clear sync preferences (reset to defaults)
 */
export function clearSyncPrefs() {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
        console.error('Failed to clear sync prefs:', error)
    }
}

export default {
    loadSyncPrefs,
    saveSyncPrefs,
    clearSyncPrefs,
    DEFAULT_SYNC_PREFS,
}
