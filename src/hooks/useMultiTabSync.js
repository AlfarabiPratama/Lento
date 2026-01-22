import { useEffect, useCallback, useRef } from 'react'
import { initBroadcastChannel, broadcast, onBroadcast, BROADCAST_TYPES } from '../lib/broadcast'

/**
 * Hook to sync data changes across browser tabs
 * 
 * Usage:
 * const { broadcastChange, onDataChange } = useMultiTabSync()
 * 
 * // When data changes:
 * broadcastChange('transaction_created', newTransaction)
 * 
 * // To listen for changes from other tabs:
 * useEffect(() => {
 *   return onDataChange('transaction_created', (data) => {
 *     refreshTransactions()
 *   })
 * }, [])
 */
export function useMultiTabSync() {
    const initialized = useRef(false)

    // Initialize channel on mount
    useEffect(() => {
        if (!initialized.current) {
            initBroadcastChannel()
            initialized.current = true
        }
    }, [])

    // Broadcast a change to other tabs
    const broadcastChange = useCallback((type, payload = null) => {
        broadcast(type, payload)
    }, [])

    // Subscribe to changes from other tabs
    const onDataChange = useCallback((type, callback) => {
        return onBroadcast(type, callback)
    }, [])

    return {
        broadcastChange,
        onDataChange,
        BROADCAST_TYPES,
    }
}

/**
 * Hook that auto-refreshes data when other tabs make changes
 * @param {function} refreshFn - Function to call when data changes
 * @param {string[]} types - Array of broadcast types to listen for
 */
export function useAutoRefreshOnTabChange(refreshFn, types = [BROADCAST_TYPES.REFRESH_DATA]) {
    useEffect(() => {
        initBroadcastChannel()

        const unsubscribers = types.map(type =>
            onBroadcast(type, () => {
                console.log(`[MultiTab] Received ${type}, refreshing...`)
                refreshFn()
            })
        )

        return () => {
            unsubscribers.forEach(unsub => unsub())
        }
    }, [refreshFn, types])
}

export default useMultiTabSync
