import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconBook } from '@tabler/icons-react'
import BooksList from '../components/books/organisms/BooksList'
import BookForm from '../components/books/molecules/BookForm'
import LogSessionSheet from '../components/books/organisms/LogSessionSheet'
import WeeklyReadingStats from '../components/books/organisms/WeeklyReadingStats'
import { getAllBooks, createBook } from '../lib/booksRepo.js'
import { applyBookProgress } from '../features/books/domain/bookProgress.js'
import { ListSkeleton } from '../components/ui/Skeleton'
import { useToast } from '../contexts/ToastContext'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { EmptyStates } from '../components/ui/EmptyState'
import { PullToRefresh } from '../components/ui/PullToRefresh'
import { haptics } from '../utils/haptics'

/**
 * Books Page - Library
 */
function Books() {
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [selectedBookForLog, setSelectedBookForLog] = useState(null)
    const [duplicateBook, setDuplicateBook] = useState(null)

    useEffect(() => {
        loadBooks()
    }, [])

    async function loadBooks() {
        try {
            const allBooks = await getAllBooks()
            setBooks(allBooks.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            ))
        } catch (error) {
            console.error('Failed to load books:', error)
            showToast('error', 'Gagal memuat library buku')
        } finally {
            setLoading(false)
        }
    }

    async function handleAddBook(bookData) {
        const result = await createBook(bookData)

        if (result.type === 'duplicate') {
            const confirmed = window.confirm(
                `${result.message}\n\nBuka halaman buku tersebut?`
            )
            if (confirmed) {
                navigate(`/books/${result.existing.id}`)
            }
            return
        }

        if (result.type === 'created') {
            await loadBooks()
            setShowAddForm(false)
            navigate(`/books/${result.book.id}`)
        }
    }

    async function handleQuickLog(book, delta) {
        try {
            await applyBookProgress({
                book,
                delta,
                unit: book.progress.unit,
                occurredAt: new Date().toISOString(),
                source: 'manual'
            })
            await loadBooks()
            haptics.success() // ✨ Completion feedback
            showToast('success', 'Progress berhasil dicatat!')
        } catch (error) {
            console.error('Quick log failed:', error)
            haptics.error()
            showToast('error', 'Gagal mencatat progress')
            // Show LogSessionSheet for more control
            setSelectedBookForLog(book)
        }
    }

    // Pull-to-refresh handler
    async function handleRefresh() {
        await loadBooks()
        haptics.light()
    }

    async function handleLogSuccess() {
        await loadBooks()
        setSelectedBookForLog(null)
        showToast('success', 'Sesi bacaan berhasil dicatat!')
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in">
                {/* Header skeleton */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="h-7 w-32 bg-paper-warm rounded animate-pulse mb-2" />
                        <div className="h-4 w-20 bg-paper-warm rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-24 bg-paper-warm rounded-lg animate-pulse" />
                </div>
                {/* Content skeleton */}
                <ListSkeleton count={4} />
            </div>
        )
    }

    return (
        <>
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="w-full min-w-0 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h1 className="text-h1 text-ink">Library Buku</h1>
                    <p className="text-small text-ink-muted mt-1">
                        {books.length} buku di library
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary flex items-center gap-2 flex-shrink-0"
                    aria-label="Tambah Buku"
                >
                    <IconPlus size={20} stroke={2} />
                    <span className="hidden sm:inline">Tambah Buku</span>
                </button>
            </div>

            {/* Weekly Reading Stats */}
            {books.length > 0 && (
                <WeeklyReadingStats />
            )}

            {/* Books List or Empty State */}
            {books.length === 0 ? (
                <EmptyStates.NoBooks onAddBook={() => setShowAddForm(true)} />
            ) : (
                <BooksList
                    books={books}
                    onRefresh={loadBooks}
                />
            )}
            </div>
        </PullToRefresh>

            {/* Add Book Form Modal */}
            {showAddForm && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
                    onClick={() => setShowAddForm(false)}
                >
                    <div 
                        className="bg-surface rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 slide-in-from-bottom-8 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-h2 text-ink mb-4">Tambah Buku Baru</h2>
                        <BookForm
                            onSubmit={handleAddBook}
                            onCancel={() => setShowAddForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* Log Session Sheet */}
            {selectedBookForLog && (
                <LogSessionSheet
                    book={selectedBookForLog}
                    onClose={() => setSelectedBookForLog(null)}
                    onSuccess={handleLogSuccess}
                />
            )}

            {/* Duplicate Book Dialog */}
            <ConfirmDialog
                open={duplicateBook !== null}
                title="Buku Sudah Ada"
                message={`Buku "${duplicateBook?.title}" sudah ada di library Anda.`}
                confirmText="Buka Halaman"
                cancelText="Tutup"
                variant="default"
                onConfirm={() => {
                    navigate(`/books/${duplicateBook.id}`)
                    setDuplicateBook(null)
                }}
                onCancel={() => setDuplicateBook(null)}
            />
        </>
    )
}

export default Books
