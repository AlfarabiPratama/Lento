/**
 * DayDetail - Activity breakdown for a selected day
 * 
 * Shows all activities for a specific date: habits, focus, journals, books.
 * Appears when user clicks on a calendar date.
 */

import { IconCheck, IconClock, IconBook, IconPencil, IconX } from '@tabler/icons-react'
import { CalendarEventStatus } from '../ui/StatusIndicator'

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

function formatDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number)
    return `${day} ${MONTHS[month - 1]} ${year}`
}

function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function DayDetail({ dateKey, activities, importantDate, onClose }) {
    if (!dateKey || !activities) {
        return null
    }

    const hasAnyActivity =
        activities.habits?.length > 0 ||
        activities.focus?.length > 0 ||
        activities.journals?.length > 0 ||
        activities.books?.length > 0

    const totalFocusMinutes = activities.focus?.reduce((sum, s) => sum + (s.duration || 0), 0) || 0

    return (
        <div className="card animate-in slide-in-from-bottom-2 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-h2 text-ink">📅 {formatDate(dateKey)}</h3>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-paper-warm text-ink-muted"
                    >
                        <IconX size={18} />
                    </button>
                )}
            </div>

            {/* Important Date Banner */}
            {importantDate && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4 flex items-center gap-3">
                    <CalendarEventStatus 
                        type={importantDate.type === 'deadline' ? 'deadline' : 'reminder'} 
                        size="md" 
                    />
                    <div>
                        <p className="text-body font-medium text-ink">{importantDate.label}</p>
                        <p className="text-tiny text-ink-muted capitalize">{importantDate.type}</p>
                    </div>
                </div>
            )}

            {!hasAnyActivity ? (
                <p className="text-body text-ink-muted text-center py-6">
                    Belum ada aktivitas di hari ini.
                </p>
            ) : (
                <div className="space-y-4">
                    {/* Habits Section */}
                    {activities.habits?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarEventStatus type="habit" size="sm" />
                                <span className="text-overline">Kebiasaan</span>
                            </div>
                            <div className="space-y-1.5 pl-4">
                                {activities.habits.map((habit, i) => (
                                    <div key={i} className="flex items-center gap-2 text-small text-ink">
                                        <IconCheck size={14} className="text-primary" />
                                        <span>{habit.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Focus Section */}
                    {activities.focus?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-info" />
                                <span className="text-overline">Fokus</span>
                            </div>
                            <div className="pl-4">
                                <div className="flex items-center gap-2 text-small text-ink">
                                    <IconClock size={14} className="text-info" />
                                    <span>
                                        {activities.focus.length} sesi • Total {formatDuration(totalFocusMinutes)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Journals Section */}
                    {activities.journals?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-warning" />
                                <span className="text-overline">Jurnal</span>
                            </div>
                            <div className="space-y-1.5 pl-4">
                                {activities.journals.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-2 text-small text-ink">
                                        <IconPencil size={14} className="text-warning" />
                                        <span>{entry.title || 'Journal entry'}</span>
                                        {entry.mood && <span>{entry.mood}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Books Section */}
                    {activities.books?.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="text-overline">Buku</span>
                            </div>
                            <div className="space-y-1.5 pl-4">
                                {activities.books.map((book, i) => (
                                    <div key={i} className="flex items-center gap-2 text-small text-ink">
                                        <IconBook size={14} className="text-purple-500" />
                                        <span>{book.title}</span>
                                        {book.pages > 0 && (
                                            <span className="text-ink-muted">• {book.pages} halaman</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DayDetail
