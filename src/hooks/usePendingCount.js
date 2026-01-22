import { useState, useEffect, useCallback, useRef } from 'react'
import { getOutboxCount } from '../lib/outbox'

/**
 * usePendingCount - Hook for tracking pending sync operations
 * 
 * Returns:
 * - count: Number of pending operations in outbox
 * - loading: Whether count is being fetched
 * - refresh: Manual refresh function
 * 
 * PERFORMANCE NOTES:
 * - Polling only runs when component is mounted (Settings page open)
 * - Pauses when tab inactive (Visibility API)
 * - Pauses when offline (navigator.onLine)
 * - Error backoff to prevent excessive retries
 * - 5s base interval is acceptable for MVP (not excessive)
 * - Manual refresh reduces need for aggressive polling
 * - Future: Event-driven via BroadcastChannel (polling becomes fallback)
 */
export function usePendingCount(baseInterval = 5000) {
    const [count, setCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [errorCount, setErrorCount] = useState(0)
    const mountedRef = useRef(true)

    /**
     * Get current interval with backoff on errors
     * 5s → 10s → 20s → 30s max
     */
    const getCurrentInterval = useCallback(() => {
        if (errorCount === 0) return baseInterval
        if (errorCount === 1) return baseInterval * 2
        if (errorCount === 2) return baseInterval * 4
        return baseInterval * 6 // Max 30s
    }, [errorCount, baseInterval])

    /**
     * Fetch current pending count from outbox
     * SAFETY: Only update state if component is still mounted
     */
    const fetchCount = useCallback(async () => {
        try {
            setLoading(true)
            const pendingCount = await getOutboxCount()

            // SAFETY: Only update if still mounted
            if (mountedRef.current) {
                setCount(pendingCount)
                setErrorCount(0) // Reset backoff on success
            }
        } catch (error) {
            console.error('Failed to fetch pending count:', error)

            // SAFETY: Only update if still mounted
            if (mountedRef.current) {
                // Increment error count for backoff
                setErrorCount(prev => Math.min(prev + 1, 3))
                // Keep previous count on error
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false)
            }
        }
    }, [])

    /**
     * Manual refresh (for user-triggered update)
     */
    const refresh = useCallback(() => {
        fetchCount()
    }, [fetchCount])

    /**
   * Auto-fetch on mount and poll while mounted
   * PERFORMANCE: 
   * - Pause polling when tab is inactive (battery saving)
   * - Pause polling when offline
   * - Use error backoff with DYNAMIC interval (recursive setTimeout)
   * 
   * CRITICAL FIX: setInterval() doesn't re-evaluate interval on state change
   * Solution: Recursive setTimeout that re-calculates delay each iteration
   */
    useEffect(() => {
        mountedRef.current = true
        let timeoutId = null

        // Initial fetch
        fetchCount()

        /**
         * Recursive polling loop with dynamic interval
         * This allows backoff to actually work (interval changes based on errorCount)
         */
        const scheduleNext = () => {
            // Don't schedule if unmounted
            if (!mountedRef.current) return

            const currentInterval = getCurrentInterval()

            timeoutId = setTimeout(async () => {
                // Skip if page not visible
                if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                    scheduleNext() // Schedule next without fetching
                    return
                }

                // Skip if offline (no point polling when can't reach server)
                if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                    scheduleNext() // Schedule next without fetching
                    return
                }

                // Fetch and then schedule next
                await fetchCount()
                scheduleNext() // Recursive: schedule next poll
            }, currentInterval)
        }

        // Start polling loop
        scheduleNext()

        // Listen to visibility changes to resume polling immediately when tab becomes active
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && navigator.onLine !== false) {
                fetchCount() // Refresh immediately when tab becomes visible
            }
        }

        // Listen to online/offline events
        const handleOnline = () => {
            if (document.visibilityState === 'visible') {
                fetchCount() // Refresh immediately when comes online
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('online', handleOnline)

        // Cleanup on unmount
        return () => {
            mountedRef.current = false
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('online', handleOnline)
        }
    }, [fetchCount, getCurrentInterval])

    return {
        count,
        loading,
        refresh,
    }
}

export default usePendingCount
