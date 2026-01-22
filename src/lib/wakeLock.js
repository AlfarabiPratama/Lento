/**
 * Screen Wake Lock API Utility
 * 
 * Prevents screen from dimming/sleeping during Pomodoro focus sessions.
 * Essential for timer apps.
 */

let wakeLock = null

/**
 * Request screen wake lock
 * @returns {Promise<boolean>} Success status
 */
export async function requestWakeLock() {
    if (!('wakeLock' in navigator)) {
        console.log('[WakeLock] API not supported')
        return false
    }

    try {
        wakeLock = await navigator.wakeLock.request('screen')

        // Re-acquire if visibility changes (e.g., tab switch back)
        wakeLock.addEventListener('release', () => {
            console.log('[WakeLock] Released')
            wakeLock = null
        })

        console.log('[WakeLock] Acquired')
        return true
    } catch (error) {
        console.warn('[WakeLock] Failed:', error.message)
        return false
    }
}

/**
 * Release wake lock
 */
export async function releaseWakeLock() {
    if (wakeLock) {
        try {
            await wakeLock.release()
            wakeLock = null
            console.log('[WakeLock] Manually released')
            return true
        } catch (error) {
            console.warn('[WakeLock] Release failed:', error)
            return false
        }
    }
    return true
}

/**
 * Check if wake lock is currently active
 */
export function isWakeLockActive() {
    return wakeLock !== null
}

/**
 * Check if wake lock API is supported
 */
export function isWakeLockSupported() {
    return 'wakeLock' in navigator
}

/**
 * Re-acquire wake lock on visibility change
 * Call this in a useEffect when timer is running
 */
export async function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && !wakeLock) {
        await requestWakeLock()
    }
}

export default {
    requestWakeLock,
    releaseWakeLock,
    isWakeLockActive,
    isWakeLockSupported,
    handleVisibilityChange,
}
