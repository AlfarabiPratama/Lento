/**
 * AppPrefsContext - Shared context for app preferences
 * 
 * Provides centralized state for UI preferences like FAB visibility.
 * Uses localStorage for persistence.
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const STORAGE_KEY = 'lento.appPrefs.v1'

const DEFAULT_APP_PREFS = {
    showQuickCaptureFab: true,    // Show + FAB
    showSoundscapesFab: true,     // Show headphones FAB
}

/**
 * Load app preferences from localStorage
 */
function loadAppPrefs() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return { ...DEFAULT_APP_PREFS }
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_APP_PREFS, ...parsed }
    } catch (error) {
        console.warn('Failed to load app prefs:', error)
        return { ...DEFAULT_APP_PREFS }
    }
}

/**
 * Save app preferences to localStorage
 */
function saveAppPrefs(prefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
        return true
    } catch (error) {
        console.error('Failed to save app prefs:', error)
        return false
    }
}

const AppPrefsContext = createContext(null)

export function AppPrefsProvider({ children }) {
    const [prefs, setPrefs] = useState(() => loadAppPrefs())

    // Update single preference
    const updatePref = useCallback((key, value) => {
        setPrefs(prev => {
            const updated = { ...prev, [key]: value }
            saveAppPrefs(updated)
            return updated
        })
    }, [])

    // Toggle preference
    const togglePref = useCallback((key) => {
        setPrefs(prev => {
            const updated = { ...prev, [key]: !prev[key] }
            saveAppPrefs(updated)
            return updated
        })
    }, [])

    const value = useMemo(() => ({
        prefs,
        updatePref,
        togglePref,
        showQuickCaptureFab: prefs.showQuickCaptureFab,
        showSoundscapesFab: prefs.showSoundscapesFab,
    }), [prefs, updatePref, togglePref])

    return (
        <AppPrefsContext.Provider value={value}>
            {children}
        </AppPrefsContext.Provider>
    )
}

export function useAppPrefs() {
    const context = useContext(AppPrefsContext)
    if (!context) {
        // Fallback for components outside provider (shouldn't happen)
        console.warn('useAppPrefs used outside AppPrefsProvider, using defaults')
        return {
            prefs: DEFAULT_APP_PREFS,
            updatePref: () => { },
            togglePref: () => { },
            showQuickCaptureFab: true,
            showSoundscapesFab: true,
        }
    }
    return context
}

export default AppPrefsProvider
