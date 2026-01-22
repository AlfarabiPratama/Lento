import { useState } from 'react'
import BookRow from '../molecules/BookRow'
import { ProgressLogSheet } from '../organisms/ProgressLogSheet'
import { BOOK_STATUSES } from '../../../features/books/constants.js'
import { IconBook, IconSearch } from '@tabler/icons-react'
import { EmptyStates } from '../../ui/EmptyState'

/**
 * BooksList - Library list with filters, search, and progress logging
 */
export function BooksList({ books, onRefresh }) {
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Progress sheet state
    const [progressBook, setProgressBook] = useState(null)
    const [showProgressSheet, setShowProgressSheet] = useState(false)

    const filteredBooks = books.filter(book => {
        // Status filter
        if (statusFilter !== 'all' && book.status !== statusFilter) {
            return false
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const titleMatch = book.title.toLowerCase().includes(query)
            const authorMatch = book.authors?.some(a => a.toLowerCase().includes(query))
            const tagMatch = book.tags?.some(t => t.toLowerCase().includes(query))
            return titleMatch || authorMatch || tagMatch
        }

        return true
    })

    function handleProgressClick(book) {
        setProgressBook(book)
        setShowProgressSheet(true)
    }

    function handleProgressClose() {
        setShowProgressSheet(false)
        setProgressBook(null)
    }

    function handleProgressUpdate() {
        if (onRefresh) onRefresh()
    }

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <IconSearch size={20} stroke={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul, penulis, atau tag..."
                    className="w-full pl-10 pr-4 py-2 border border-line rounded-lg text-body text-ink focus:border-primary focus:outline-none"
                />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 w-full">
                <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-small font-medium whitespace-nowrap transition-colors ${statusFilter === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-paper-warm text-ink-muted hover:text-ink'
                        }`}
                >
                    Semua ({books.length})
                </button>
                {Object.values(BOOK_STATUSES).map(status => {
                    const count = books.filter(b => b.status === status.value).length
                    return (
                        <button
                            key={status.value}
                            onClick={() => setStatusFilter(status.value)}
                            className={`px-3 py-1.5 rounded-lg text-small font-medium whitespace-nowrap transition-colors ${statusFilter === status.value
                                ? 'bg-primary text-white'
                                : 'bg-paper-warm text-ink-muted hover:text-ink'
                                }`}
                        >
                            {status.shortLabel} ({count})
                        </button>
                    )
                })}
            </div>

            {/* Books List */}
            {filteredBooks.length > 0 ? (
                <div className="space-y-2">
                    {filteredBooks.map(book => (
                        <BookRow
                            key={book.id}
                            book={book}
                            onProgressClick={handleProgressClick}
                        />
                    ))}
                </div>
            ) : (
                searchQuery || statusFilter !== 'all' ? (
                    <EmptyStates.NoSearchResults query={searchQuery || statusFilter} />
                ) : (
                    <div className="text-center py-12">
                        <IconBook size={48} stroke={1.5} className="text-ink-light mx-auto mb-3" />
                        <p className="text-body text-ink-muted">
                            Belum ada buku di library
                        </p>
                    </div>
                )
            )}

            {/* Progress Log Sheet */}
            <ProgressLogSheet
                book={progressBook}
                isOpen={showProgressSheet}
                onClose={handleProgressClose}
                onUpdate={handleProgressUpdate}
            />
        </div>
    )
}

export default BooksList

