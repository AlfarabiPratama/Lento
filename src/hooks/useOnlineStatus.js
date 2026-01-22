import { useEffect, useState } from 'react'

/**
 * useOnlineStatus - Track online/offline status
 * 
 * Returns true if online, false if offline
 */
export function useOnlineStatus() {
    const [online, setOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    )

    useEffect(() => {
        const handleOnline = () => setOnline(true)
        const handleOffline = () => setOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return online
}

export default useOnlineStatus
