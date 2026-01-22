/**
 * Journal Adapter - Convert journal entries to SearchDocument format
 * @ts-check
 */

import { getDB } from '../../../lib/db'

/**
 * Convert a journal entry to SearchDocument format
 * @param {Object} entry - Journal entry from IndexedDB
 * @returns {import('../types').SearchDocument}
 */
export function journalToSearchDoc(entry) {
    const title = entry.title || `Jurnal ${new Date(entry.date).toLocaleDateString('id-ID')}`

    return {
        id: entry.id,
        module: 'journal',
        title,
        body: `${entry.content || ''} ${entry.prompt || ''}`.trim(),
        tags: entry.tags || [],
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        meta: {
            mood: entry.mood,
            prompt: entry.prompt,
        },
    }
}

/**
 * Get all journal entries as SearchDocuments
 * @returns {Promise<import('../types').SearchDocument[]>}
 */
export async function getAllJournalDocs() {
    try {
        const db = await getDB()
        const entries = await db.getAll('journal_entries')
        return entries.map(journalToSearchDoc)
    } catch (err) {
        console.error('Failed to get journal docs:', err)
        return []
    }
}
