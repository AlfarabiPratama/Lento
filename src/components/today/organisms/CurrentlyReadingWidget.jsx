import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IconBook, IconPlus, IconChevronRight, IconClock } from '@tabler/icons-react'
import { getCurrentReadingBooks } from '../../../lib/booksRepo.js'
import BookCover from '../../books/atoms/BookCover'

/**
 * CurrentlyReading Widget - Shows books being read on Today page
 */
export function CurrentlyReadingWidget({ onLogProgress, onStartPomodoro }) {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCurrentlyReading()
    }, [])

    async function loadCurrentlyReading() {
        try {
            const readingBooks = await getCurrentReadingBooks()

            // Sort by most recently updated
            readingBooks.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            )

            // Limit to top 3
            setBooks(readingBooks.slice(0, 3))
        } catch (error) {
            console.error('Failed to load reading books:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="card p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-paper-warm rounded w-32" />
                    <div className="h-16 bg-paper-warm rounded" />
                </div>
            </div>
        )
    }

    if (books.length === 0) {
        return (
            <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-small font-medium text-ink flex items-center gap-2">
                        <IconBook size={16} stroke={2} className="text-primary" />
                        Sedang Dibaca
                    </h3>
                </div>
                <div className="text-center py-4">
                    <p className="text-small text-ink-muted mb-3">
                        Belum ada buku yang sedang dibaca
                    </p>
                    <Link
                        to="/books"
                        className="text-primary text-small hover:underline"
                    >
                        Lihat Library →
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="card p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-small font-medium text-ink flex items-center gap-2">
                    <IconBook size={16} stroke={2} className="text-primary" />
                    Sedang Dibaca
                </h3>
                <Link
                    to="/books"
                    className="text-tiny text-primary hover:underline flex items-center gap-1"
                >
                    Lihat semua
                    <IconChevronRight size={14} stroke={2} />
                </Link>
            </div>

            {/* Books list */}
            <div className="space-y-3">
                {books.map(book => (
                    <CurrentlyReadingItem
                        key={book.id}
                        book={book}
                        onLogProgress={onLogProgress}
                        onStartPomodoro={onStartPomodoro}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Individual book item in widget
 */
function CurrentlyReadingItem({ book, onLogProgress, onStartPomodoro }) {
    const progress = book.progress?.current || 0
    const total = book.progress?.total || 100
    const progressPercent = total > 0 ? Math.round((progress / total) * 100) : 0

    return (
        <div className="flex items-center gap-3 group">
            {/* Cover */}
            <Link to={`/books/${book.id}`}>
                <BookCover book={book} size="small" />
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <Link
                    to={`/books/${book.id}`}
                    className="text-small font-medium text-ink hover:text-primary truncate block"
                >
                    {book.title}
                </Link>

                {/* Progress bar */}
                <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-paper-warm rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="text-tiny text-ink-muted whitespace-nowrap">
                        {progressPercent}%
                    </span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                {/* Pomodoro timer button */}
                {onStartPomodoro && (
                    <button
                        onClick={() => onStartPomodoro(book)}
                        className="p-2 rounded-lg bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors"
                        title="Mulai Pomodoro Baca"
                    >
                        <IconClock size={16} stroke={2} />
                    </button>
                )}

                {/* Quick log button */}
                {onLogProgress && (
                    <button
                        onClick={() => onLogProgress(book)}
                        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="Log Progress"
                    >
                        <IconPlus size={16} stroke={2} />
                    </button>
                )}
            </div>
        </div>
    )
}

export default CurrentlyReadingWidget

