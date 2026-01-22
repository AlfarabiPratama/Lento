/**
 * Soundscapes Preferences Storage
 * 
 * Manages persistence of user preferences for soundscapes.
 * 
 * CRITICAL RULES:
 * - Small data only (< 1KB)
 * - Never persist isPlaying or currentTime (causes stale state bugs)
 * - Always try/catch localStorage operations
 * - Handle QuotaExceededError gracefully
 */

const STORAGE_KEY = 'lento.soundscapes.v1'

/**
 * Default preferences
 */
export const DEFAULT_PREFS = {
    trackId: null,
    volume: 0.5,
    autoplay: false, // Always false for safety (browser policy)
    pauseOnHidden: false, // User preference for visibility behavior
}

/**
 * Load soundscapes preferences from localStorage
 * @returns {object} Preferences object
 */
export function loadSoundPrefs() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
            return { ...DEFAULT_PREFS }
        }

        const parsed = JSON.parse(stored)

        // Validate schema version (for future migrations)
        if (parsed.schemaVersion !== 1) {
            console.warn('Soundscapes prefs schema mismatch, using defaults')
            return { ...DEFAULT_PREFS }
        }

        // Ensure all required fields exist
        return {
            trackId: parsed.trackId ?? DEFAULT_PREFS.trackId,
            volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULT_PREFS.volume,
            autoplay: false, // Always force false (security)
            pauseOnHidden: typeof parsed.pauseOnHidden === 'boolean'
                ? parsed.pauseOnHidden
                : DEFAULT_PREFS.pauseOnHidden,
        }
    } catch (error) {
        console.error('Failed to load soundscapes prefs:', error)
        return { ...DEFAULT_PREFS }
    }
}

/**
 * Save soundscapes preferences to localStorage
 * @param {object} prefs - Preferences to save
 * @returns {object} Result object { success: boolean, error?: string }
 */
export function saveSoundPrefs(prefs) {
    try {
        const toSave = {
            schemaVersion: 1,
            trackId: prefs.trackId,
            volume: prefs.volume,
            autoplay: false, // Never allow autoplay
            pauseOnHidden: prefs.pauseOnHidden,
        }

        // CRITICAL: Don't save these (causes stale state bugs)
        // - isPlaying (user expects fresh state on reload)
        // - currentTime (resume mid-track is jarring)

        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
        return { success: true }
    } catch (error) {
        console.error('Failed to save soundscapes prefs:', error)

        if (error.name === 'QuotaExceededError') {
            return {
                success: false,
                error: 'quota_exceeded',
                message: 'Penyimpanan penuh. Coba hapus data lama.',
            }
        }

        return {
            success: false,
            error: error.name,
            message: 'Gagal menyimpan preferensi.',
        }
    }
}

/**
 * Debounced save for rapid updates (e.g., volume slider)
 * @param {object} prefs - Preferences to save
 * @param {number} delay - Debounce delay in ms (default 300)
 */
let saveTimeout = null
export function saveSoundPrefsDebounced(prefs, delay = 300) {
    if (saveTimeout) {
        clearTimeout(saveTimeout)
    }

    saveTimeout = setTimeout(() => {
        saveSoundPrefs(prefs)
        saveTimeout = null
    }, delay)
}

/**
 * Clear soundscapes preferences
 */
export function clearSoundPrefs() {
    try {
        localStorage.removeItem(STORAGE_KEY)
        return { success: true }
    } catch (error) {
        console.error('Failed to clear soundscapes prefs:', error)
        return { success: false, error: error.message }
    }
}
