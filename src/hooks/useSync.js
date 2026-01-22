import { useState, useCallback, useRef } from 'react'
import { fullSync, pushToFirestore, pullFromFirestore, isFirestoreSyncAvailable } from '../lib/firestoreSyncEngine'
import { useAuth } from './useAuth'

/**
 * useSync - Hook for managing Firestore sync state and operations
 * 
 * CRITICAL: Uses ref-based lock to prevent race conditions
 * State-based locking can fail because setState is async
 */
export function useSync() {
    const { isAuthenticated } = useAuth()
    const [syncing, setSyncing] = useState(false)
    const [lastSync, setLastSync] = useState(() => {
        const stored = localStorage.getItem('lento_last_sync')
        return stored ? new Date(stored) : null
    })
    const [error, setError] = useState(null)

    // REF-BASED LOCK: Synchronous, no race conditions
    const syncLockRef = useRef(false)

    const sync = useCallback(async () => {
        if (!isFirestoreSyncAvailable() || !isAuthenticated) {
            return { success: false, error: 'Not configured or not authenticated' }
        }

        // ENGINE-LEVEL MUTEX: Prevent concurrent sync operations
        if (syncLockRef.current) {
            console.warn('Sync already in progress (ref-lock), ignoring concurrent request')
            return { success: false, error: 'Sync already in progress' }
        }

        // Acquire lock IMMEDIATELY (synchronous)
        syncLockRef.current = true
        setSyncing(true)
        setError(null)

        try {
            const result = await fullSync()

            if (result.success) {
                const now = new Date()
                setLastSync(now)
                localStorage.setItem('lento_last_sync', now.toISOString())
            } else {
                setError(result.error)
            }

            return result
        } catch (err) {
            console.error('Sync error:', err)
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            // Release lock
            syncLockRef.current = false
            setSyncing(false)
        }
    }, [isAuthenticated])

    const push = useCallback(async () => {
        if (!isFirestoreSyncAvailable() || !isAuthenticated) return

        setSyncing(true)
        try {
            await pushToFirestore()
            setLastSync(new Date())
        } finally {
            setSyncing(false)
        }
    }, [isAuthenticated])

    const pull = useCallback(async () => {
        if (!isFirestoreSyncAvailable() || !isAuthenticated) return

        setSyncing(true)
        try {
            await pullFromFirestore()
            setLastSync(new Date())
        } finally {
            setSyncing(false)
        }
    }, [isAuthenticated])

    return {
        sync,
        push,
        pull,
        syncing,
        lastSync,
        error,
        canSync: isFirestoreSyncAvailable() && isAuthenticated,
    }
}

export default useSync
