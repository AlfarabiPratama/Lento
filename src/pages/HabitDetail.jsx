import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
    IconArrowLeft, 
    IconFlame, 
    IconTrendingUp, 
    IconCalendar,
    IconCheck,
    IconChartBar,
} from '@tabler/icons-react'
import { getDetailedHabitStats } from '../lib/habitStats'
import { useToast } from '../contexts/ToastContext'
import { StreakMiniChart, StreakHistory, StreakTrend } from '../components/habits/StreakChart'

/**
 * HabitDetail - Detailed statistics and insights for a habit
 * 
 * Features:
 * - Completion rate overview
 * - Current & longest streak
 * - Calendar heatmap visualization
 * - Weekly & monthly trends
 * - Day of week analysis
 */
function HabitDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState(90) // 90 days default

    useEffect(() => {
        loadStats()
    }, [id, timeRange])

    const loadStats = async () => {
        try {
            setLoading(true)
            const data = await getDetailedHabitStats(id, timeRange)
            setStats(data)
        } catch (err) {
            showToast('error', 'Gagal memuat statistik')
            navigate('/habits')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-in">
                {/* Header skeleton */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-paper-warm animate-pulse" />
                    <div className="flex-1">
                        <div className="h-7 w-48 bg-paper-warm rounded animate-pulse mb-2" />
                        <div className="h-4 w-32 bg-paper-warm rounded animate-pulse" />
                    </div>
                </div>

                {/* Stats skeleton */}
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="card">
                            <div className="h-8 w-16 bg-paper-warm rounded animate-pulse mb-2" />
                            <div className="h-4 w-24 bg-paper-warm rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!stats) return null

    const { habit, overview, trends, heatmap } = stats

    return (
        <div className="space-y-6 animate-in max-w-4xl mx-auto">
            {/* Header */}
            <header className="flex items-start gap-3">
                <button
                    onClick={() => navigate('/habits')}
                    className="min-w-11 min-h-11 flex items-center justify-center rounded-lg hover:bg-paper-warm transition-colors"
                    aria-label="Kembali"
                >
                    <IconArrowLeft size={20} />
                </button>

                <div className="flex-1">
                    <h1 className="text-h1 text-ink">{habit.name}</h1>
                    {habit.description && (
                        <p className="text-body text-ink-muted mt-1">{habit.description}</p>
                    )}
                </div>

                {/* Time range selector */}
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-line bg-paper text-body text-ink"
                >
                    <option value={30}>30 hari</option>
                    <option value={90}>90 hari</option>
                    <option value={180}>6 bulan</option>
                    <option value={365}>1 tahun</option>
                </select>
            </header>

            {/* Overview Stats */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card text-center">
                    <div className="text-h1 text-primary mb-1">{overview.completionRate}%</div>
                    <p className="text-small text-ink-muted">Completion Rate</p>
                </div>

                <div className="card text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <IconFlame size={24} className="text-warning" />
                        <span className="text-h1 text-ink">{overview.currentStreak}</span>
                    </div>
                    <p className="text-small text-ink-muted">Streak Saat Ini</p>
                </div>

                <div className="card text-center">
                    <div className="text-h1 text-success mb-1">{overview.longestStreak}</div>
                    <p className="text-small text-ink-muted">Longest Streak</p>
                </div>

                <div className="card text-center">
                    <div className="text-h1 text-info mb-1">{overview.totalCheckins}</div>
                    <p className="text-small text-ink-muted">Total Check-ins</p>
                </div>
            </section>

            {/* Streak Visualization - NEW */}
            <section className="card">
                <StreakMiniChart 
                    heatmap={heatmap} 
                    currentStreak={overview.currentStreak} 
                />
            </section>

            {/* Streak Trend Indicator - NEW */}
            <StreakTrend weeklyData={trends.weekly} />

            {/* Calendar Heatmap */}
            <section className="card">
                <div className="flex items-center gap-2 mb-4">
                    <IconCalendar size={20} className="text-primary" />
                    <h2 className="text-h2 text-ink">Activity Calendar</h2>
                </div>

                <div className="space-y-2">
                    {/* Week labels */}
                    <div className="grid grid-cols-7 gap-0.5 text-center mb-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                            <div key={day} className="text-tiny text-ink-muted">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {heatmap.map((day, index) => {
                            const date = new Date(day.date)
                            const isToday = day.date === new Date().toISOString().split('T')[0]
                            
                            return (
                                <div
                                    key={day.date}
                                    className={`
                                        aspect-square rounded-sm transition-all cursor-pointer
                                        ${day.completed 
                                            ? 'bg-primary hover:bg-primary/80' 
                                            : 'bg-paper-warm hover:bg-line'
                                        }
                                        ${isToday ? 'ring-1 ring-primary ring-offset-1' : ''}
                                    `}
                                    title={`${date.toLocaleDateString('id-ID')} - ${day.completed ? 'Selesai' : 'Belum'}`}
                                >
                                    {day.completed && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <IconCheck size={8} className="text-white" stroke={3} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 mt-4 text-tiny text-ink-muted">
                        <span>Belum</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-paper-warm" />
                            <div className="w-3 h-3 rounded-sm bg-primary/30" />
                            <div className="w-3 h-3 rounded-sm bg-primary/60" />
                            <div className="w-3 h-3 rounded-sm bg-primary" />
                        </div>
                        <span>Selesai</span>
                    </div>
                </div>
            </section>

            {/* Weekly Trends */}
            <section className="card">
                <div className="flex items-center gap-2 mb-4">
                    <IconChartBar size={20} className="text-success" />
                    <h2 className="text-h2 text-ink">Trend Mingguan</h2>
                </div>

                <div className="space-y-3">
                    {trends.weekly.map((week, index) => {
                        const maxCount = Math.max(...trends.weekly.map(w => w.count))
                        const widthPercent = maxCount > 0 ? (week.count / maxCount) * 100 : 0
                        
                        return (
                            <div key={week.week} className="space-y-1">
                                <div className="flex items-center justify-between text-small">
                                    <span className="text-ink-muted">{week.week}</span>
                                    <span className="text-ink font-medium">{week.count}/7 • {week.rate}%</span>
                                </div>
                                <div className="h-2 bg-paper-warm rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all"
                                        style={{ width: `${widthPercent}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Streak History - NEW */}
            {stats.streakHistory && stats.streakHistory.length > 0 && (
                <section className="card">
                    <StreakHistory 
                        streakHistory={stats.streakHistory} 
                        longestStreak={overview.longestStreak} 
                    />
                </section>
            )}

            {/* Day of Week Analysis */}
            <section className="card">
                <div className="flex items-center gap-2 mb-4">
                    <IconTrendingUp size={20} className="text-info" />
                    <h2 className="text-h2 text-ink">Performa per Hari</h2>
                </div>

                <div className="space-y-2">
                    {trends.dayOfWeek.map(day => {
                        const maxCount = Math.max(...trends.dayOfWeek.map(d => d.count))
                        const widthPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                        const isBestDay = day.count === maxCount && maxCount > 0
                        
                        return (
                            <div key={day.day} className="flex items-center gap-3">
                                <div className="w-16 text-small text-ink-muted">{day.day}</div>
                                <div className="flex-1">
                                    <div className="h-8 bg-paper-warm rounded-lg overflow-hidden relative">
                                        <div 
                                            className={`h-full rounded-lg transition-all ${
                                                isBestDay 
                                                    ? 'bg-gradient-to-r from-warning/60 to-warning' 
                                                    : 'bg-gradient-to-r from-primary/40 to-primary/60'
                                            }`}
                                            style={{ width: `${widthPercent}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-end px-3">
                                            <span className="text-small font-medium text-ink">
                                                {day.count} kali
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                    <p className="text-small text-ink">
                        <strong>Hari terbaik:</strong> {overview.bestDay} 🎯
                    </p>
                </div>
            </section>

            {/* Monthly Trends */}
            <section className="card">
                <h2 className="text-h2 text-ink mb-4">Trend Bulanan</h2>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {trends.monthly.map(month => (
                        <div key={month.month} className="text-center">
                            <div className="text-small text-ink-muted mb-1">{month.month}</div>
                            <div className="text-h2 text-ink mb-1">{month.rate}%</div>
                            <div className="text-tiny text-ink-muted">{month.count}/{month.daysInMonth}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Insights */}
            <section className="card bg-gradient-to-br from-primary/5 to-success/5">
                <h2 className="text-h2 text-ink mb-3">💡 Insights</h2>
                <div className="space-y-2 text-small text-ink">
                    {overview.completionRate >= 80 && (
                        <p>✨ Konsistensi luar biasa! Terus pertahankan ritme ini.</p>
                    )}
                    {overview.completionRate >= 50 && overview.completionRate < 80 && (
                        <p>👍 Progres bagus! Sedikit lagi untuk mencapai 80%.</p>
                    )}
                    {overview.completionRate < 50 && (
                        <p>💪 Terus semangat! Setiap langkah kecil berarti.</p>
                    )}
                    {overview.currentStreak >= 7 && (
                        <p>🔥 Streak 1 minggu! Momentum yang sempurna.</p>
                    )}
                    {overview.currentStreak >= 30 && (
                        <p>🏆 Streak 1 bulan! Kebiasaan ini sudah melekat.</p>
                    )}
                    {overview.totalCheckins >= 100 && (
                        <p>🎯 Milestone 100 check-ins tercapai!</p>
                    )}
                </div>
            </section>
        </div>
    )
}

export default HabitDetail
