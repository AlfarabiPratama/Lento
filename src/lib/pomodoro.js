import { getDB, generateId, now, today, createBaseFields, markDeleted } from './db'
import { addToOutbox } from './outbox'

/**
 * Pomodoro Service
 * 
 * Session: { id, user_id, date, duration_minutes, focus_label, habit_id?, completed, started_at, ended_at, ... }
 */

// Default settings
export const POMODORO_DEFAULTS = {
    work_duration: 25, // minutes
    short_break: 5,
    long_break: 15,
    sessions_until_long_break: 4,
}

/**
 * Get pomodoro settings
 */
export async function getSettings() {
    const db = await getDB()
    const stored = await db.get('settings', 'pomodoro')
    return stored?.value || POMODORO_DEFAULTS
}

/**
 * Save pomodoro settings
 */
export async function saveSettings(settings) {
    const db = await getDB()
    await db.put('settings', {
        key: 'pomodoro',
        value: { ...POMODORO_DEFAULTS, ...settings }
    })
}

/**
 * Create a new pomodoro session
 * @param {object} options - Session options
 * @param {number} options.duration_minutes - Duration in minutes
 * @param {string} options.focus_label - Label for the session
 * @param {string} options.habit_id - Optional habit ID
 * @param {string} options.session_mode - 'general' | 'reading'
 * @param {string} options.book_id - Optional book ID (for reading mode)
 */
export async function createSession({
    duration_minutes = 25,
    focus_label = '',
    habit_id = null,
    session_mode = 'general',
    book_id = null
} = {}) {
    const db = await getDB()

    const session = {
        ...createBaseFields(),
        date: today(),
        duration_minutes,
        focus_label,
        habit_id,
        session_mode, // 'general' | 'reading'
        book_id,      // Book ID if reading mode
        logged_to_book: false, // Prevent double-logging
        completed: false,
        started_at: now(),
        ended_at: null,
    }

    await db.add('pomodoro_sessions', session)
    await addToOutbox('pomodoro_sessions', 'create', session)

    return session
}

/**
 * Mark session as completed
 * @param {string} sessionId - Session ID
 * @param {boolean} logToBook - Whether reading was logged to book
 */
export async function completeSession(sessionId, logToBook = false) {
    const db = await getDB()
    const session = await db.get('pomodoro_sessions', sessionId)

    if (!session) return null

    const updated = {
        ...session,
        completed: true,
        ended_at: now(),
        updated_at: now(),
        logged_to_book: logToBook,
        sync_status: 'dirty',
    }

    await db.put('pomodoro_sessions', updated)
    await addToOutbox('pomodoro_sessions', 'update', updated)

    return updated
}

/**
 * Cancel/delete session
 */
export async function deleteSession(sessionId) {
    const db = await getDB()
    const session = await db.get('pomodoro_sessions', sessionId)

    if (!session) return

    const deleted = markDeleted(session)
    await db.put('pomodoro_sessions', deleted)
    await addToOutbox('pomodoro_sessions', 'delete', deleted)
}

/**
 * Get sessions for a specific date
 */
export async function getSessionsByDate(date = today()) {
    const db = await getDB()
    const allSessions = await db.getAllFromIndex('pomodoro_sessions', 'by_date', date)
    return allSessions.filter(s => !s.deleted_at && s.completed)
}

/**
 * Get today's session count
 */
export async function getTodaySessionCount() {
    const sessions = await getSessionsByDate(today())
    return sessions.length
}

/**
 * Get total focus minutes today
 */
export async function getTodayFocusMinutes() {
    const sessions = await getSessionsByDate(today())
    return sessions.reduce((total, s) => total + (s.duration_minutes || 0), 0)
}

/**
 * Get weekly stats
 */
export async function getWeekStats() {
    const db = await getDB()
    const allSessions = await db.getAll('pomodoro_sessions')

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weekSessions = allSessions.filter(s => {
        if (s.deleted_at || !s.completed) return false
        const sessionDate = new Date(s.date)
        return sessionDate >= weekAgo
    })

    return {
        total_sessions: weekSessions.length,
        total_minutes: weekSessions.reduce((t, s) => t + (s.duration_minutes || 0), 0),
    }
}
