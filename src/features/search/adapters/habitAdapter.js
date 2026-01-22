/**
 * Habit Adapter - Convert habits to SearchDocument format
 * @ts-check
 */

import { getDB } from '../../../lib/db'

/**
 * Convert a habit to SearchDocument format
 * @param {Object} habit - Habit from IndexedDB
 * @returns {import('../types').SearchDocument}
 */
export function habitToSearchDoc(habit) {
    return {
        id: habit.id,
        module: 'habit',
        title: habit.name || 'Untitled Habit',
        body: habit.description || habit.name || '',
        tags: habit.tags || [],
        created_at: habit.created_at,
        updated_at: habit.updated_at,
        meta: {
            streak: habit.current_streak || 0,
        },
    }
}

/**
 * Get all habits as SearchDocuments
 * @returns {Promise<import('../types').SearchDocument[]>}
 */
export async function getAllHabitDocs() {
    try {
        const db = await getDB()
        const habits = await db.getAll('habits')
        return habits.map(habitToSearchDoc)
    } catch (err) {
        console.error('Failed to get habit docs:', err)
        return []
    }
}
