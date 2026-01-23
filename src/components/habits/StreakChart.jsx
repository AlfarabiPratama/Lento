/**
 * StreakChart - Mini chart visualization for habit streaks
 * 
 * Shows streak history with visual indicators:
 * - Line chart connecting streak points
 * - Bar chart for last 30 days
 * - Current streak highlight
 */

import { IconFlame, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'

/**
 * Calculate daily streak for last N days
 */
function calculateDailyStreaks(heatmap) {
    const streaks = []
    let currentStreak = 0
    
    // Process from oldest to newest
    for (let i = 0; i < heatmap.length; i++) {
        const day = heatmap[i]
        if (day.completed) {
            currentStreak++
        } else {
            if (currentStreak > 0) {
                streaks.push({ date: heatmap[i - 1].date, length: currentStreak })
            }
            currentStreak = 0
        }
    }
    
    // Add final streak if exists
    if (currentStreak > 0) {
        streaks.push({ 
            date: heatmap[heatmap.length - 1].date, 
            length: currentStreak,
            isCurrent: true 
        })
    }
    
    return streaks
}

/**
 * Get last 30 days for mini bar chart
 */
function getLast30Days(heatmap) {
    // Return last 30 days
    return heatmap.slice(-30)
}

/**
 * Streak Mini Chart - Bar chart for last 30 days
 */
export function StreakMiniChart({ heatmap, currentStreak }) {
    const last30Days = getLast30Days(heatmap)
    const maxStreakInView = Math.max(...last30Days.map((_, i) => {
        let streak = 0
        for (let j = i; j >= 0 && last30Days[j].completed; j--) {
            streak++
        }
        return streak
    }))

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IconFlame size={18} className="text-warning" />
                    <h3 className="text-h3 text-ink">Streak Visualization</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-h2 text-warning">{currentStreak}</span>
                    <span className="text-small text-ink-muted">hari</span>
                </div>
            </div>

            {/* Mini bar chart - last 30 days */}
            <div className="space-y-2">
                <p className="text-tiny text-ink-muted">30 hari terakhir</p>
                <div className="flex items-end gap-0.5 h-16">
                    {last30Days.map((day, index) => {
                        // Calculate streak at this point
                        let streakAtPoint = 0
                        if (day.completed) {
                            for (let j = index; j >= 0 && last30Days[j].completed; j--) {
                                streakAtPoint++
                            }
                        }
                        
                        const heightPercent = maxStreakInView > 0 
                            ? (streakAtPoint / maxStreakInView) * 100 
                            : 0
                        
                        const isToday = day.date === new Date().toISOString().split('T')[0]
                        
                        return (
                            <div
                                key={day.date}
                                className="flex-1 flex flex-col justify-end"
                                title={`${new Date(day.date).toLocaleDateString('id-ID', { 
                                    day: '2-digit', 
                                    month: 'short' 
                                })} - Streak: ${streakAtPoint}`}
                            >
                                <div
                                    className={`
                                        w-full rounded-t transition-all
                                        ${day.completed 
                                            ? streakAtPoint >= currentStreak - 1 && currentStreak > 0
                                                ? 'bg-warning' // Current streak
                                                : 'bg-primary/60' // Past streak
                                            : 'bg-line' // No completion
                                        }
                                        ${isToday ? 'ring-1 ring-warning ring-offset-1' : ''}
                                        hover:opacity-80 cursor-pointer
                                    `}
                                    style={{ 
                                        height: day.completed ? `${Math.max(heightPercent, 10)}%` : '8px',
                                        minHeight: '2px'
                                    }}
                                />
                            </div>
                        )
                    })}
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-between text-tiny text-ink-muted">
                    <span>{new Date(last30Days[0]?.date).toLocaleDateString('id-ID', { 
                        day: '2-digit', 
                        month: 'short' 
                    })}</span>
                    <span>Hari ini</span>
                </div>
            </div>

            {/* Streak Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-line">
                <div className="text-center">
                    <p className="text-h3 text-ink">{currentStreak}</p>
                    <p className="text-tiny text-ink-muted">Saat Ini</p>
                </div>
                <div className="text-center">
                    <p className="text-h3 text-success">{maxStreakInView}</p>
                    <p className="text-tiny text-ink-muted">Terbaik (30d)</p>
                </div>
                <div className="text-center">
                    <p className="text-h3 text-info">
                        {last30Days.filter(d => d.completed).length}
                    </p>
                    <p className="text-tiny text-ink-muted">Hari Aktif</p>
                </div>
            </div>
        </div>
    )
}

/**
 * Streak History - Shows past streak records
 */
export function StreakHistory({ streakHistory, longestStreak }) {
    if (!streakHistory || streakHistory.length === 0) {
        return (
            <div className="text-center py-6">
                <p className="text-small text-ink-muted">Belum ada riwayat streak</p>
            </div>
        )
    }

    // Sort by length descending
    const sortedStreaks = [...streakHistory].sort((a, b) => b.length - a.length)
    
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <IconTrendingUp size={18} className="text-success" />
                <h3 className="text-h3 text-ink">Riwayat Streak</h3>
            </div>

            <div className="space-y-2">
                {sortedStreaks.map((streak, index) => {
                    const isLongest = streak.length === longestStreak
                    const widthPercent = (streak.length / longestStreak) * 100
                    
                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-small">
                                <span className="text-ink-muted">
                                    {new Date(streak.endDate).toLocaleDateString('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    {isLongest && <span className="text-tiny">🏆</span>}
                                    <span className="text-ink font-medium">{streak.length} hari</span>
                                </div>
                            </div>
                            <div className="h-2 bg-paper-warm rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${
                                        isLongest 
                                            ? 'bg-gradient-to-r from-warning/60 to-warning'
                                            : 'bg-gradient-to-r from-primary/40 to-primary/60'
                                    }`}
                                    style={{ width: `${widthPercent}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * Streak Trend Indicator
 */
export function StreakTrend({ weeklyData }) {
    if (!weeklyData || weeklyData.length < 2) return null

    // Compare last 2 weeks
    const lastWeek = weeklyData[weeklyData.length - 1]
    const prevWeek = weeklyData[weeklyData.length - 2]
    
    const trend = lastWeek.rate - prevWeek.rate
    const isImproving = trend > 0
    const isStable = trend === 0

    return (
        <div className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${isImproving ? 'bg-success/10' : isStable ? 'bg-info/10' : 'bg-warning/10'}
        `}>
            {isImproving ? (
                <IconTrendingUp size={16} className="text-success" />
            ) : (
                <IconTrendingDown size={16} className="text-warning" />
            )}
            <span className={`text-small ${
                isImproving ? 'text-success' : isStable ? 'text-info' : 'text-warning'
            }`}>
                {isStable ? 'Stabil' : `${Math.abs(trend)}% ${isImproving ? 'meningkat' : 'menurun'}`} minggu ini
            </span>
        </div>
    )
}

export default StreakMiniChart
