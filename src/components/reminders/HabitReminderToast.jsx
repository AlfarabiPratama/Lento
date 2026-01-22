/**
 * HabitReminderToast - Toast popup for habit reminders
 * 
 * Shows when a scheduled reminder triggers.
 * Actions: "Selesai" (check-in) or "Nanti" (dismiss)
 */

import { IconCheck, IconClock, IconX } from '@tabler/icons-react'

const COLOR_MAP = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    pink: 'bg-pink-500',
}

export function HabitReminderToast({ habit, onComplete, onDismiss }) {
    if (!habit) return null

    const colorClass = COLOR_MAP[habit.color] || 'bg-primary'

    return (
        <div className="fixed bottom-24 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 z-50 animate-in slide-in-from-bottom-4 fade-in">
            <div className="bg-paper rounded-2xl shadow-xl border border-line p-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                    {/* Habit color indicator */}
                    <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center text-white flex-shrink-0`}>
                        <IconClock size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-tiny text-ink-muted mb-0.5">⏰ Pengingat</p>
                        <h4 className="text-body font-medium text-ink truncate">
                            {habit.name}
                        </h4>
                        {habit.description && (
                            <p className="text-small text-ink-muted mt-0.5 line-clamp-1">
                                {habit.description}
                            </p>
                        )}
                    </div>

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="p-1.5 rounded-lg hover:bg-paper-warm text-ink-muted flex-shrink-0"
                        aria-label="Tutup"
                    >
                        <IconX size={18} />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-line text-ink-muted hover:bg-paper-warm transition-colors text-small font-medium"
                    >
                        Nanti
                    </button>
                    <button
                        type="button"
                        onClick={() => onComplete?.(habit)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors text-small font-medium flex items-center justify-center gap-2"
                    >
                        <IconCheck size={18} />
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    )
}

export default HabitReminderToast
