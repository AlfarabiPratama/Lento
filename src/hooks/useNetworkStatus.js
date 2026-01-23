import { useState, useEffect } from 'react'

/**
 * Hook for detecting network connectivity status
 * 
 * Features:
 * - Real-time online/offline detection
 * - Connection type detection (wifi, cellular, ethernet)
 * - Effective connection type (slow-2g, 2g, 3g, 4g)
 * - Downlink speed estimation
 * - Save-data mode detection
 * 
 * @returns {object} Network status and connection info
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo())

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network: Online')
      setIsOnline(true)
      setConnectionInfo(getConnectionInfo())
    }

    const handleOffline = () => {
      console.log('Network: Offline')
      setIsOnline(false)
    }

    const handleConnectionChange = () => {
      console.log('Network: Connection changed')
      setConnectionInfo(getConnectionInfo())
    }

    // Listen to online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Listen to connection changes (if supported)
    const connection = getNetworkConnection()
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline,
    ...connectionInfo,
  }
}

/**
 * Get network connection information
 */
function getNetworkConnection() {
  return navigator.connection || 
         navigator.mozConnection || 
         navigator.webkitConnection
}

/**
 * Extract connection info from Network Information API
 */
function getConnectionInfo() {
  const connection = getNetworkConnection()

  if (!connection) {
    return {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: null,
      rtt: null,
      saveData: false,
    }
  }

  return {
    // Connection type: wifi, cellular, bluetooth, ethernet, etc.
    type: connection.type || 'unknown',
    
    // Effective connection type: slow-2g, 2g, 3g, 4g
    effectiveType: connection.effectiveType || 'unknown',
    
    // Downlink speed in Mbps
    downlink: connection.downlink || null,
    
    // Round-trip time in ms
    rtt: connection.rtt || null,
    
    // User has enabled data saver mode
    saveData: connection.saveData || false,
  }
}

/**
 * Check if connection is slow
 */
export function isSlowConnection(connectionInfo) {
  if (!connectionInfo) return false
  
  const slowTypes = ['slow-2g', '2g']
  return slowTypes.includes(connectionInfo.effectiveType)
}

/**
 * Check if user wants to save data
 */
export function wantsSaveData(connectionInfo) {
  return connectionInfo?.saveData === true
}
