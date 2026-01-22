import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { getUnitConfig } from '../../../features/books/constants.js'
import { applyBookProgress, markFinished } from '../../../features/books/domain/bookProgress.js'

/**
 * LogSessionSheet - Sheet/Dialog for logging reading sessions
 */
export function LogSessionSheet({ book, onClose, onSuccess }) {
    const unitConfig = getUnitConfig(book.progress.unit)
    const [delta, setDelta] = useState('')
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleSubmit(e) {
        e.preventDefault()

        const deltaNum = parseInt(delta)
        if (!deltaNum || deltaNum <= 0) {
            setError('Masukkan nilai yang valid')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const result = await applyBookProgress({
                book,
                delta: deltaNum,
                unit: book.progress.unit,
                occurredAt: new Date().toISOString(),
                source: 'manual',
                note: note.trim() || null
            })

            if (result.type === 'prompt_finish') {
                // Show finish prompt with celebration cue
                const confirmed = window.confirm(
                    '🎉 Selamat! Kamu sudah mencapai halaman terakhir!\n\nTandai buku ini sebagai selesai?'
                )
                if (confirmed) {
                    // Mark as finished first
                    const finishedBook = await markFinished(book)

                    // Then log the final session
                    await applyBookProgress({
                        book: finishedBook,
                        delta: deltaNum,
                        unit: book.progress.unit,
                        occurredAt: new Date().toISOString(),
                        source: 'manual',
                        note: note.trim() || 'Selesai! 🎉'
                    })

                    onSuccess(finishedBook, null)
                    onClose()
                }
            } else if (result.type === 'success') {
                onSuccess(result.book, result.session)
                onClose()
            }
        } catch (err) {
            if (err.message === 'UNIT_MISMATCH') {
                setError(`Buku ini menggunakan ${unitConfig.label}. Pastikan unit sudah benar.`)
            } else {
                setError(err.message || 'Terjadi kesalahan')
            }
        } finally {
            setLoading(false)
        }
    }

    function handlePresetClick(preset) {
        setDelta(preset.toString())
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-h2 text-ink">Log Sesi Baca</h2>
                        <p className="text-small text-ink-muted mt-1">{book.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-warm transition-colors"
                        aria-label="Tutup"
                    >
                        <IconX size={20} stroke={2} className="text-ink-muted" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Delta Input */}
                    <div>
                        <label className="block text-small font-medium text-ink mb-2">
                            Berapa {unitConfig.singular}?
                        </label>
                        <input
                            type="number"
                            value={delta}
                            onChange={(e) => setDelta(e.target.value)}
                            placeholder={`Contoh: ${unitConfig.presets[1]}`}
                            min="1"
                            className="w-full px-4 py-3 border border-line rounded-lg text-h3 text-ink text-center focus:border-primary focus:outline-none"
                            autoFocus
                            required
                        />
                    </div>

                    {/* Presets */}
                    <div className="flex gap-2">
                        {unitConfig.presets.map(preset => (
                            <button
                                key={preset}
                                type="button"
                                onClick={() => handlePresetClick(preset)}
                                className="flex-1 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                            >
                                +{preset}
                            </button>
                        ))}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-small font-medium text-ink mb-2">
                            Catatan (opsional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Bab berapa? Apa yang menarik?"
                            rows={3}
                            className="w-full px-3 py-2 border border-line rounded-lg text-body text-ink focus:border-primary focus:outline-none resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-small text-danger">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !delta}
                            className="flex-1 btn-primary"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LogSessionSheet
