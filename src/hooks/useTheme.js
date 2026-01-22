import { useEffect, useMemo, useState, useCallback } from 'react'

const KEY = 'lento_theme'

/**
 * Get system preference for dark mode
 */
function getSystemPreference() {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false
}

/**
 * useTheme - Manage theme preference
 * 
 * Modes: "light" | "dark" | "system"
 * - light: Always light
 * - dark: Always dark
 * - system: Follow OS preference
 */
export function useTheme() {
    const [mode, setMode] = useState(() => {
        if (typeof window === 'undefined') return 'system'
        return localStorage.getItem(KEY) || 'system'
    })

    const [systemPrefersDark, setSystemPrefersDark] = useState(getSystemPreference)

    // Listen for OS preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = (e) => {
            setSystemPrefersDark(e.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    // Calculate if currently dark
    const isDark = useMemo(() => {
        if (mode === 'dark') return true
        if (mode === 'light') return false
        // system: check OS preference
        return systemPrefersDark
    }, [mode, systemPrefersDark])

    // Apply theme to document
    useEffect(() => {
        localStorage.setItem(KEY, mode)

        // Apply the RESOLVED theme, not the mode
        if (isDark) {
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            document.documentElement.removeAttribute('data-theme')
        }
    }, [mode, isDark])

    // Toggle between light/dark (skip system)
    const toggle = useCallback(() => {
        setMode(mode === 'dark' ? 'light' : 'dark')
    }, [mode])

    // Cycle through all modes
    const cycle = useCallback(() => {
        const modes = ['light', 'dark', 'system']
        const currentIndex = modes.indexOf(mode)
        const nextIndex = (currentIndex + 1) % modes.length
        setMode(modes[nextIndex])
    }, [mode])

    return { mode, setMode, isDark, toggle, cycle }
}

export default useTheme

