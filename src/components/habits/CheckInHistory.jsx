import { IconCalendar, IconNotes } from '@tabler/icons-react'

/**
 * CheckInHistory - Display check-in history with notes
 * 
 * @param {Object} props
 * @param {Array} props.checkins - Array of check-in records with { date, note, completed }
 */
export function CheckInHistory({ checkins }) {
    if (!checkins || checkins.length === 0) {
        return (
            <div className="text-center py-8 text-ink-muted">
                <p className="text-small">Belum ada check-in</p>
            </div>
        )
    }

    // Sort by date descending (newest first)
    const sortedCheckins = [...checkins]
        .filter(c => c.completed)
        .sort((a, b) => new Date(b.date) - new Date(a.date))

    // Format date to readable format
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Hari ini'
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return 'Kemarin'
        }

        return date.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <IconCalendar size={20} className="text-primary" />
                <h3 className="text-h3 text-ink">Riwayat Check-in</h3>
                <span className="text-tiny text-ink-muted">({sortedCheckins.length} hari)</span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {sortedCheckins.map((checkin, index) => (
                    <div 
                        key={checkin.id || `${checkin.date}-${index}`}
                        className="p-3 rounded-lg bg-paper-warm border border-line"
                    >
                        {/* Date */}
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="text-small font-medium text-ink">
                                {formatDate(checkin.date)}
                            </span>
                        </div>

                        {/* Note (if exists) */}
                        {checkin.note && checkin.note.trim() !== '' && (
                            <div className="mt-2 pl-4">
                                <div className="flex items-start gap-2">
                                    <IconNotes size={16} className="text-ink-muted flex-shrink-0 mt-0.5" />
                                    <p className="text-small text-ink-soft whitespace-pre-wrap break-words">
                                        {checkin.note}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
