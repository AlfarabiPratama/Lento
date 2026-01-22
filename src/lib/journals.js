import { getDB, createBaseFields, markUpdated, markDeleted } from './db'
import { addToOutbox } from './outbox'

const STORE = 'journals'

/**
 * Journal Service - CRUD operations untuk jurnal
 */

/**
 * Get all journal entries (not deleted)
 */
export async function getAllJournals() {
    const db = await getDB()
    const all = await db.getAll(STORE)
    return all.filter(j => !j.deleted_at).sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
}

/**
 * Get journals for today
 */
export async function getTodayJournals() {
    const all = await getAllJournals()
    const today = new Date().toISOString().split('T')[0]
    return all.filter(j => j.created_at.startsWith(today))
}

/**
 * Get journal by ID
 */
export async function getJournal(id) {
    const db = await getDB()
    return db.get(STORE, id)
}

/**
 * Create new journal entry
 */
export async function createJournal({ content, mood = null, type = 'quick' }) {
    const db = await getDB()

    const journal = {
        ...createBaseFields(),
        content,
        mood, // 'great' | 'good' | 'okay' | 'bad' | 'awful' | null
        type, // 'quick' (3 menit) | 'free'
        word_count: content.trim().split(/\s+/).length,
    }

    await db.add(STORE, journal)
    await addToOutbox(STORE, 'create', journal)

    return journal
}

/**
 * Update journal entry
 */
export async function updateJournal(id, updates) {
    const db = await getDB()
    const journal = await db.get(STORE, id)

    if (!journal) throw new Error('Journal not found')

    const updated = markUpdated({
        ...journal,
        ...updates,
        word_count: updates.content
            ? updates.content.trim().split(/\s+/).length
            : journal.word_count,
    })

    await db.put(STORE, updated)
    await addToOutbox(STORE, 'update', updated)

    return updated
}

/**
 * Delete journal entry (soft delete)
 */
export async function deleteJournal(id) {
    const db = await getDB()
    const journal = await db.get(STORE, id)

    if (!journal) throw new Error('Journal not found')

    const deleted = markDeleted(journal)

    await db.put(STORE, deleted)
    await addToOutbox(STORE, 'delete', deleted)

    return deleted
}

/**
 * Get journal stats for dashboard
 */
export async function getJournalStats() {
    const all = await getAllJournals()
    const today = new Date().toISOString().split('T')[0]

    // Get this week's journals
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const thisWeek = all.filter(j => j.created_at.split('T')[0] >= weekStartStr)
    const todayCount = all.filter(j => j.created_at.startsWith(today)).length

    return {
        total: all.length,
        today: todayCount,
        this_week: thisWeek.length,
        total_words: all.reduce((sum, j) => sum + (j.word_count || 0), 0),
    }
}

export default {
    getAllJournals,
    getTodayJournals,
    getJournal,
    createJournal,
    updateJournal,
    deleteJournal,
    getJournalStats,
}
