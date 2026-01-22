/**
 * CreateNotebookModal - Modal for creating/editing notebooks
 */

import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { NOTEBOOK_COLORS, NOTEBOOK_EMOJIS } from '../../features/space/notebooks/notebookRepo'

export function CreateNotebookModal({
    notebook = null, // null = create, object = edit
    onSubmit,
    onClose,
}) {
    const isEdit = Boolean(notebook)

    const [name, setName] = useState(notebook?.name || '')
    const [emoji, setEmoji] = useState(notebook?.emoji || '📝')
    const [color, setColor] = useState(notebook?.color || 'sage')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return

        setLoading(true)
        try {
            await onSubmit({
                name: name.trim(),
                emoji,
                color,
            })
            onClose()
        } catch (err) {
            console.error('Failed to save notebook:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-h2 text-ink">
                        {isEdit ? 'Edit Ruang' : 'Ruang Baru'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-paper-warm text-ink-muted"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Emoji picker */}
                    <div>
                        <label className="block text-small font-medium text-ink mb-2">
                            Ikon
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {NOTEBOOK_EMOJIS.map(e => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setEmoji(e)}
                                    className={`
                    w-10 h-10 rounded-lg text-xl flex items-center justify-center
                    transition-all
                    ${emoji === e
                                            ? 'bg-primary/10 ring-2 ring-primary'
                                            : 'bg-paper-warm hover:bg-paper-cream'
                                        }
                  `}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-small font-medium text-ink mb-1">
                            Nama Ruang
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Kuliah, Kerja, Personal..."
                            className="w-full px-3 py-2 border border-line rounded-lg text-body
                focus:border-primary focus:outline-none"
                            autoFocus
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-small font-medium text-ink mb-2">
                            Warna
                        </label>
                        <div className="flex gap-2">
                            {Object.keys(NOTEBOOK_COLORS).map(c => {
                                const style = NOTEBOOK_COLORS[c]
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        className={`
                      w-8 h-8 rounded-full ${style.light} ${style.border} border-2
                      transition-all
                      ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}
                    `}
                                    />
                                )
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={!name.trim() || loading}
                            className="flex-1 btn-primary"
                        >
                            {loading ? 'Menyimpan...' : (isEdit ? 'Simpan' : 'Buat Ruang')}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn-secondary"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateNotebookModal
