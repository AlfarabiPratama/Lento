import { CloudUpload, AlertCircle, CheckCircle, Loader } from '@tabler/icons-react'
import { useOfflineSync } from '../hooks/useOfflineSync'
import { useNetworkStatus } from '../hooks/useNetworkStatus'

/**
 * Sync Status Indicator Component
 * 
 * Shows current sync status in header or bottom nav
 * Displays pending operations count and sync progress
 */
export default function SyncStatus() {
  const { isSyncing, syncProgress, syncError } = useOfflineSync()
  const { isOffline } = useNetworkStatus()

  // Don't show if online and not syncing
  if (!isOffline && !isSyncing && !syncError) {
    return null
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-canvas-100">
      {/* Icon */}
      {isSyncing ? (
        <Loader className="w-4 h-4 text-primary animate-spin" />
      ) : syncError ? (
        <AlertCircle className="w-4 h-4 text-red-600" />
      ) : isOffline ? (
        <CloudUpload className="w-4 h-4 text-amber-600" />
      ) : (
        <CheckCircle className="w-4 h-4 text-teal-600" />
      )}

      {/* Status Text */}
      <span className="text-xs font-medium text-ink-700">
        {isSyncing ? (
          `Syncing ${syncProgress.current}/${syncProgress.total}`
        ) : syncError ? (
          'Sync Failed'
        ) : isOffline ? (
          'Offline'
        ) : (
          'Synced'
        )}
      </span>
    </div>
  )
}

/**
 * Detailed sync status for settings page
 */
export function SyncStatusDetail() {
  const { isSyncing, syncProgress, syncError, triggerSync } = useOfflineSync()
  const { isOffline, isOnline } = useNetworkStatus()

  return (
    <div className="bg-paper rounded-2xl border border-canvas-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-ink-900 mb-1">Sync Status</h3>
          <p className="text-small text-ink-muted">
            {isOffline ? 'Perubahan akan disinkron otomatis saat online' : 'Data tersinkron dengan server'}
          </p>
        </div>

        {/* Status Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isSyncing ? 'bg-primary-100' :
          syncError ? 'bg-red-100' :
          isOffline ? 'bg-amber-100' :
          'bg-teal-100'
        }`}>
          {isSyncing ? (
            <Loader className="w-5 h-5 text-primary animate-spin" />
          ) : syncError ? (
            <AlertCircle className="w-5 h-5 text-red-600" />
          ) : isOffline ? (
            <CloudUpload className="w-5 h-5 text-amber-600" />
          ) : (
            <CheckCircle className="w-5 h-5 text-teal-600" />
          )}
        </div>
      </div>

      {/* Progress Bar (when syncing) */}
      {isSyncing && (
        <div className="mb-3">
          <div className="h-2 bg-canvas-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ 
                width: `${(syncProgress.current / syncProgress.total) * 100}%` 
              }}
            />
          </div>
          <p className="text-xs text-ink-muted mt-1">
            {syncProgress.current} of {syncProgress.total} operations synced
          </p>
        </div>
      )}

      {/* Error Message */}
      {syncError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
          <p className="text-xs text-red-800">
            <strong>Error:</strong> {syncError}
          </p>
        </div>
      )}

      {/* Manual Sync Button */}
      {isOnline && !isSyncing && (
        <button
          onClick={triggerSync}
          className="w-full bg-canvas-100 hover:bg-canvas-200 text-ink-900 font-medium py-2 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <CloudUpload className="w-4 h-4" />
          Sync Sekarang
        </button>
      )}
    </div>
  )
}
