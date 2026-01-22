/**
 * useClockMinute - Update clock every minute (battery efficient)
 * 
 * - Uses setTimeout to sync with minute boundary
 * - Updates per minute, not per second
 * - Pauses when tab is hidden (optional optimization)
 */
import { useEffect, useState } from 'react'

export function useClockMinute() {
    const [now, setNow] = useState(() => new Date())

    useEffect(() => {
        let intervalId
        let timeoutId

        const schedule = () => {
            const d = new Date()
            // Calculate ms until next minute boundary
            const msToNextMinute = (60 - d.getSeconds()) * 1000 - d.getMilliseconds()

            timeoutId = window.setTimeout(() => {
                setNow(new Date())

                // Then update every 60 seconds
                intervalId = window.setInterval(() => {
                    // Pause updates when tab hidden (battery optimization)
                    if (!document.hidden) {
                        setNow(new Date())
                    }
                }, 60_000)
            }, msToNextMinute)
        }

        schedule()

        return () => {
            if (timeoutId) window.clearTimeout(timeoutId)
            if (intervalId) window.clearInterval(intervalId)
        }
    }, [])

    return now
}

export default useClockMinute
