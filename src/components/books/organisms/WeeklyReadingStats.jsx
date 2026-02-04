import { useState, useEffect } from 'react'
import { IconTrendingUp, IconBook, IconClock, IconFlame } from '@tabler/icons-react'
import { getDailyStats, getWeeklyStats, getReadingStreak } from '../../../lib/bookSessionsRepo.js'

/**
 * WeeklyReadingStats - Bar chart showing reading activity over last 7 days
 */
export function WeeklyReadingStats({ onRefresh }) {
    const [dailyStats, setDailyStats] = useState([])
    const [weeklyTotal, setWeeklyTotal] = useState({ pages: 0, minutes: 0, sessionCount: 0 })
    const [streak, setStreak] = useState(0)
    const [loading, setLoading] = useState(true)
    const [unit, setUnit] = useState('pages') // 'pages' or 'minutes'

    useEffect(() => {
        loadStats()
    }, [onRefresh])

    async function loadStats() {
        try {
            const [daily, weekly, currentStreak] = await Promise.all([
                getDailyStats(7),
                getWeeklyStats(),
                getReadingStreak()
            ])
            setDailyStats(daily)
            setWeeklyTotal(weekly)
            setStreak(currentStreak)
        } catch (error) {
            console.error('Failed to load reading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="card p-3 sm:p-4">
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-paper-warm rounded w-40" />
                    <div className="h-24 bg-paper-warm rounded" />
                </div>
            </div>
        )
    }

    // Calculate max value for chart scaling
    const values = dailyStats.map(d => unit === 'pages' ? d.pages : d.minutes)
    const maxValue = Math.max(...values, 1) // Avoid division by zero

    // Check if there's any data
    const hasData = values.some(v => v > 0)

    return (
        <div className="card p-3 sm:p-4 space-y-3 sm:space-y-4 w-full min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0 w-full">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <IconTrendingUp size={20} stroke={2} className="text-primary shrink-0" />
                    <h3 className="text-h3 text-ink truncate">Statistik Minggu Ini</h3>
                </div>

                {/* Unit Toggle */}
                <div className="flex bg-paper-warm rounded-lg p-0.5 shrink-0">
                    <button
                        onClick={() => setUnit('pages')}
                        className={`px-1.5 sm:px-2 py-1 rounded-md text-tiny font-medium transition-colors ${unit === 'pages'
                                ? 'bg-surface text-primary shadow-sm'
                                : 'text-ink-muted hover:text-ink'
                            }`}
                    >
                        <span className="hidden xs:inline">Halaman</span>
                        <span className="xs:hidden">Hal</span>
                    </button>
                    <button
                        onClick={() => setUnit('minutes')}
                        className={`px-1.5 sm:px-2 py-1 rounded-md text-tiny font-medium transition-colors ${unit === 'minutes'
                                ? 'bg-surface text-primary shadow-sm'
                                : 'text-ink-muted hover:text-ink'
                            }`}
                    >
                        <span className="hidden xs:inline">Menit</span>
                        <span className="xs:hidden">Min</span>
                    </button>
                </div>
            </div>

            {/* Bar Chart */}
            {hasData ? (
                <div className="flex items-end justify-between gap-0.5 sm:gap-1 h-24 w-full min-w-0">
                    {dailyStats.map((day, index) => {
                        const value = unit === 'pages' ? day.pages : day.minutes
                        const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0
                        const isToday = index === dailyStats.length - 1

                        return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                {/* Bar */}
                                <div
                                    className="w-full relative group"
                                    style={{ height: '80px' }}
                                >
                                    <div
                                        className={`absolute bottom-0 w-full rounded-t-sm transition-all ${isToday ? 'bg-primary' : 'bg-primary/40'
                                            } ${value > 0 ? 'min-h-[4px]' : ''}`}
                                        style={{ height: `${heightPercent}%` }}
                                    />

                                    {/* Tooltip on hover */}
                                    {value > 0 && (
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 
                                            opacity-0 group-hover:opacity-100 transition-opacity
                                            bg-ink text-surface text-tiny px-2 py-1 rounded whitespace-nowrap z-10">
                                            {value} {unit === 'pages' ? 'hal' : 'min'}
                                        </div>
                                    )}
                                </div>

                                {/* Day label */}
                                <span className={`text-tiny ${isToday ? 'text-primary font-medium' : 'text-ink-muted'}`}>
                                    {day.dayLabel}
                                </span>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="h-24 flex items-center justify-center text-center w-full min-w-0 px-2">
                    <div className="max-w-full min-w-0">
                        <p className="text-small text-ink-muted">Belum ada aktivitas minggu ini</p>
                        <p className="text-tiny text-ink-light mt-1">Log progres untuk lihat statistik</p>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-1 sm:gap-2 pt-2 border-t border-line w-full min-w-0">
                <div className="text-center min-w-0">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-ink-muted mb-1">
                        <IconBook size={12} stroke={2} className="shrink-0" />
                        <span className="text-tiny truncate">Hal</span>
                    </div>
                    <p className="text-h3 text-ink truncate">{weeklyTotal.pages}</p>
                </div>
                <div className="text-center min-w-0">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-ink-muted mb-1">
                        <IconClock size={12} stroke={2} className="shrink-0" />
                        <span className="text-tiny truncate">Menit</span>
                    </div>
                    <p className="text-h3 text-ink truncate">{weeklyTotal.minutes}</p>
                </div>
                <div className="text-center min-w-0">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-ink-muted mb-1">
                        <IconFlame size={12} stroke={2} className="shrink-0" />
                        <span className="text-tiny truncate">Streak</span>
                    </div>
                    <p className="text-h3 text-ink"><span className="truncate inline-block max-w-full">{streak}</span> <span className="text-tiny text-ink-muted">hari</span></p>
                </div>
            </div>
        </div>
    )
}

export default WeeklyReadingStats
