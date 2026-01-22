/**
 * Calendar Date Utilities
 * 
 * Helper functions for week and month calculations
 */

/**
 * Get start of week (Monday)
 * @param {Date} date 
 * @returns {Date}
 */
export function getStartOfWeek(date) {
    const d = new Date(date)
    const day = d.getDay() // 0=Sunday, 1=Monday, ...
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to get Monday
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
}

/**
 * Get end of week (Sunday)
 * @param {Date} date 
 * @returns {Date}
 */
export function getEndOfWeek(date) {
    const start = getStartOfWeek(date)
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
}

/**
 * Get array of 7 days for a week
 * @param {Date} anchorDate 
 * @returns {Date[]}
 */
export function getWeekDays(anchorDate) {
    const start = getStartOfWeek(anchorDate)
    return Array.from({ length: 7 }, (_, i) =>
        new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    )
}

/**
 * Navigate to previous period based on view mode
 * @param {Date} currentDate 
 * @param {'month' | 'week'} viewMode 
 * @returns {Date}
 */
export function goPrev(currentDate, viewMode) {
    if (viewMode === 'week') {
        return new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() - 7
        )
    }
    // month mode
    return new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
}

/**
 * Navigate to next period based on view mode
 * @param {Date} currentDate 
 * @param {'month' | 'week'} viewMode 
 * @returns {Date}
 */
export function goNext(currentDate, viewMode) {
    if (viewMode === 'week') {
        return new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + 7
        )
    }
    // month mode
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
}

/**
 * Format date key as YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
export function toDateKey(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/**
 * Check if two dates are the same day
 * @param {Date} d1 
 * @param {Date} d2 
 * @returns {boolean}
 */
export function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
}
