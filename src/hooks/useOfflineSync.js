import { useState, useEffect } from 'react'
import { useNetworkStatus } from './useNetworkStatus'
import { 
  getSyncQueue, 
  markSyncCompleted, 
  markSyncFailed,
  setLastSyncTime,
  clearCompletedSyncs 
} from '../lib/offlineDB'

/**
 * Hook for managing offline sync operations
 * 
 * Features:
 * - Automatically syncs pending operations when online
 * - Tracks sync status and progress
 * - Handles retry logic for failed syncs
 * - Shows sync status to user
 */
export function useOfflineSync() {
  const { isOnline } = useNetworkStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 })
  const [syncError, setSyncError] = useState(null)

  useEffect(() => {
    if (isOnline && !isSyncing) {
      // Trigger sync when coming back online
      syncPendingOperations()
    }
  }, [isOnline])

  /**
   * Sync all pending operations from queue
   */
  const syncPendingOperations = async () => {
    try {
      setIsSyncing(true)
      setSyncError(null)

      // Get all pending operations
      const queue = await getSyncQueue()
      const pendingOps = queue.filter(op => op.status === 'pending' || op.status === 'failed')

      if (pendingOps.length === 0) {
        console.log('Sync: No pending operations')
        setIsSyncing(false)
        return
      }

      console.log(`Sync: Processing ${pendingOps.length} operations`)
      setSyncProgress({ current: 0, total: pendingOps.length })

      // Process each operation
      for (let i = 0; i < pendingOps.length; i++) {
        const operation = pendingOps[i]
        
        try {
          // Execute the operation
          await executeOperation(operation)
          
          // Mark as completed
          await markSyncCompleted(operation.id)
          
          // Update progress
          setSyncProgress({ current: i + 1, total: pendingOps.length })
          
          console.log(`Sync: Completed operation ${operation.id}`)
        } catch (error) {
          console.error(`Sync: Failed operation ${operation.id}`, error)
          
          // Mark as failed (will retry next time)
          await markSyncFailed(operation.id, error)
          
          // Continue with other operations
          continue
        }
      }

      // Clean up completed syncs
      await clearCompletedSyncs()
      
      // Update last sync time
      await setLastSyncTime(Date.now())
      
      console.log('Sync: All operations processed')
      setIsSyncing(false)
      
    } catch (error) {
      console.error('Sync: Error processing queue', error)
      setSyncError(error.message)
      setIsSyncing(false)
    }
  }

  /**
   * Execute a sync operation based on its type
   */
  const executeOperation = async (operation) => {
    const { type, storeName, method, data } = operation

    switch (type) {
      case 'create':
        return fetch(`/api/${storeName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

      case 'update':
        return fetch(`/api/${storeName}/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

      case 'delete':
        return fetch(`/api/${storeName}/${data.id}`, {
          method: 'DELETE',
        })

      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  /**
   * Manually trigger sync
   */
  const triggerSync = () => {
    if (isOnline && !isSyncing) {
      syncPendingOperations()
    }
  }

  return {
    isSyncing,
    syncProgress,
    syncError,
    triggerSync,
  }
}
