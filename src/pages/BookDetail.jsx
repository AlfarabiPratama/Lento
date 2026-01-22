import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconEdit, IconTrash, IconPlus, IconClock } from '@tabler/icons-react'
import BookCover from '../components/books/atoms/BookCover'
import StatusChip from '../components/books/atoms/StatusChip'
import FormatChip from '../components/books/atoms/FormatChip'
import ProgressPill from '../components/books/atoms/ProgressPill'
import ProgressLogSheet from '../components/books/organisms/ProgressLogSheet'
import BookForm from '../components/books/molecules/BookForm'
import { getBookById, updateBook, deleteBook, restoreBook } from '../lib/booksRepo.js'
import { getSessionsByBook } from '../lib/bookSessionsRepo.js'
import { markFinished, markDNF } from '../features/books/domain/bookProgress.js'
import { getUnitConfig } from '../features/books/constants.js'
import { useToast } from '../contexts/ToastContext'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { EmptyStates } from '../components/ui/EmptyState'

/**
 * BookDetail Page - Individual book view
 */
function BookDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [book, setBook] = useState(null)
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showProgressSheet, setShowProgressSheet] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)

    useEffect(() => {
        loadBookData()
    }, [id])

    async function loadBookData() {
        try {
            const bookData = await getBookById(id)
            if (!bookData || bookData.deleted) {
                navigate('/books')
                return
            }
            setBook(bookData)

            const sessionData = await getSessionsByBook(id)
            setSessions(sessionData)
        } catch (error) {
            console.error('Failed to load book:', error)
            showToast('error', 'Gagal memuat data buku')
            navigate('/books')
        } finally {
            setLoading(false)
        }
    }

    async function handleMarkFinished() {
        const confirmed = window.confirm('Tandai buku sebagai selesai?')
        if (confirmed) {
            try {
                const updated = await markFinished(book)
                setBook(updated)
            } catch (error) {
                console.error('Failed to mark finished:', error)
            }
        }
    }

    async function handleMarkDNF() {
        const reason = window.prompt('Alasan tidak melanjutkan? (opsional)')
        try {
            const updated = await markDNF(book, reason)
            setBook(updated)
        } catch (error) {
            console.error('Failed to mark DNF:', error)
        }
    }

    async function handleDelete() {
        setShowDeleteConfirm(false)

        try {
            const deletedBook = await deleteBook(id)
            navigate('/books')

            // Show toast with undo action (5s window)
            showToast('success', 'Buku berhasil dihapus', {
                duration: 5000,
                action: {
                    label: 'Undo',
                    onClick: async () => {
                        try {
                            await restoreBook(deletedBook.id)
                            showToast('success', 'Buku berhasil dipulihkan')
                            navigate(`/books/${deletedBook.id}`)
                        } catch (error) {
                            console.error('Failed to restore book:', error)
                            showToast('error', 'Gagal memulihkan buku')
                        }
                    }
                }
            })
        } catch (error) {
            console.error('Failed to delete book:', error)
            showToast('error', 'Gagal menghapus buku')
        }
    }

    async function handleEdit(bookData) {
        try {
            await updateBook(id, bookData)
            setShowEditForm(false)
            await loadBookData()
            showToast('success', 'Buku berhasil diupdate!')
        } catch (error) {
            console.error('Failed to update book:', error)
            showToast('error', 'Gagal mengupdate buku')
        }
    }

    async function handleLogSuccess(updatedBook) {
        setBook(updatedBook)
        await loadBookData()
        setShowLogSheet(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-body text-ink-muted">Memuat...</p>
            </div>
        )
    }

    if (!book) {
        return null
    }

    const unitConfig = getUnitConfig(book.progress.unit)

    return (
        <div className="w-full min-w-0 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate('/books')}
                    className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Kembali"
                >
                    <IconArrowLeft size={24} stroke={2} className="text-ink" />
                </button>
                <h1 className="text-h2 text-ink flex-1">Detail Buku</h1>
                <button
                    onClick={() => setShowEditForm(true)}
                    className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-warm text-ink-muted transition-colors"
                    aria-label="Edit"
                    title="Edit Buku"
                >
                    <IconEdit size={20} stroke={2} />
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-danger/10 text-danger transition-colors"
                    aria-label="Hapus"
                    title="Hapus Buku"
                >
                    <IconTrash size={20} stroke={2} />
                </button>
            </div>

            {/* Book Hero */}
            <div className="card space-y-4">
                <div className="flex gap-4">
                    <BookCover book={book} size="large" />
                    <div className="flex-1 space-y-2">
                        <h2 className="text-h2 text-ink">{book.title}</h2>
                        {book.authors.length > 0 && (
                            <p className="text-body text-ink-muted">
                                {book.authors.join(', ')}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <StatusChip status={book.status} showIcon />
                            <FormatChip format={book.format} />
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <ProgressPill book={book} showBar />
                    {book.status !== 'finished' && (
                        <button
                            onClick={() => setShowProgressSheet(true)}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <IconPlus size={20} stroke={2} />
                            <span>Update Progres</span>
                        </button>
                    )}
                </div>

                {/* Actions */}
                {book.status === 'reading' && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleMarkFinished}
                            className="flex-1 btn-secondary text-success"
                        >
                            Selesai
                        </button>
                        <button
                            onClick={handleMarkDNF}
                            className="flex-1 btn-secondary text-ink-muted"
                        >
                            DNF
                        </button>
                    </div>
                )}
            </div>

            {/* Sessions Log */}
            <div className="card space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-h3 text-ink">Riwayat Sesi</h3>
                    <span className="text-small text-ink-muted">
                        {sessions.length} sesi
                    </span>
                </div>

                {sessions.length > 0 ? (
                    <div className="space-y-2">
                        {sessions.map(session => (
                            <div key={session.id} className="p-3 rounded-lg bg-paper-warm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IconClock size={16} stroke={2} className="text-ink-muted" />
                                        <span className="text-small text-ink-muted">
                                            {new Date(session.occurredAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <span className="text-body font-medium text-primary">
                                        +{session.delta} {unitConfig.shortLabel}
                                    </span>
                                </div>
                                {session.note && (
                                    <p className="text-small text-ink-muted mt-1">
                                        {session.note}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-small text-ink-muted text-center py-4">
                        Belum ada sesi tercatat
                    </p>
                )}
            </div>

            {/* Progress Log Sheet */}
            <ProgressLogSheet
                book={book}
                isOpen={showProgressSheet}
                onClose={() => setShowProgressSheet(false)}
                onUpdate={loadBookData}
            />

            {/* Edit Book Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-surface rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto scrollbar-hide animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
                        <h2 className="text-h2 text-ink mb-4">Edit Buku</h2>
                        <BookForm
                            initialData={book}
                            onSubmit={handleEdit}
                            onCancel={() => setShowEditForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={showDeleteConfirm}
                title="Hapus Buku?"
                message={`Yakin ingin menghapus "${book.title}"? Anda punya 5 detik untuk undo.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    )
}

export default BookDetail
