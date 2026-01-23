/**
 * WeeklyReport - Weekly performance summary for Today page
 * 
 * Shows this week's activity overview with trend comparison
 * Provides motivational feedback based on performance
 */

import { useState, useEffect, useMemo } from 'react'
import { 
    IconChartBar, 
    IconTrendingUp, 
    IconTrendingDown,
    IconFlame,
    IconBulb,
    IconNotebook,
    IconBook,
    IconChevronDown,
    IconChevronUp
} from '@tabler/icons-react'

/**
 * Get week start/end dates (Monday to Sunday)
 */
function getWeekRange(offset = 0) {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday
    
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff + (offset * 7))
    monday.setHours(0, 0, 0, 0)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)
    
    return { start: monday, end: sunday }
}

/**
 * Calculate weekly stats from checkins/activities
 */
function calculateWeeklyStats(activitiesByDate, weekRange) {
    const stats = {
        habits: 0,
        focus: 0,
        journals: 0,
        books: 0,
        activeDays: 0,
        longestStreak: 0
    }
    
    if (!activitiesByDate) return stats
    
    const startKey = weekRange.start.toISOString().split('T')[0]
    const endKey = weekRange.end.toISOString().split('T')[0]
    
    let currentStreak = 0
    let tempStreak = 0
    
    // Iterate through each day in week
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekRange.start)
        date.setDate(date.getDate() + i)
        const dateKey = date.toISOString().split('T')[0]
        
        const activities = activitiesByDate[dateKey]
        
        if (activities) {
            const hasActivity = 
                (activities.habits?.length > 0) ||
                (activities.focus?.length > 0) ||
                (activities.journals?.length > 0) ||
                (activities.books?.length > 0)
            
            if (hasActivity) {
                stats.activeDays++
                tempStreak++
                stats.longestStreak = Math.max(stats.longestStreak, tempStreak)
                
                // Count if today or earlier
                if (date <= new Date()) {
                    currentStreak = tempStreak
                }
            } else {
                tempStreak = 0
            }
            
            stats.habits += activities.habits?.length || 0
            stats.focus += activities.focus?.length || 0
            stats.journals += activities.journals?.length || 0
            stats.books += activities.books?.length || 0
        } else {
            tempStreak = 0
        }
    }
    
    // Calculate target based on days elapsed in week
    const daysElapsed = Math.min(
        7,
        Math.ceil((new Date() - weekRange.start) / (1000 * 60 * 60 * 24)) + 1
    )
    
    return {
        ...stats,
        currentStreak,
        daysElapsed,
        completionRate: Math.round((stats.activeDays / daysElapsed) * 100)
    }
}

/**
 * Get motivational message based on performance
 */
function getMotivationalMessage(stats, trend) {
    const { completionRate, currentStreak, activeDays } = stats
    
    if (completionRate >= 85) {
        if (trend > 10) {
            return "Performa luar biasa! Kamu meningkat pesat minggu ini 🚀"
        }
        return "Konsistensi sempurna! Terus pertahankan ritme ini ⭐"
    }
    
    if (completionRate >= 70) {
        if (currentStreak >= 5) {
            return `Streak ${currentStreak} hari! Momentum bagus, lanjutkan 🔥`
        }
        if (trend > 0) {
            return "Progres bagus! Sedikit lagi mencapai target minggu ini 💪"
        }
        return "Hari-hari produktif! Jaga konsistensi sampai akhir minggu 👍"
    }
    
    if (completionRate >= 50) {
        if (trend < 0) {
            return "Minggu ini masih bisa lebih baik. Yuk mulai lagi hari ini! 🌱"
        }
        return "Setengah perjalanan sudah dilalui. Terus semangat! 💚"
    }
    
    if (activeDays >= 2) {
        return "Setiap langkah kecil berarti. Fokus pada hari ini aja 🌿"
    }
    
    return "Belum terlambat untuk memulai. Mulai dari satu kebiasaan kecil ☀️"
}

/**
 * WeeklyReport Component
 */
