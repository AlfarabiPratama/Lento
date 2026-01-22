/**
 * PWA Badge API Utility
 * 
 * Show badge on app icon for pending items (quests, inbox, etc.)
 * Works on supported platforms (Chrome, Edge, Safari 16+)
 */

/**
 * Set badge count on app icon
 * @param {number} count - Number to show (0 clears the badge)
 */
export async function setBadge(count) {
    if (!('setAppBadge' in navigator)) {
        console.log('[Badge] API not supported')
        return false
    }

    try {
        if (count > 0) {
            await navigator.setAppBadge(count)
        } else {
            await navigator.clearAppBadge()
        }
        return true
    } catch (error) {
        // Silently fail - badge is non-critical
        console.warn('[Badge] Failed:', error)
        return false
    }
}

/**
 * Clear badge from app icon
 */
export async function clearBadge() {
    return await setBadge(0)
}

/**
 * Check if badge API is supported
 */
export function isBadgeSupported() {
    return 'setAppBadge' in navigator
}

/**
 * Update badge based on pending counts
 * Call this on data changes
 */
export async function updateBadgeFromPending(pendingCounts) {
    const { quests = 0, inbox = 0, unsynced = 0 } = pendingCounts
    const total = quests + inbox + unsynced
    return await setBadge(total)
}

export default {
    setBadge,
    clearBadge,
    isBadgeSupported,
    updateBadgeFromPending,
}
