import { useState, useEffect } from 'react'
import { IconWifiOff, IconWifi, IconCloudOff, IconRefresh } from '@tabler/icons-react'

/**
 * OfflineIndicator - Shows network status and sync state
 * 
 * Priority 2 Feature - Best Practice 2026: Offline-first PWA
 * 
 * Features:
 * - Detects online/offline status
 * - Shows pending sync count
 * - Broadcasts sync updates via BroadcastChannel
 * - Auto-retry when back online
 * 
 * Usage:
 *   import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'
 *   
 *   <OfflineIndicator />
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSync, setPendingSync] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      console.log('✓ Back online')
      
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register('lento-offline-sync')
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('✗ Gone offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen for sync updates via BroadcastChannel
    const syncChannel = new BroadcastChannel('lento-updates')
    syncChannel.onmessage = (event) => {
      if (event.data.type === 'CACHE_UPDATED') {
        setLastSyncTime(new Date())
      }
    }

    // Check pending sync items (from IndexedDB or localStorage)
    const checkPendingSync = () => {
      try {
        const pending = JSON.parse(localStorage.getItem('lento-pending-sync') || '[]')
        setPendingSync(pending.length)
      } catch (error) {
        console.error('Failed to check pending sync:', error)
      }
    }

    checkPendingSync()
    const interval = setInterval(checkPendingSync, 5000) // Check every 5s

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      syncChannel.close()
      clearInterval(interval)
    }
  }, [])

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Unknown'
    const seconds = Math.floor((new Date() - lastSyncTime) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const handleRetrySync = async () => {
    if (!isOnline) {
      alert('You are still offline. Please check your connection.')
      return
    }

    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready
        await registration.sync.register('lento-offline-sync')
        console.log('✓ Sync retry triggered')
      } catch (error) {
        console.error('✗ Sync retry failed:', error)
      }
    }
  }

  // Don't show if online and no pending sync
  if (isOnline && pendingSync === 0) return null

  return (
    <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 animate-in slide-in-from-top-4 fade-in">
      <div
        className={`
          rounded-xl shadow-lg p-3 border-2
          ${isOnline 
            ? 'bg-blue-50 border-blue-300 text-blue-900' 
            : 'bg-amber-50 border-amber-300 text-amber-900'
          }
        `}
      >
        {/* Header */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center gap-3"
        >
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            ${isOnline ? 'bg-blue-200' : 'bg-amber-200'}
          `}>
            {isOnline ? (
              pendingSync > 0 ? <IconCloudOff size={20} /> : <IconWifi size={20} />
            ) : (
              <IconWifiOff size={20} />
            )}
          </div>

          <div className="flex-1 text-left">
            <h4 className="text-small font-semibold">
              {isOnline ? (
                pendingSync > 0 ? 'Syncing...' : 'Online'
              ) : (
                'Offline Mode'
              )}
            </h4>
            <p className="text-tiny opacity-80">
              {isOnline ? (
                pendingSync > 0 
                  ? `${pendingSync} pending changes` 
                  : 'All changes synced'
              ) : (
                'Changes will sync when online'
              )}
            </p>
          </div>

          {/* Expand indicator */}
          <div className={`
            transition-transform
            ${showDetails ? 'rotate-180' : ''}
          `}>
            ▼
          </div>
        </button>

        {/* Details (expandable) */}
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-current/20 space-y-2">
            <div className="flex items-center justify-between text-tiny">
              <span>Network Status</span>
              <span className="font-semibold">
                {isOnline ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center justify-between text-tiny">
              <span>Pending Sync</span>
              <span className="font-semibold">{pendingSync} items</span>
            </div>

            <div className="flex items-center justify-between text-tiny">
              <span>Last Sync</span>
              <span className="font-semibold">{formatLastSync()}</span>
            </div>

            {/* Retry button */}
            {isOnline && pendingSync > 0 && (
              <button
                onClick={handleRetrySync}
                className={`
                  w-full mt-2 px-3 py-1.5 rounded-lg
                  text-tiny font-medium
                  flex items-center justify-center gap-2
                  ${isOnline 
                    ? 'bg-blue-200 hover:bg-blue-300 text-blue-900' 
                    : 'bg-amber-200 hover:bg-amber-300 text-amber-900'
                  }
                  transition-colors
                `}
              >
                <IconRefresh size={14} />
                <span>Retry Sync Now</span>
              </button>
            )}

            {/* Offline tips */}
            {!isOnline && (
              <div className="mt-2 p-2 bg-amber-100 rounded-lg">
                <p className="text-tiny">
                  <strong>Offline Tips:</strong>
                </p>
                <ul className="text-tiny mt-1 space-y-0.5 pl-3">
                  <li>• Check-ins will be saved locally</li>
                  <li>• Changes sync automatically when back online</li>
                  <li>• Some features may be limited</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default OfflineIndicator
