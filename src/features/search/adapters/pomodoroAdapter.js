/**
 * Pomodoro Adapter - Convert sessions to SearchDocument format
 * @ts-check
 */

import { getDB } from '../../../lib/db'

/**
 * Convert a pomodoro session to SearchDocument format
 * @param {Object} session - Session from IndexedDB
 * @returns {import('../types').SearchDocument}
 */
export function pomodoroToSearchDoc(session) {
    const dateStr = new Date(session.started_at).toLocaleDateString('id-ID')
    const title = session.task || `Fokus ${dateStr}`

    return {
        id: session.id,
        module: 'pomodoro',
        title,
        body: session.task || '',
        tags: [],
        created_at: session.started_at,
        updated_at: session.completed_at || session.started_at,
        meta: {
            duration_min: session.duration_minutes || 25,
        },
    }
}

/**
 * Get all pomodoro sessions as SearchDocuments
 * @returns {Promise<import('../types').SearchDocument[]>}
 */
export async function getAllPomodoroDocs() {
    try {
        const db = await getDB()
        const sessions = await db.getAll('pomodoro_sessions')
        return sessions.map(pomodoroToSearchDoc)
    } catch (err) {
        console.error('Failed to get pomodoro docs:', err)
        return []
    }
}
