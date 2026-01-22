/**
 * useStats - Hook untuk aggregasi data statistik
 * 
 * Returns:
 * - lifetimeXP: Total XP earned
 * - currentLevel: Current level (XP/500 + 1)
 * - levelProgress: Progress to next level (0-100)
 * - weeklyActivity: 7 hari terakhir
 * - yearlyActivity: Map dateKey -> count (365 hari)
 * - achievements: Array achievement status
 */

import { useState, useEffect, useMemo } from 'react'
import { useQuests } from '../features/quests/useQuests'

// Get date key in YYYY-MM-DD format
function getDateKey(date) {
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

// Indonesian day abbreviations
const DAY_ABBR = ['M', 'S', 'S', 'R', 'K', 'J', 'S'] // Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu

export function useStats() {
    const { lifetimeXP: questLifetimeXP, achievementStats } = useQuests()
    const [yearlyActivity, setYearlyActivity] = useState({})
    const [loading, setLoading] = useState(true)

    // Load activity data from various stores
    useEffect(() => {
        async function loadActivityData() {
            try {
                const { getDB } = await import('../lib/db')
                const db = await getDB()

                const activityMap = {}

                // Load checkins (habits)
                try {
                    const checkins = await db.getAll('checkins')
                        ; (checkins || []).filter(c => !c.deleted_at && c.completed).forEach(c => {
                            const key = c.date
                            if (key) {
                                activityMap[key] = (activityMap[key] || 0) + 1
                            }
                        })
                } catch (e) { console.warn('No checkins data') }

                // Load pomodoro sessions
                try {
                    const sessions = await db.getAll('pomodoro_sessions')
                        ; (sessions || []).filter(s => !s.deleted_at && s.completed).forEach(s => {
                            const key = s.date
                            if (key) {
                                activityMap[key] = (activityMap[key] || 0) + 1
                            }
                        })
                } catch (e) { console.warn('No pomodoro data') }

                // Load journals
                try {
                    const journals = await db.getAll('journals')
                        ; (journals || []).filter(j => !j.deleted_at).forEach(j => {
                            const key = j.created_at?.split('T')[0]
                            if (key) {
                                activityMap[key] = (activityMap[key] || 0) + 1
                            }
                        })
                } catch (e) { console.warn('No journals data') }

                // Load book sessions
                try {
                    const bookSessions = await db.getAll('book_sessions')
                        ; (bookSessions || []).filter(s => !s.deleted_at).forEach(s => {
                            const key = s.dayKey
                            if (key) {
                                activityMap[key] = (activityMap[key] || 0) + 1
                            }
                        })
                } catch (e) { console.warn('No book sessions data') }

                setYearlyActivity(activityMap)
            } catch (e) {
                console.error('Failed to load activity data:', e)
            } finally {
                setLoading(false)
            }
        }

        loadActivityData()
    }, [])

    // Use XP from quests or fallback
    const lifetimeXP = questLifetimeXP || 0

    // Calculate level and progress
    const currentLevel = Math.floor(lifetimeXP / 500) + 1
    const xpCurrentLevelBase = (currentLevel - 1) * 500
    const xpNextLevelBase = currentLevel * 500
    const levelProgress = Math.round(
        ((lifetimeXP - xpCurrentLevelBase) / (xpNextLevelBase - xpCurrentLevelBase)) * 100
    )

    // Build weekly activity (last 7 days)
    const weeklyActivity = useMemo(() => {
        const result = []
        const today = new Date()

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(today.getDate() - i)
            const key = getDateKey(date)
            const dayIndex = date.getDay()

            // Count activities by type
            result.push({
                day: DAY_ABBR[dayIndex],
                dateKey: key,
                total: yearlyActivity[key] || 0,
            })
        }

        return result
    }, [yearlyActivity])

    // Build achievements from quests system
    const achievements = useMemo(() => {
        // This should come from the actual achievement system
        // For now, return placeholder based on achievementStats
        return [
            { id: 'streak_7', name: '7-Day Streak', unlocked: false, progress: 0, target: 7 },
            { id: 'streak_30', name: '30-Day Streak', unlocked: false, progress: 0, target: 30 },
            { id: 'xp_1000', name: '1,000 XP', unlocked: lifetimeXP >= 1000, progress: lifetimeXP, target: 1000 },
            { id: 'xp_5000', name: '5,000 XP', unlocked: lifetimeXP >= 5000, progress: lifetimeXP, target: 5000 },
            { id: 'habit_master', name: 'Habit Master', unlocked: false, progress: 0, target: 50 },
            { id: 'focus_mode', name: 'Focus Fanatic', unlocked: false, progress: 0, target: 20 },
            { id: 'journalist', name: 'Journal Keeper', unlocked: false, progress: 0, target: 30 },
            { id: 'bookworm', name: 'Bookworm', unlocked: false, progress: 0, target: 10 },
            { id: 'early_bird', name: 'Early Bird', unlocked: false, progress: 0, target: 15 },
            { id: 'night_owl', name: 'Night Owl', unlocked: false, progress: 0, target: 15 },
            { id: 'consistency', name: 'Consistency King', unlocked: false, progress: 0, target: 60 },
            { id: 'all_rounder', name: 'All-Rounder', unlocked: false, progress: 0, target: 40 },
        ]
    }, [lifetimeXP])

    return {
        lifetimeXP,
        currentLevel,
        levelProgress,
        weeklyActivity,
        yearlyActivity,
        achievements,
        loading,
    }
}

export default useStats
