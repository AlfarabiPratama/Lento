import { useState } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'

/**
 * CheckInNoteModal - Modal untuk menambahkan catatan saat check-in habit
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSubmit - Submit handler with note
 * @param {string} props.habitName - Nama habit untuk display
 */
export function CheckInNoteModal({ isOpen, onClose, onSubmit, habitName }) {
    const [note, setNote] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        try {
            await onSubmit(note.trim())
            setNote('') // Reset
            onClose()
        } catch (err) {
            console.error('Failed to submit check-in:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleQuickCheckIn = async () => {
        setIsSubmitting(true)
        try {
            await onSubmit('') // Empty note
            setNote('')
            onClose()
        } catch (err) {
            console.error('Failed to submit check-in:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="card p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-h3 text-ink">Check-in Habit</h3>
                            <p className="text-small text-ink-muted mt-1">{habitName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="min-w-9 min-h-9 flex items-center justify-center rounded-lg text-ink-muted hover:bg-ink-muted/10"
                            aria-label="Tutup"
                        >
                            <IconX size={20} stroke={2} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Note Input */}
                        <div>
                            <label htmlFor="checkin-note" className="text-small text-ink-muted mb-2 block">
                                Catatan (opsional)
                            </label>
                            <textarea
                                id="checkin-note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Bagaimana hari ini? Tulis catatan singkat..."
                                className="input min-h-[100px] resize-none"
                                maxLength={500}
                                disabled={isSubmitting}
                            />
                            <p className="text-tiny text-ink-muted mt-1">
                                {note.length}/500 karakter
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {/* Quick check-in without note */}
                            <button
                                type="button"
                                onClick={handleQuickCheckIn}
                                disabled={isSubmitting}
                                className="btn-secondary flex-1"
                            >
                                <IconCheck size={18} stroke={2} />
                                <span>Check-in</span>
                            </button>

                            {/* Check-in with note */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !note.trim()}
                                className="btn-primary flex-1"
                            >
                                <IconCheck size={18} stroke={2} />
                                <span>Simpan & Check-in</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
