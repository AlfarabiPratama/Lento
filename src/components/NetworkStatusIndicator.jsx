import { IconWifiOff, IconWifi } from '@tabler/icons-react'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useEffect, useState } from 'react'

/**
 * Network Status Indicator
 * 
 * Shows online/offline status with smooth transitions
 * Displays temporarily when status changes
 */
export default function NetworkStatusIndicator() {
  const { isOnline, effectiveType } = useNetworkStatus()
  const [showIndicator, setShowIndicator] = useState(false)
  const [previousStatus, setPreviousStatus] = useState(isOnline)

  useEffect(() => {
    // Only show indicator when status changes
    if (previousStatus !== isOnline) {
      setShowIndicator(true)
      setPreviousStatus(isOnline)

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowIndicator(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, previousStatus])

  if (!showIndicator) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      {isOnline ? (
        <OnlineIndicator effectiveType={effectiveType} />
      ) : (
        <OfflineIndicator />
      )}
    </div>
  )
}

function OfflineIndicator() {
  return (
    <div className="bg-amber-100 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
      <IconWifiOff className="w-5 h-5" />
      <span className="font-medium text-sm">
        Mode Offline
      </span>
      <span className="text-xs text-amber-700">
        • Data tersimpan di perangkat
      </span>
    </div>
  )
}

function OnlineIndicator({ effectiveType }) {
  const getConnectionLabel = () => {
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'Koneksi lambat'
      case '3g':
        return 'Koneksi sedang'
      case '4g':
        return 'Koneksi cepat'
      default:
        return 'Terhubung'
    }
  }

  return (
    <div className="bg-teal-100 border border-teal-300 text-teal-900 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
      <IconWifi className="w-5 h-5" />
      <span className="font-medium text-sm">
        {getConnectionLabel()}
      </span>
      <span className="text-xs text-teal-700">
        • Sinkronisasi aktif
      </span>
    </div>
  )
}

/**
 * Persistent offline indicator (for header/bottom nav)
 */
export function OfflineBadge() {
  const { isOffline } = useNetworkStatus()

  if (!isOffline) return null

  return (
    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-lg">
      <IconWifiOff className="w-4 h-4" />
      <span className="text-xs font-medium">Offline</span>
    </div>
  )
}
