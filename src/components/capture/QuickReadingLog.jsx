import { useState, useEffect } from 'react'
import { IconX, IconBook, IconCheck, IconChevronDown } from '@tabler/icons-react'
import { getCurrentReadingBooks, getBookById, updateBook } from '../../lib/booksRepo.js'
import { createSession, getSessionsByBook } from '../../lib/bookSessionsRepo.js'
import { useToast } from '../../contexts/ToastContext'

/**
 * QuickReadingLog - Minimal friction reading log sheet
 * 
 * Features:
 * - Auto-select last active book
 * - Single input for progress (pages/minutes)
 * - Optional note
 * - Quick save
 */
export function QuickReadingLog({ open, onClose }) {
    const { showToast } = useToast()
    const [books, setBooks] = useState([])
    const [selectedBook, setSelectedBook] = useState(null)
    const [showBookPicker, setShowBookPicker] = useState(false)
    const [delta, setDelta] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            loadBooks()
        }
    }, [open])

    async function loadBooks() {
        try {
            setLoading(true)
            const readingBooks = await getCurrentReadingBooks()

            // Sort by most recently updated
            readingBooks.sort((a, b) =>
                new Date(b.updatedAt) - new Date(a.updatedAt)
            )

            setBooks(readingBooks)

            // Auto-select first (most recent) book
            if (readingBooks.length > 0) {
                setSelectedBook(readingBooks[0])
            }
        } catch (error) {
            console.error('Failed to load books:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleSelectBook(book) {
        setSelectedBook(book)
        setShowBookPicker(false)
    }

    async function handleSave() {
        if (!selectedBook || !delta || parseInt(delta) <= 0) {
            showToast('error', 'Masukkan jumlah yang valid')
            return
        }

        try {
            setSaving(true)
            const deltaNum = parseInt(delta)
            const unit = selectedBook.progress?.unit || 'pages'

            // Create reading session
            const session = await createSession({
                bookId: selectedBook.id,
                delta: deltaNum,
                unit: unit,
                note: note.trim() || null,
                source: 'quick_capture'
            })

            // Update book progress
            const currentProgress = selectedBook.progress?.current || 0
            const newProgress = currentProgress + deltaNum

            await updateBook(selectedBook.id, {
                progress: {
                    ...selectedBook.progress,
                    current: Math.min(newProgress, selectedBook.progress?.total || Infinity)
                }
            })

            showToast('success', `+${deltaNum} ${unit === 'pages' ? 'halaman' : 'menit'} tercatat!`, {
                action: {
                    label: 'Lihat Buku',
                    onClick: () => window.location.href = `/books/${selectedBook.id}`
                }
            })

            // Reset form and close
            setDelta('')
            setNote('')
            onClose()
        } catch (error) {
            console.error('Failed to save reading log:', error)
            showToast('error', 'Gagal menyimpan progress')
        } finally {
            setSaving(false)
        }
    }

    if (!open) return null

    const unit = selectedBook?.progress?.unit || 'pages'
    const unitLabel = unit === 'pages' ? 'halaman' : 'menit'
    const currentProgress = selectedBook?.progress?.current || 0
    const totalProgress = selectedBook?.progress?.total || 0

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-surface rounded-t-2xl shadow-lg 
                            animate-in slide-in-from-bottom duration-300 pb-safe">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-line rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-line">
                    <h2 className="text-h2 text-ink flex items-center gap-2">
                        <IconBook size={20} stroke={2} className="text-primary" />
                        Log Bacaan
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-paper-warm transition-colors"
                        aria-label="Tutup"
                    >
                        <IconX size={20} stroke={2} className="text-ink-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-12 bg-paper-warm rounded-lg" />
                            <div className="h-12 bg-paper-warm rounded-lg" />
                        </div>
                    ) : books.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-body text-ink-muted mb-2">
                                Belum ada buku yang sedang dibaca
                            </p>
                            <button
                                onClick={() => {
                                    onClose()
                                    window.location.href = '/books'
                                }}
                                className="text-primary text-small hover:underline"
                            >
                                Buka Library →
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Book Selector */}
                            <div>
                                <label className="text-small text-ink-muted mb-1 block">Buku</label>
                                <button
                                    onClick={() => setShowBookPicker(!showBookPicker)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-line
                                               bg-paper-warm hover:border-primary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="min-w-11 min-h-11 bg-primary/10 rounded flex items-center justify-center shrink-0">
                                            <IconBook size={16} className="text-primary" />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-body text-ink truncate">{selectedBook?.title}</p>
                                            <p className="text-tiny text-ink-muted">
                                                {currentProgress} / {totalProgress} {unitLabel}
                                            </p>
                                        </div>
                                    </div>
                                    <IconChevronDown
                                        size={18}
                                        className={`text-ink-muted transition-transform ${showBookPicker ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Book Picker Dropdown */}
                                {showBookPicker && (
                                    <div className="mt-2 p-2 bg-surface border border-line rounded-lg shadow-md max-h-48 overflow-y-auto">
                                        {books.map(book => (
                                            <button
                                                key={book.id}
                                                onClick={() => handleSelectBook(book)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors
                                                    ${selectedBook?.id === book.id
                                                        ? 'bg-primary/10'
                                                        : 'hover:bg-paper-warm'
                                                    }`}
                                            >
                                                <div className="min-w-11 min-h-11 bg-primary/10 rounded flex items-center justify-center shrink-0">
                                                    <IconBook size={12} className="text-primary" />
                                                </div>
                                                <p className="text-small text-ink truncate">{book.title}</p>
                                                {selectedBook?.id === book.id && (
                                                    <IconCheck size={16} className="text-primary ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Progress Input */}
                            <div>
                                <label className="text-small text-ink-muted mb-1 block">
                                    Tambah {unitLabel}
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-h2 text-primary">+</span>
                                    <input
                                        type="number"
                                        value={delta}
                                        onChange={(e) => setDelta(e.target.value)}
                                        placeholder="0"
                                        min="1"
                                        className="flex-1 text-h1 text-ink bg-transparent border-b-2 border-line 
                                                   focus:border-primary outline-none text-center py-2"
                                        autoFocus
                                    />
                                    <span className="text-body text-ink-muted">{unitLabel}</span>
                                </div>
                            </div>

                            {/* Optional Note */}
                            <div>
                                <label className="text-small text-ink-muted mb-1 block">
                                    Catatan <span className="text-ink-light">(opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Sampai chapter 5..."
                                    className="input-primary"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={saving || !delta || parseInt(delta) <= 0}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <span>Menyimpan...</span>
                                ) : (
                                    <>
                                        <IconCheck size={20} stroke={2} />
                                        <span>Simpan Progress</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuickReadingLog
