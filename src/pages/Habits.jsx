import { useState } from 'react'
import { IconPlus, IconX, IconFlame, IconCheck, IconChevronDown } from '@tabler/icons-react'
import { useHabits, useTodayCheckins } from '../hooks/useHabits'
import { useToast } from '../contexts/ToastContext'
import EmptyState from '../components/EmptyState'
import { WeekdaySelector } from '../components/ui/WeekdaySelector'
import { getNotificationPermission, requestNotificationPermission } from '../features/reminders/notificationService'
import { PullToRefresh } from '../components/ui/PullToRefresh'
import { haptics } from '../utils/haptics'
import { HabitStatus } from '../components/ui/StatusIndicator'

/**
 * Habits - dengan icon sizing sesuai guideline
 * - Icon tombol: 20px
 * - Icon inline/chip: 16px
 */
function Habits() {
    const { habits, loading, create, remove } = useHabits()
    const { isChecked, checkIn, uncheck } = useTodayCheckins()
    const { showToast } = useToast()
    const [showForm, setShowForm] = useState(false)
    const [newHabit, setNewHabit] = useState({
        name: '',
        description: '',
        reminder_enabled: false,
        reminder_time: null,
        reminder_days: null  // null = ikut target_days
    })

    const handleCreate = async (e) => {
        e.preventDefault()
        if (!newHabit.name.trim()) return

        try {
            await create(newHabit)
            setNewHabit({
                name: '',
                description: '',
                reminder_enabled: false,
                reminder_time: null,
                reminder_days: null
            })
            setShowForm(false)
            showToast('success', `Kebiasaan "${newHabit.name}" berhasil ditambahkan`)
        } catch (err) {
            showToast('error', 'Gagal menambahkan kebiasaan')
        }
    }

    const handleToggle = async (habitId) => {
        const habit = habits.find(h => h.id === habitId)
        try {
            if (isChecked(habitId)) {
                await uncheck(habitId)
                showToast('info', `Check-in "${habit?.name}" dibatalkan`)
            } else {
                await checkIn(habitId)
                haptics.success() // ✨ Native-like feedback
                showToast('success', `✓ ${habit?.name} • Hari ini selesai!`)
            }
        } catch (err) {
            haptics.error()
            showToast('error', 'Gagal mengupdate check-in')
        }
    }

    // Pull-to-refresh handler - just show visual feedback
    const handleRefresh = async () => {
        // Data already reactive via hooks, just wait a bit for smooth UX
        await new Promise(resolve => setTimeout(resolve, 500))
        haptics.light()
    }

    const handleDelete = async (habitId) => {
        const habit = habits.find(h => h.id === habitId)
        const confirmed = window.confirm(`Hapus kebiasaan "${habit?.name}"?`)
        if (!confirmed) return

        try {
            await remove(habitId)
            showToast('success', `Kebiasaan "${habit?.name}" dihapus`)
        } catch (err) {
            showToast('error', 'Gagal menghapus kebiasaan')
        }
    }

    const habitTemplates = [
        { name: 'Minum air 8 gelas', description: 'Hidrasi sepanjang hari' },
        { name: 'Olahraga 15 menit', description: 'Gerak badan ringan' },
        { name: 'Baca 10 halaman', description: 'Baca buku setiap hari' },
        { name: 'Meditasi 5 menit', description: 'Tenangkan pikiran' },
    ]

    const handleUseTemplate = (template) => {
        setNewHabit(template)
        setShowForm(true)
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in">
                {/* Header skeleton */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="h-7 w-28 bg-paper-warm rounded animate-pulse mb-2" />
                        <div className="h-4 w-40 bg-paper-warm rounded animate-pulse" />
                    </div>
                </div>
                {/* Habits list skeleton */}
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface">
                            <div className="w-10 h-10 rounded-lg bg-paper-warm animate-pulse" />
                            <div className="flex-1 space-y-1">
                                <div className="h-5 w-2/3 bg-paper-warm rounded animate-pulse" />
                                <div className="h-3 w-1/3 bg-paper-warm rounded animate-pulse" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-paper-warm animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="space-y-6 animate-in">{/* Header */}
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-h1 text-ink">Kebiasaan</h1>
                    <p className="text-body text-ink-muted mt-1">Jaga ritme harianmu.</p>
                </div>
                {habits.length > 0 && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary btn-sm"
                        aria-label="Tambah kebiasaan"
                    >
                        {/* Icon tombol: 20px */}
                        <IconPlus size={20} stroke={2} />
                        <span>Tambah</span>
                    </button>
                )}
            </header>

            {/* Add form */}
            {showForm && (
                <form onSubmit={handleCreate} className="card space-y-4 animate-in">
                    <h3 className="text-h2 text-ink">Kebiasaan baru</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Nama kebiasaan (misal: Minum air 8 gelas)"
                            value={newHabit.name}
                            onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                            className="input"
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Deskripsi (opsional)"
                            value={newHabit.description}
                            onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                            className="input"
                        />

                        {/* Reminder Settings */}
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-line">
                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                    type="checkbox"
                                    checked={newHabit.reminder_enabled || false}
                                    onChange={async (e) => {
                                        const checked = e.target.checked

                                        // Request permission if enabling reminder for first time
                                        if (checked && getNotificationPermission() === 'default') {
                                            await requestNotificationPermission()
                                        }

                                        setNewHabit(prev => ({
                                            ...prev,
                                            reminder_enabled: checked,
                                            reminder_time: checked ? (prev.reminder_time || '08:00') : null
                                        }))
                                    }}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-body text-ink">Ingatkan saya</span>
                            </label>

                            {newHabit.reminder_enabled && (
                                <input
                                    type="time"
                                    value={newHabit.reminder_time || '08:00'}
                                    onChange={(e) => setNewHabit(prev => ({ ...prev, reminder_time: e.target.value }))}
                                    className="px-3 py-1.5 rounded-lg border border-line bg-paper text-body text-ink"
                                />
                            )}
                        </div>

                        {/* Advanced: Hari reminder khusus */}
                        {newHabit.reminder_enabled && (
                            <details className="group">
                                <summary className="flex items-center gap-2 cursor-pointer text-small text-ink-muted hover:text-ink">
                                    <IconChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                                    <span>Atur hari reminder (opsional)</span>
                                </summary>
                                <div className="mt-3 pl-6">
                                    <WeekdaySelector
                                        value={newHabit.reminder_days || []}
                                        onChange={(days) => setNewHabit(prev => ({
                                            ...prev,
                                            reminder_days: days.length > 0 ? days : null
                                        }))}
                                        helperText="Kosong = reminder mengikuti hari aktif habit"
                                    />
                                </div>
                            </details>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary">Simpan</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
                    </div>
                </form>
            )}

            {/* Habits list */}
            {habits.length > 0 ? (
                <div className="space-y-2">
                    {habits.map((habit) => (
                        <div
                            key={habit.id}
                            className="card flex items-center gap-4 group py-3"
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => handleToggle(habit.id)}
                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${isChecked(habit.id)
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-line hover:border-primary'
                                    }`}
                                aria-label={isChecked(habit.id) ? 'Batalkan check-in' : 'Check-in'}
                            >
                                {isChecked(habit.id) && (
                                    /* Icon inline di checkbox: 16px */
                                    <IconCheck size={16} stroke={2.5} />
                                )}
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`text-h3 ${isChecked(habit.id) ? 'text-ink-muted line-through' : 'text-ink'}`}>
                                    {habit.name}
                                </h3>
                                {habit.description && (
                                    <p className="text-small text-ink-muted mt-0.5 truncate">{habit.description}</p>
                                )}
                            </div>

                            {/* Habit status with streak - color-blind accessible */}
                            <HabitStatus 
                                completed={isChecked(habit.id)}
                                streak={habit.streak_current}
                                size="md"
                            />

                            {/* Delete button - icon 20px */}
                            <button
                                onClick={() => handleDelete(habit.id)}
                                className="opacity-0 group-hover:opacity-100 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-ink-muted hover:text-danger hover:bg-danger/10 transition-all"
                                aria-label="Hapus kebiasaan"
                            >
                                <IconX size={20} stroke={1.5} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : !showForm && (
                <>
                    <EmptyState
                        icon="✨"
                        title="Belum ada kebiasaan"
                        description="Kebiasaan baik dibangun dari langkah kecil. Mulai dengan 1 kebiasaan yang ingin kamu jaga setiap hari."
                        primaryAction={() => setShowForm(true)}
                        primaryLabel="Buat kebiasaan pertama"
                    />

                    <div className="card">
                        <h3 className="text-h2 text-ink mb-3">Contoh kebiasaan populer</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {habitTemplates.map((template, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleUseTemplate(template)}
                                    className="text-left p-3 rounded-lg border border-line hover:border-primary hover:bg-primary-50/30 transition-all group"
                                >
                                    <p className="text-h3 text-ink group-hover:text-primary">{template.name}</p>
                                    <p className="text-small text-ink-muted">{template.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Weekly rhythm */}
            {habits.length > 0 && (
                <section className="card">
                    <h2 className="text-h2 text-ink mb-4">Ritme minggu ini</h2>
                    <div className="grid grid-cols-7 gap-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => {
                            const isToday = i === new Date().getDay()
                            const isPast = i < new Date().getDay()
                            return (
                                <div key={day} className="text-center">
                                    <p className={`text-caption mb-2 ${isToday ? 'text-primary font-medium' : 'text-ink-muted'}`}>
                                        {day}
                                    </p>
                                    <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${isToday
                                        ? 'bg-primary text-white'
                                        : isPast
                                            ? 'bg-primary-50 text-primary'
                                            : 'bg-paper-warm text-ink-soft'
                                        }`}>
                                        {isPast && <IconCheck size={16} stroke={2} />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}
        </div>
        </PullToRefresh>
    )
}

export default Habits
