import { getHabit, getCheckinsInRange } from './habits'

/**
 * Habit Statistics Service
 * Comprehensive stats calculation for habit detail page
 */

/**
 * Get detailed statistics for a habit
 * @param {string} habitId - Habit ID
 * @param {number} days - Number of days to analyze (default 90)
 * @returns {Promise<Object>} Detailed statistics
 */
export async function getDetailedHabitStats(habitId, days = 90) {
    const habit = await getHabit(habitId)
    if (!habit) throw new Error('Habit not found')

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const checkins = await getCheckinsInRange(habitId, startDate, endDate)
    
    // Sort checkins by date
    const sortedCheckins = checkins.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    )

    // Calculate various metrics
    const totalCheckins = checkins.length
    const completionRate = Math.round((totalCheckins / days) * 100)
    
    // Calculate streaks
    const { currentStreak, longestStreak, streakData } = calculateStreaks(sortedCheckins, days)
    
    // Weekly breakdown (last 12 weeks)
    const weeklyData = calculateWeeklyData(sortedCheckins, 12)
    
    // Monthly breakdown (last 6 months)
    const monthlyData = calculateMonthlyData(sortedCheckins, 6)
    
    // Best day of week
    const dayOfWeekStats = calculateDayOfWeekStats(sortedCheckins)
    
    // Heatmap data for calendar visualization
    const heatmapData = generateHeatmapData(sortedCheckins, days)

    return {
        habit,
        overview: {
            totalCheckins,
            completionRate,
            currentStreak,
            longestStreak,
            daysTracked: days,
            bestDay: dayOfWeekStats.bestDay,
        },
        trends: {
            weekly: weeklyData,
            monthly: monthlyData,
            dayOfWeek: dayOfWeekStats.distribution,
        },
        heatmap: heatmapData,
        streakHistory: streakData,
        checkins: sortedCheckins, // Include check-ins with notes
    }
}

/**
 * Calculate current and longest streaks
 */
function calculateStreaks(checkins, totalDays) {
    const checkinDates = new Set(checkins.map(c => c.date))
    const today = new Date()
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const streakData = []

    // Calculate current streak (from today backwards)
    for (let i = 0; i < totalDays; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateStr = checkDate.toISOString().split('T')[0]

        if (checkinDates.has(dateStr)) {
            currentStreak++
        } else if (i > 0) { // Allow today to be unchecked
            break
        }
    }

    // Calculate longest streak
    for (let i = 0; i < totalDays; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - (totalDays - i - 1))
        const dateStr = checkDate.toISOString().split('T')[0]

        if (checkinDates.has(dateStr)) {
            tempStreak++
            longestStreak = Math.max(longestStreak, tempStreak)
        } else {
            if (tempStreak > 0) {
                streakData.push({
                    length: tempStreak,
                    endDate: dateStr,
                })
            }
            tempStreak = 0
        }
    }

    return {
        currentStreak,
        longestStreak,
        streakData: streakData.slice(-5), // Last 5 streaks
    }
}

/**
 * Calculate weekly completion data
 */
function calculateWeeklyData(checkins, weeks) {
    const weeklyData = []
    const today = new Date()
    
    for (let i = 0; i < weeks; i++) {
        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() - (i * 7))
        const weekStart = new Date(weekEnd)
        weekStart.setDate(weekStart.getDate() - 6)
        
        const weekCheckins = checkins.filter(c => {
            const date = new Date(c.date)
            return date >= weekStart && date <= weekEnd
        })
        
        weeklyData.unshift({
            week: `W${weeks - i}`,
            count: weekCheckins.length,
            rate: Math.round((weekCheckins.length / 7) * 100),
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
        })
    }
    
    return weeklyData
}

/**
 * Calculate monthly completion data
 */
function calculateMonthlyData(checkins, months) {
    const monthlyData = []
    const today = new Date()
    
    for (let i = 0; i < months; i++) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
        const daysInMonth = monthEnd.getDate()
        
        const monthCheckins = checkins.filter(c => {
            const date = new Date(c.date)
            return date.getMonth() === monthDate.getMonth() && 
                   date.getFullYear() === monthDate.getFullYear()
        })
        
        monthlyData.unshift({
            month: monthDate.toLocaleDateString('id-ID', { month: 'short' }),
            count: monthCheckins.length,
            rate: Math.round((monthCheckins.length / daysInMonth) * 100),
            daysInMonth,
        })
    }
    
    return monthlyData
}

/**
 * Calculate day of week statistics
 */
function calculateDayOfWeekStats(checkins) {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]
    
    checkins.forEach(c => {
        const date = new Date(c.date)
        dayCounts[date.getDay()]++
    })
    
    const maxCount = Math.max(...dayCounts)
    const bestDayIndex = dayCounts.indexOf(maxCount)
    
    const distribution = dayNames.map((name, index) => ({
        day: name,
        count: dayCounts[index],
        percentage: checkins.length > 0 
            ? Math.round((dayCounts[index] / checkins.length) * 100) 
            : 0,
    }))
    
    return {
        distribution,
        bestDay: dayNames[bestDayIndex],
        bestDayCount: maxCount,
    }
}

/**
 * Generate heatmap data for calendar visualization
 */
function generateHeatmapData(checkins, days) {
    const heatmap = []
    const checkinDates = new Set(checkins.map(c => c.date))
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        heatmap.push({
            date: dateStr,
            completed: checkinDates.has(dateStr),
            dayOfWeek: date.getDay(),
            weekOfYear: getWeekOfYear(date),
        })
    }
    
    return heatmap
}

/**
 * Get week of year (ISO week)
 */
function getWeekOfYear(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

/**
 * Get simple stats for quick view
 */
export async function getQuickHabitStats(habitId) {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const checkins = await getCheckinsInRange(habitId, startDate, endDate)

    return {
        weekCount: checkins.length,
        weekRate: Math.round((checkins.length / 7) * 100),
    }
}

export default {
    getDetailedHabitStats,
    getQuickHabitStats,
}
