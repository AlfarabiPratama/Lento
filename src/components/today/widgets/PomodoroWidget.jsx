import { useNavigate } from 'react-router-dom'
import { IconClock, IconPlayerPlay } from '@tabler/icons-react'
import { WidgetCard } from '../atoms/WidgetCard'

/**
 * PomodoroWidget - Responsive: compact on mobile, full on desktop
 */
export function PomodoroWidget({
    isRunning = false,
    timeLeft = 0,
    onStart,
    onStop,
    summary = { sessionCount: 0, focusMinutes: 0 },
    className = ''
}) {
    const navigate = useNavigate()

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <WidgetCard
            title="Fokus"
            icon={IconClock}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
            onAction={() => navigate('/more/fokus')}
            className={className}
        >
            <div className="space-y-1 sm:space-y-3">
                {isRunning ? (
                    <>
                        {/* Timer display */}
                        <div className="text-center py-1 sm:py-4">
                            <p className="text-xs sm:text-tiny text-ink-muted mb-0.5 sm:mb-1">
                                Fokus
                            </p>
                            <p className="text-body sm:text-h1 font-bold text-ink tabular-nums">
                                {formatTime(timeLeft)}
                            </p>
                        </div>

                        {/* Stop button */}
                        <button
                            onClick={onStop}
                            className="btn-secondary w-full py-1.5 sm:py-2 text-xs sm:text-small text-red-600 min-h-[44px] sm:min-h-0"
                        >
                            Berhenti
                        </button>
                    </>
                ) : (
                    <>
                        {/* Timer display */}
                        <div className="text-center py-1.5 sm:py-3">
                            <p className="text-small sm:text-small text-ink-muted mb-1 sm:mb-2">Mulai sesi fokus</p>
                            <p className="text-h2 sm:text-h2 font-bold text-ink">25:00</p>
                            <p className="text-tiny text-ink-muted mt-1">
                                Hari ini: {summary.sessionCount || 0} sesi · {summary.focusMinutes || 0} menit
                            </p>
                        </div>

                        {/* Start button */}
                        <button
                            onClick={onStart}
                            className="btn-primary w-full py-1.5 sm:py-2 text-small sm:text-small flex items-center justify-center gap-1 sm:gap-2"
                        >
                            <IconPlayerPlay size={14} stroke={2} className="sm:hidden" />
                            <IconPlayerPlay size={18} stroke={2} className="hidden sm:block" />
                            <span className="hidden sm:inline">Mulai Fokus</span>
                            <span className="sm:hidden">Mulai</span>
                        </button>
                    </>
                )}
            </div>
        </WidgetCard>
    )
}

export default PomodoroWidget
