/**
 * useQuests - React hook for daily and weekly quest data
 * 
 * Computes quests from existing user data using the quest engine.
 * Quests are stable per day (stored assignment) with live progress.
 */

import { useMemo, useEffect, useState } from 'react'
import { buildQuestStats } from './questStats'
import { getDailyQuests } from './questEngine'
import { recordDailyXP, getAllTimeXP } from './questXP'
import { getWeeklyQuests, getWeeklyXP, allWeeklyCompleted } from './weeklyQuests'
import { checkAndUnlockAchievements, getAchievementStats } from './achievements'
import { useHabits } from '../../hooks/useHabits'
import { useJournals } from '../../hooks/useJournals'

/**
 * Hook for accessing daily and weekly quests
 */
export function useQuests() {
    const { habits } = useHabits()
    const { entries: journals } = useJournals()
    const [newAchievements, setNewAchievements] = useState([])

    // MVP: Focus and Books hooks don't exist yet - use empty arrays
    const focusSessions = []
    const books = []

    const now = new Date()

    const { stats, quests, weeklyQuests } = useMemo(() => {
        const stats = buildQuestStats({
            habits,
            journals,
            focusSessions,
            books,
        }, now)

        const quests = getDailyQuests({
            todayKey: stats.todayKey,
            stats,
            max: 4,
        })

        const weeklyQuests = getWeeklyQuests(stats)

        return { stats, quests, weeklyQuests }
    }, [habits, journals, focusSessions, books])

    const completedCount = quests.filter(q => q.completed).length
    const totalXP = quests.reduce((sum, q) => sum + (q.completed ? q.xp : 0), 0)

    const weeklyCompletedCount = weeklyQuests.filter(q => q.completed).length
    const weeklyTotalXP = weeklyQuests.reduce((sum, q) => sum + (q.completed ? q.xp : 0), 0)

    const lifetimeXP = getAllTimeXP()
    const achievementStats = getAchievementStats()

    // Record daily XP (idempotent - only increases)
    useEffect(() => {
        recordDailyXP(stats.todayKey, totalXP, quests.length)
    }, [stats.todayKey, totalXP, quests.length])

    // Check for new achievements
    useEffect(() => {
        const unlocked = checkAndUnlockAchievements(stats)
        if (unlocked.length > 0) {
            setNewAchievements(unlocked)
        }
    }, [stats])

    // Clear new achievements after displaying
    const clearNewAchievements = () => setNewAchievements([])

    return {
        // Daily quests
        quests,
        stats,
        completedCount,
        totalXP,
        allCompleted: completedCount === quests.length && quests.length > 0,

        // Weekly quests
        weeklyQuests,
        weeklyCompletedCount,
        weeklyTotalXP,
        allWeeklyCompleted: weeklyCompletedCount === weeklyQuests.length && weeklyQuests.length > 0,

        // Achievements
        lifetimeXP,
        achievementStats,
        newAchievements,
        clearNewAchievements,
    }
}

export default useQuests