export function WeeklyReport({ activitiesByDate }) {
    const [isExpanded, setIsExpanded] = useState(false)
    
    // Calculate this week and last week stats
    const thisWeek = useMemo(() => {
        const range = getWeekRange(0)
        return {
            range,
            stats: calculateWeeklyStats(activitiesByDate, range)
        }
    }, [activitiesByDate])
    
    const lastWeek = useMemo(() => {
        const range = getWeekRange(-1)
        return {
            range,
            stats: calculateWeeklyStats(activitiesByDate, range)
        }
    }, [activitiesByDate])
    
    // Calculate trends (compare with last week)
    const trends = useMemo(() => {
        const habitTrend = thisWeek.stats.habits - lastWeek.stats.habits
        const focusTrend = thisWeek.stats.focus - lastWeek.stats.focus
        const overallTrend = thisWeek.stats.completionRate - lastWeek.stats.completionRate
        
        return {
            habits: habitTrend,
            focus: focusTrend,
            overall: overallTrend,
            isImproving: overallTrend > 0
        }
    }, [thisWeek.stats, lastWeek.stats])
    
    const motivationMessage = getMotivationalMessage(thisWeek.stats, trends.overall)
    
    return (
        <div className="card bg-gradient-to-br from-primary/5 to-success/5">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between mb-3 -m-1 p-1 rounded-lg hover:bg-black/5 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <IconChartBar size={20} className="text-primary" />
                    <h2 className="text-h2 text-ink">This Week</h2>
                </div>
                <div className="flex items-center gap-2">
                    {trends.overall !== 0 && (
                        <div className={`flex items-center gap-1 text-small ${
                            trends.isImproving ? 'text-success' : 'text-warning'
                        }`}>
                            {trends.isImproving ? (
                                <IconTrendingUp size={16} />
                            ) : (
                                <IconTrendingDown size={16} />
                            )}
                            <span>{Math.abs(trends.overall)}%</span>
                        </div>
                    )}
                    {isExpanded ? (
                        <IconChevronUp size={20} className="text-ink-muted" />
                    ) : (
                        <IconChevronDown size={20} className="text-ink-muted" />
                    )}
                </div>
            </button>

            {/* Compact Summary (always visible) */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                {/* Habits */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <IconFlame size={16} className="text-primary" />
                        <span className="text-h2 text-ink">{thisWeek.stats.habits}</span>
                    </div>
                    <p className="text-tiny text-ink-muted">Habits</p>
                </div>

                {/* Focus */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <IconBulb size={16} className="text-info" />
                        <span className="text-h2 text-ink">{thisWeek.stats.focus}</span>
                    </div>
                    <p className="text-tiny text-ink-muted">Fokus</p>
                </div>

                {/* Journals */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <IconNotebook size={16} className="text-warning" />
                        <span className="text-h2 text-ink">{thisWeek.stats.journals}</span>
                    </div>
                    <p className="text-tiny text-ink-muted">Jurnal</p>
                </div>

                {/* Books */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                        <IconBook size={16} className="text-purple-500" />
                        <span className="text-h2 text-ink">{thisWeek.stats.books}</span>
                    </div>
                    <p className="text-tiny text-ink-muted">Buku</p>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="space-y-3 pt-3 border-t border-line/50 animate-in fade-in slide-in-from-top-2">
                    {/* Completion Rate */}
                    <div>
                        <div className="flex items-center justify-between text-small mb-1.5">
                            <span className="text-ink-muted">Completion Rate</span>
                            <span className="text-ink font-medium">
                                {thisWeek.stats.activeDays}/{thisWeek.stats.daysElapsed} hari • {thisWeek.stats.completionRate}%
                            </span>
                        </div>
                        <div className="h-2 bg-paper-warm rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all"
                                style={{ width: `${thisWeek.stats.completionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Streak Info */}
                    {thisWeek.stats.currentStreak > 0 && (
                        <div className="flex items-center justify-between py-2 px-3 bg-warning/10 rounded-lg">
                            <span className="text-small text-ink-muted">Streak saat ini</span>
                            <div className="flex items-center gap-1.5">
                                <IconFlame size={18} className="text-warning" />
                                <span className="text-h3 text-ink">{thisWeek.stats.currentStreak} hari</span>
                            </div>
                        </div>
                    )}

                    {/* Trends Comparison */}
                    <div className="space-y-2">
                        <p className="text-tiny text-ink-muted uppercase tracking-wide">vs. Minggu Lalu</p>
                        <div className="grid grid-cols-2 gap-2 text-small">
                            {trends.habits !== 0 && (
                                <div className={`flex items-center gap-1.5 ${
                                    trends.habits > 0 ? 'text-success' : 'text-ink-muted'
                                }`}>
                                    <IconFlame size={14} />
                                    <span>{trends.habits > 0 ? '+' : ''}{trends.habits} habits</span>
                                </div>
                            )}
                            {trends.focus !== 0 && (
                                <div className={`flex items-center gap-1.5 ${
                                    trends.focus > 0 ? 'text-success' : 'text-ink-muted'
                                }`}>
                                    <IconBulb size={14} />
                                    <span>{trends.focus > 0 ? '+' : ''}{trends.focus} fokus</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            <div className="mt-3 pt-3 border-t border-line/50">
                <p className="text-small text-ink italic">
                    {motivationMessage}
                </p>
            </div>
        </div>
    )
}

export default WeeklyReport
