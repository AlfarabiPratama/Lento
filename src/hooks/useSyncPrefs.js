import { useState, useCallback, useRef, useEffect } from 'react'
import { loadSyncPrefs, saveSyncPrefs } from '../lib/syncPrefs'

/**
 * useSyncPrefs - React hook for managing sync preferences
 * 
 * Returns:
 * - prefs: Current preferences object
 * - updatePrefs: Function to update preferences (debounced save)
 * - updatePrefsImmediate: Function to update preferences (immediate save)
 * - markSyncedNow: Function to update lastSyncAt timestamp
 * - saveError: Error object if save fails (for QuotaExceededError handling)
 * 
 * SOURCE OF TRUTH for UI preferences (enabled, autoSync, deviceName)
 * Does NOT manage sync engine status (see useSync for that)
 * 
 * CRITICAL: Timer cleanup to prevent memory leaks and race conditions
 */
export function useSyncPrefs() {
    const [prefs, setPrefs] = useState(() => loadSyncPrefs())
    const [saveError, setSaveError] = useState(null)
    const saveTimeoutRef = useRef(null)
    const mountedRef = useRef(true)

    /**
     * Cleanup debounce timeout on unmount
     * CRITICAL: Prevents writes after component unmounts
     */
    useEffect(() => {
        mountedRef.current = true

        return () => {
            mountedRef.current = false

            // Clear any pending debounced save
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
                saveTimeoutRef.current = null
            }
        }
    }, [])

    /**
     * Update preferences with debounced save (300ms)
     * Use this for inputs that can change rapidly (e.g., deviceName input)
     * 
     * SAFETY: Always clear previous timeout to prevent timer accumulation
     */
    const updatePrefs = useCallback((newPrefs) => {
        setPrefs(newPrefs)
        setSaveError(null)

        // CRITICAL: Clear existing timeout before setting new one
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = null
        }

        // Debounce save to prevent excessive localStorage writes
        saveTimeoutRef.current = setTimeout(() => {
            // SAFETY: Don't save if component unmounted
            if (!mountedRef.current) {
                return
            }

            const result = saveSyncPrefs(newPrefs)
            if (!result.success && mountedRef.current) {
                setSaveError(result)
            }

            saveTimeoutRef.current = null
        }, 300) // 300ms debounce
    }, [])

    /**
     * Update preferences with immediate save
     * Use this for toggles and important state changes
     * 
     * SAFETY: Clear pending debounced save to prevent write conflict
     */
    const updatePrefsImmediate = useCallback((newPrefs) => {
        setPrefs(newPrefs)
        setSaveError(null)

        // CRITICAL: Clear pending debounced save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = null
        }

        // Save immediately
        const result = saveSyncPrefs(newPrefs)
        if (!result.success && mountedRef.current) {
            setSaveError(result)
        }
    }, [])

    /**
     * Mark sync as completed now (sets lastSyncAt to current time)
     * CRITICAL: Only call this AFTER actual sync succeeds
     */
    const markSyncedNow = useCallback(() => {
        const updated = {
            ...prefs,
            lastSyncAt: new Date().toISOString(),
        }
        setPrefs(updated)

        // Save immediately (this is critical data)
        const result = saveSyncPrefs(updated)
        if (!result.success && mountedRef.current) {
            setSaveError(result)
        }
    }, [prefs])

    return {
        prefs,
        updatePrefs,
        updatePrefsImmediate,
        markSyncedNow,
        saveError,
    }
}

export default useSyncPrefs
