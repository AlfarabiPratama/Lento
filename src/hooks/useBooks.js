import { useState, useEffect, useCallback } from 'react'
import { getAllBooks, getCurrentReadingBooks, getBooksByStatus } from '../lib/booksRepo'

/**
 * useBooks - Hook for accessing books data
 * 
 * Returns:
 * - currentlyReading: Books with status 'reading'
 * - recentBooks: Recently updated books
 * - loading: Loading state
 * - refresh: Function to reload data
 */
export function useBooks() {
    const [currentlyReading, setCurrentlyReading] = useState([])
    const [recentBooks, setRecentBooks] = useState([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            setLoading(true)

            // Get currently reading books
            const reading = await getCurrentReadingBooks()
            setCurrentlyReading(reading.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            ))

            // Get all books for recent (last 5 updated)
            const all = await getAllBooks()
            const sorted = all.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            )
            setRecentBooks(sorted.slice(0, 5))

        } catch (err) {
            console.error('Failed to load books:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    return {
        currentlyReading,
        recentBooks,
        loading,
        refresh: load,
        // Helper: get the primary book (most recently updated reading book)
        primaryBook: currentlyReading[0] || null,
    }
}

/**
 * useBook - Hook for single book details
 */
export function useBook(bookId) {
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!bookId) {
            setLoading(false)
            return
        }

        const load = async () => {
            try {
                setLoading(true)
                const { getBookById } = await import('../lib/booksRepo')
                const bookData = await getBookById(bookId)
                setBook(bookData)
            } catch (err) {
                console.error('Failed to load book:', err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [bookId])

    return { book, loading }
}

export default useBooks
