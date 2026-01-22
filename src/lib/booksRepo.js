import { getDB, generateId, now } from './db'

/**
 * Books Repository - CRUD operations for books
 */

export async function getAllBooks() {
    const db = await getDB()
    const books = await db.getAll('books')
    return books.filter(book => !book.deleted)
}

export async function getBooksByStatus(status) {
    const db = await getDB()
    const books = await db.getAllFromIndex('books', 'by_status', status)
    return books.filter(book => !book.deleted)
}

export async function getBookById(id) {
    const db = await getDB()
    return await db.get('books', id)
}

export async function getCurrentReadingBooks() {
    return await getBooksByStatus('reading')
}

export async function findDuplicateBook(bookData) {
    const { isbn13, isbn10, olid, title, authors } = bookData
    const db = await getDB()

    // Priority 1: ISBN-13 (most reliable)
    if (isbn13) {
        const allBooks = await getAllBooks()
        const existing = allBooks.find(book =>
            book.identifiers?.isbn13 === isbn13
        )
        if (existing) return existing
    }

    // Priority 2: OLID
    if (olid) {
        const allBooks = await getAllBooks()
        const existing = allBooks.find(book =>
            book.identifiers?.olid === olid
        )
        if (existing) return existing
    }

    // Priority 3: Normalized title + first author
    if (title && authors?.[0]) {
        const titleNorm = title.toLowerCase().trim()
        const authorNorm = authors[0].toLowerCase().trim()

        const allBooks = await getAllBooks()
        const existing = allBooks.find(book => {
            const tMatch = book.title?.toLowerCase().trim() === titleNorm
            const aMatch = book.authors?.[0]?.toLowerCase().trim() === authorNorm
            return tMatch && aMatch
        })

        if (existing) return existing
    }

    return null
}

export async function createBook(bookData) {
    const db = await getDB()

    // Check for duplicates first
    const duplicate = await findDuplicateBook(bookData)
    if (duplicate) {
        return {
            type: 'duplicate',
            existing: duplicate,
            message: `Buku "${duplicate.title}" sudah ada di library.`
        }
    }

    const book = {
        id: generateId(),
        title: bookData.title,
        authors: bookData.authors || [],
        source: bookData.source || 'manual',
        identifiers: bookData.identifiers || {},
        cover: bookData.cover || {},
        format: bookData.format || 'paper',
        status: bookData.status || 'tbr',
        progress: {
            unit: bookData.progress?.unit || (bookData.format === 'audio' ? 'minutes' : 'pages'),
            current: 0,
            total: bookData.progress?.total || null
        },
        dates: {},
        tags: bookData.tags || [],
        rating: null,
        summary: bookData.summary || bookData.description || null,
        archived: false,
        deleted: false,
        deletedAt: null,
        createdAt: now(),
        updatedAt: now(),
        user_id: 'local',
        sync_status: 'pending'
    }

    await db.put('books', book)
    return { type: 'created', book }
}

export async function updateBook(id, updates) {
    const db = await getDB()
    const book = await getBookById(id)

    if (!book) {
        throw new Error('Book not found')
    }

    const updated = {
        ...book,
        ...updates,
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('books', updated)
    return updated
}

export async function deleteBook(id) {
    const db = await getDB()
    const book = await getBookById(id)

    if (!book) {
        throw new Error('Book not found')
    }

    // Soft delete (tombstone)
    const updated = {
        ...book,
        deleted: true,
        deletedAt: now(),
        archived: true,
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('books', updated)

    // Also soft delete related sessions and notes
    const sessions = await db.getAllFromIndex('book_sessions', 'by_book', id)
    for (const session of sessions) {
        await db.put('book_sessions', {
            ...session,
            deleted: true,
            deletedAt: now(),
            updatedAt: now(),
            sync_status: 'pending'
        })
    }

    const notes = await db.getAllFromIndex('book_notes', 'by_book', id)
    for (const note of notes) {
        await db.put('book_notes', {
            ...note,
            deleted: true,
            deletedAt: now(),
            updatedAt: now(),
            sync_status: 'pending'
        })
    }

    return updated
}

/**
 * Restore a soft-deleted book
 */
export async function restoreBook(id) {
    const db = await getDB()
    const book = await getBookById(id)

    if (!book) {
        throw new Error('Book not found')
    }

    const restored = {
        ...book,
        deleted: false,
        deletedAt: null,
        archived: false,
        updatedAt: now(),
        sync_status: 'pending'
    }

    await db.put('books', restored)

    // Also restore related sessions
    const sessions = await db.getAllFromIndex('book_sessions', 'by_book', id)
    for (const session of sessions.filter(s => s.deleted)) {
        await db.put('book_sessions', {
            ...session,
            deleted: false,
            deletedAt: null,
            updatedAt: now(),
            sync_status: 'pending'
        })
    }

    return restored
}

export async function searchBooks(query) {
    const allBooks = await getAllBooks()
    const q = query.toLowerCase().trim()

    return allBooks.filter(book => {
        const titleMatch = book.title?.toLowerCase().includes(q)
        const authorMatch = book.authors?.some(a => a.toLowerCase().includes(q))
        const tagMatch = book.tags?.some(t => t.toLowerCase().includes(q))

        return titleMatch || authorMatch || tagMatch
    })
}
