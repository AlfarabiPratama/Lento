import { useState, useEffect, useRef } from 'react'
import { IconMinus, IconPlus, IconChevronDown, IconX, IconBook2 } from '@tabler/icons-react'
import { updateBook } from '../../../lib/booksRepo'
import { createSession, deleteSession } from '../../../lib/bookSessionsRepo'
import { useToast } from '../../../contexts/ToastContext'
import { OverlayBase } from '../../ui/OverlayBase'

/**
 * ProgressLogSheet - Bottom sheet for logging book progress (absolute input)
 * 
 * UX: 2 steps: Input current page → Save → Done
 * - Absolute input (current page) is most natural: "I'm on page 137"
 * - Auto-calculates delta for session logging
 * - Auto-starts reading when TBR (frictionless!)
 * - Supports full undo
 * 
 * Uses OverlayBase for proper:
 * ✓ Focus trap
 * ✓ Scroll lock
 * ✓ ESC to close
 * ✓ Restore focus
 * ✓ ARIA accessibility
 */
export function ProgressLogSheet({ book, isOpen, onClose, onUpdate }) {
    const [pageStr, setPageStr] = useState('')
    const [note, setNote] = useState('')
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [saving, setSaving] = useState(false)

    const inputRef = useRef(null)
    const { showToast } = useToast()

    const currentPage = book?.progress?.current || 0
    const totalPages = book?.progress?.total || null
    const unit = book?.progress?.unit || 'pages'
    const unitLabel = unit === 'pages' ? 'Halaman' : 'Menit'
    const isTBR = book?.status === 'tbr'
    const isDNF = book?.status === 'dnf'

    // Initialize and auto-select on open
    useEffect(() => {
        if (isOpen && book) {
            setPageStr(String(currentPage))
            setNote('')
            setShowAdvanced(false)

            // Auto-focus and select text after a short delay
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus()
                    inputRef.current.select()
                }
            }, 100)
        }
    }, [isOpen, book, currentPage])

    // Parse input value safely (clamp 0..total)
    function parseInput(value) {
        const parsed = parseInt(value, 10)
        if (isNaN(parsed) || parsed < 0) return 0
        if (totalPages && parsed > totalPages) return totalPages
        return parsed
    }

    // Stepper handlers
    function handleIncrement(amount = 1) {
        setPageStr(prev => {
            const current = parseInput(prev)
            const next = totalPages
                ? Math.min(current + amount, totalPages)
                : current + amount
            return String(next)
        })
    }

    function handleDecrement(amount = 1) {
        setPageStr(prev => {
            const current = parseInput(prev)
            const next = Math.max(current - amount, 0)
            return String(next)
        })
    }

    // Keyboard navigation for stepper (WAI-ARIA spinbutton pattern)
    function handleInputKeyDown(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault()
            handleIncrement(1)
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            handleDecrement(1)
        } else if (e.key === 'PageUp') {
            e.preventDefault()
            handleIncrement(10)
        } else if (e.key === 'PageDown') {
            e.preventDefault()
            handleDecrement(10)
        } else if (e.key === 'Home') {
            e.preventDefault()
            setPageStr('0')
        } else if (e.key === 'End' && totalPages) {
            e.preventDefault()
            setPageStr(String(totalPages))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        }
        // Note: ESC is handled by OverlayBase
    }

    // Save progress with auto-start reading logic
    async function handleSave() {
        if (!book || saving) return

        const newCurrent = parseInput(pageStr)
        const oldCurrent = currentPage
        const oldStatus = book.status
        const oldDates = book.dates || {}
        const delta = newCurrent - oldCurrent
        const now = new Date().toISOString()

        // Determine if we need to auto-start reading
        const willAutoStart = (isTBR || isDNF) && newCurrent > 0

        setSaving(true)

        try {
            // Build update payload
            const updates = {
                progress: {
                    ...book.progress,
                    current: newCurrent
                }
            }

            // Auto-start reading if TBR/DNF and logging progress
            if (willAutoStart) {
                updates.status = 'reading'
                // Set startedAt if not already set
                if (!oldDates.startedAt) {
                    updates.dates = {
                        ...oldDates,
                        startedAt: now
                    }
                }
            }

            // Update book
            await updateBook(book.id, updates)

            // Create session if delta > 0 (reading forward)
            let sessionId = null
            if (delta > 0) {
                const session = await createSession({
                    bookId: book.id,
                    delta: delta,
                    unit: unit,
                    note: note.trim() || null,
                    source: 'manual'
                })
                sessionId = session?.id
            }

            // Build success message
            let message
            if (willAutoStart && delta > 0) {
                message = `+${delta} ${unitLabel.toLowerCase()} • Mulai membaca!`
            } else if (willAutoStart) {
                message = 'Mulai membaca!'
            } else if (delta > 0) {
                message = `+${delta} ${unitLabel.toLowerCase()} tercatat!`
            } else if (delta < 0) {
                message = `Progres dikoreksi ke ${newCurrent}`
            } else {
                message = 'Progres disimpan'
            }

            // Show toast with undo option
            showToast('success', message, {
                action: {
                    label: 'Undo',
                    onClick: async () => {
                        try {
                            // Restore old state
                            const restoreUpdates = {
                                progress: {
                                    ...book.progress,
                                    current: oldCurrent
                                }
                            }

                            // Restore old status if auto-started
                            if (willAutoStart) {
                                restoreUpdates.status = oldStatus
                                restoreUpdates.dates = oldDates
                            }

                            await updateBook(book.id, restoreUpdates)

                            // Delete session if created
                            if (sessionId) {
                                try {
                                    await deleteSession(sessionId)
                                } catch (e) {
                                    console.warn('Could not delete session:', e)
                                }
                            }

                            if (onUpdate) onUpdate()
                            showToast('info', 'Dibatalkan')
                        } catch (e) {
                            console.error('Undo failed:', e)
                            showToast('error', 'Gagal membatalkan')
                        }
                    }
                }
            })

            if (onUpdate) onUpdate()
            onClose()
        } catch (error) {
            console.error('Failed to save progress:', error)
            showToast('error', 'Gagal menyimpan progres')
        } finally {
            setSaving(false)
        }
    }

    // Calculate display percentage
    function calcPercent() {
        const current = parseInput(pageStr)
        if (!totalPages || totalPages <= 0) return null
        return Math.min(100, Math.round((current / totalPages) * 100))
    }

    const percent = calcPercent()

    if (!book) return null

    return (
        <OverlayBase
            isOpen={isOpen}
            onClose={onClose}
            labelId="progress-sheet-title"
            initialFocusRef={inputRef}
            className="bg-black/30 animate-in fade-in"
        >
            {/* Modal - centered on desktop, bottom sheet on mobile */}
            <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
                <div
                    className="w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl animate-in slide-in-from-bottom sm:zoom-in-95 sm:slide-in-from-bottom-0 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Handle - only on mobile */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-10 h-1 bg-line rounded-full" />
                    </div>


                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pb-2 sm:pt-4">
                        <h2 id="progress-sheet-title" className="text-h3 text-ink font-medium">Update Progres</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-paper-warm text-ink-muted"
                        >
                            <IconX size={20} />
                        </button>
                    </div>

                    {/* Book info */}
                    <div className="px-4 pb-3">
                        <p className="text-small text-ink truncate">{book.title}</p>
                        {totalPages && (
                            <p className="text-tiny text-ink-muted">Maks: {totalPages} {unitLabel.toLowerCase()}</p>
                        )}
                    </div>

                    {/* Auto-start info for TBR/DNF books */}
                    {(isTBR || isDNF) && (
                        <div className="mx-4 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-2">
                            <IconBook2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <p className="text-tiny text-primary">
                                {isTBR
                                    ? 'Log pertama akan menandai buku sebagai Sedang Dibaca.'
                                    : 'Melanjutkan buku akan mengubah status ke Sedang Dibaca.'
                                }
                            </p>
                        </div>
                    )}

                    {/* Main input section */}
                    <div className="px-4 pb-4">
                        <label className="block text-small font-medium text-ink mb-2">
                            {unitLabel} sekarang
                        </label>

                        {/* Stepper input */}
                        <div className="flex items-center gap-2">
                            {/* Decrement button */}
                            <button
                                type="button"
                                onClick={() => handleDecrement(1)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="w-12 h-12 rounded-xl bg-paper-warm hover:bg-line flex items-center justify-center text-ink transition-colors"
                                aria-label={`Kurangi 1 ${unitLabel.toLowerCase()}`}
                            >
                                <IconMinus size={20} />
                            </button>

                            {/* Number input */}
                            <div className="flex-1">
                                <input
                                    ref={inputRef}
                                    type="number"
                                    inputMode="numeric"
                                    enterKeyHint="done"
                                    min={0}
                                    max={totalPages ?? undefined}
                                    value={pageStr}
                                    onChange={(e) => setPageStr(e.target.value)}
                                    onKeyDown={handleInputKeyDown}
                                    onBlur={() => setPageStr(String(parseInput(pageStr)))}
                                    className="w-full h-14 px-4 text-center text-h2 font-bold text-ink bg-paper-warm border-2 border-line rounded-xl focus:border-primary focus:outline-none transition-colors"
                                    aria-label={`${unitLabel} sekarang`}
                                />
                            </div>

                            {/* Increment button */}
                            <button
                                type="button"
                                onClick={() => handleIncrement(1)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="w-12 h-12 rounded-xl bg-paper-warm hover:bg-line flex items-center justify-center text-ink transition-colors"
                                aria-label={`Tambah 1 ${unitLabel.toLowerCase()}`}
                            >
                                <IconPlus size={20} />
                            </button>
                        </div>

                        {/* Progress percentage indicator */}
                        {percent !== null && (
                            <div className="text-center mt-2">
                                <span className="text-small text-ink-muted">{percent}% selesai</span>
                            </div>
                        )}

                        {/* Quick jump buttons */}
                        <div className="flex gap-2 mt-3">
                            {[10, 25, 50].map(amount => (
                                <button
                                    key={amount}
                                    type="button"
                                    onClick={() => handleIncrement(amount)}
                                    className="flex-1 py-2 text-tiny text-ink-muted hover:text-ink bg-paper-warm hover:bg-line rounded-lg transition-colors"
                                >
                                    +{amount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced options (collapsed by default) */}
                    <div className="px-4 pb-4">
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-1 text-small text-ink-muted hover:text-ink"
                        >
                            <IconChevronDown
                                size={16}
                                className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                            />
                            Detail
                        </button>

                        {showAdvanced && (
                            <div className="mt-3 space-y-3 animate-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-tiny text-ink-muted mb-1">
                                        Catatan (opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Tambahkan catatan singkat..."
                                        className="w-full px-3 py-2 text-small border border-line rounded-lg focus:border-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Save button */}
                    <div className="px-4 pb-6 safe-area-bottom">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3.5 btn-primary text-body font-medium"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </div>
            </div>
        </OverlayBase>
    )
}

export default ProgressLogSheet



