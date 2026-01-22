/**
 * Books Adapter - Convert books to SearchDocument format
 * @ts-check
 */

import { getAllBooks } from '../../../lib/booksRepo.js'

/**
 * Convert a book to SearchDocument format
 * @param {Object} book - Book from IndexedDB
 * @returns {import('../types').SearchDocument}
 */
export function bookToSearchDoc(book) {
    // Build searchable body from authors, ISBN, description
    const bodyParts = [
        book.authors?.join(', '),
        book.identifiers?.isbn13,
        book.identifiers?.isbn10,
        book.summary,
        book.status,
        book.format,
    ].filter(Boolean)

    return {
        id: book.id,
        module: 'book',
        title: book.title || 'Untitled Book',
        body: bodyParts.join(' '),
        tags: book.tags || [],
        created_at: book.createdAt,
        updated_at: book.updatedAt,
        meta: {
            authors: book.authors,
            status: book.status,
            format: book.format,
            progress: book.progress,
            cover: book.cover?.url,
            isbn: book.identifiers?.isbn13 || book.identifiers?.isbn10,
        },
    }
}

/**
 * Get all books as SearchDocuments
 * @returns {Promise<import('../types').SearchDocument[]>}
 */
export async function getAllBookDocs() {
    try {
        const books = await getAllBooks()
        return books.map(bookToSearchDoc)
    } catch (err) {
        console.error('Failed to get book docs:', err)
        return []
    }
}
