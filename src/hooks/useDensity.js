import { useState, useLayoutEffect, useEffect } from 'react'

export const UI_DENSITY = {
    COZY: 'cozy',
    COMPACT: 'compact',
}

const STORAGE_KEY = 'lento.ui.density'
const VALID_DENSITIES = [UI_DENSITY.COZY, UI_DENSITY.COMPACT]

/**
 * Hook for UI density preference
 * 
 * Features:
 * - useLayoutEffect to prevent flash/FOUC
 * - Validation for localStorage (prevent injection)
 * - Cross-tab sync via storage event
 * - Fallback to Cozy on errors
 * - Guaranteed to return valid functions (never null/undefined)
 * 
 * Pattern inspired by theme toggle implementations:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
 */
export function useDensity() {
    const [density, setDensityState] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            // Validate before using (prevent injection/corruption)
            return VALID_DENSITIES.includes(stored) ? stored : UI_DENSITY.COZY
        } catch {
            // localStorage disabled or quota exceeded
            return UI_DENSITY.COZY
        }
    })

    const setDensity = (newDensity) => {
        try {
            // Validate input
            if (!VALID_DENSITIES.includes(newDensity)) {
                console.warn('Invalid density value:', newDensity)
                return
            }

            setDensityState(newDensity)

            try {
                localStorage.setItem(STORAGE_KEY, newDensity)
            } catch (error) {
                console.error('Failed to save density preference:', error)
                // Continue - user can still use density in current session
            }
        } catch (error) {
            console.error('setDensity failed:', error)
            // Fail silently to prevent crashes
        }
    }

    // Apply BEFORE paint (prevent flash/FOUC)
    // useLayoutEffect runs synchronously after DOM mutations
    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-density', density)
    }, [density])

    // Cross-tab sync
    // Note: storage event only fires in OTHER tabs, not the one that made the change
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                const newDensity = VALID_DENSITIES.includes(e.newValue)
                    ? e.newValue
                    : UI_DENSITY.COZY
                setDensityState(newDensity)
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    return { density, setDensity }
}
