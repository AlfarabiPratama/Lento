/**
 * QuickAddHabit - Lightweight habit creation from Today page
 * 
 * Focuses on essentials:
 * - Habit name (required)
 * - Target days (daily by default)
 * 
 * Advanced options (reminder, description) can be added later from Habits page
 */

import { useState } from 'react'
import { IconX, IconCheck, IconCalendar } from '@tabler/icons-react'
import { WeekdaySelector } from '../ui/WeekdaySelector'

export function QuickAddHabit({ onClose, onCreate }) {
    const [name, setName] = useState('')
    const [targetDays, setTargetDays] = useState(null) // null = daily, array = specific days
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return

        try {
            setLoading(true)
            await onCreate({
                name: name.trim(),
                description: '',
                target_days: targetDays,
                reminder_enabled: false,
                reminder_time: null,
                reminder_days: null,
            })
            // onClose dipanggil dari parent setelah sukses
        } catch (error) {
            console.error('Failed to create habit:', error)
            setLoading(false)
        }
    }

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <form
                className="bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-h2 text-ink">Kebiasaan Baru</h2>
                        <p className="text-small text-ink-muted mt-1">
                            Tambah kebiasaan dengan cepat
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-warm transition-colors"
                        aria-label="Tutup"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Habit Name */}
                <div>
                    <label htmlFor="quick-habit-name" className="text-small font-medium text-ink block mb-2">
                        Nama Kebiasaan <span className="text-danger">*</span>
                    </label>
                    <input
                        id="quick-habit-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Baca buku 30 menit"
                        className="input w-full"
                        maxLength={100}
                        autoFocus
                        required
                    />
                </div>

                {/* Target Days */}
                <div>
                    <label className="text-small font-medium text-ink block mb-2">
                        <IconCalendar size={16} className="inline-block mr-1.5" />
                        Target Hari
                    </label>
                    <WeekdaySelector
                        value={targetDays}
                        onChange={setTargetDays}
                    />
                    <p className="text-tiny text-ink-muted mt-2">
                        {targetDays === null 
                            ? 'Setiap hari' 
                            : `${targetDays.length} hari per minggu`}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary flex-1"
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                        disabled={!name.trim() || loading}
                    >
                        <IconCheck size={16} />
                        {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>

                {/* Hint */}
                <p className="text-tiny text-ink-muted text-center pt-2">
                    Pengaturan lanjutan bisa diatur di halaman Kebiasaan
                </p>
            </form>
        </div>
    )
}

export default QuickAddHabit
