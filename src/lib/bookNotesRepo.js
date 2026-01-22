import { getDB, generateId, now } from './db'

/**
 * Book Notes Repository - CRUD operations for book notes
 * 
 * Note types:
 * - 'dnf_reason' - Reason why book was marked as Did Not Finish
 * - 'note' - General note about the book
 * - 'highlight' - Text highlight from the book
 * - 'quote' - Memorable quote from the book
 */

const NOTE_TYPES = {
    DNF_REASON: 'dnf_reason',
    NOTE: 'note',
    HIGHLIGHT: 'highlight',
    QUOTE: 'quote',
}

export { NOTE_TYPES }

/**
 * Get all notes for a book
 */
export async function getBookNotes(bookId) {
    const db = await getDB()
    const notes = await db.getAllFromIndex('book_notes', 'by_book', bookId)
    return notes.filter(note => !note.deleted)
}

/**
 * Get notes by type
 */
export async function getBookNotesByType(bookId, type) {
    const notes = await getBookNotes(bookId)
    return notes.filter(note => note.type === type)
}

/**
 * Create a new book note
 */
export async function createBookNote({ bookId, type, content, metadata = {} }) {
    const db = await getDB()

    const note = {
        id: generateId(),
        bookId,
        type,
        content,
        metadata,
        deleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
        user_id: 'local',
        sync_status: 'pending'
    }

    await db.put('book_notes', note)
    return note
}

/**
 * Update a book note
 */
export async function updateBookNote(id, updates) {
    const db = await getDB()
    const note = await db.get('book_notes', id)

    if (!note) {
        throw new Error('Note not found')
    }

    const updated = {
        ...note,
        ...updates,
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('book_notes', updated)
    return updated
}

/**
 * Delete a book note (soft delete)
 */
export async function deleteBookNote(id) {
    const db = await getDB()
    const note = await db.get('book_notes', id)

    if (!note) {
        throw new Error('Note not found')
    }

    const deleted = {
        ...note,
        deleted: true,
        deletedAt: now(),
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('book_notes', deleted)
    return deleted
}

/**
 * Create a DNF reason note
 */
export async function saveDNFReason(bookId, reason) {
    return await createBookNote({
        bookId,
        type: NOTE_TYPES.DNF_REASON,
        content: reason,
        metadata: {
            markedAt: now()
        }
    })
}

/**
 * Get DNF reason for a book
 */
export async function getDNFReason(bookId) {
    const dnfNotes = await getBookNotesByType(bookId, NOTE_TYPES.DNF_REASON)
    // Return the most recent DNF reason
    return dnfNotes.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )[0] || null
}
