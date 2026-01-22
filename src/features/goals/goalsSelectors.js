/**
 * Goals Selectors - Compute progress for goals
 * @ts-check
 */

import { getDB } from '../../lib/db'
import { GOAL_TYPES, SOURCE_KINDS } from './goalsRepo'

/**
 * Calculate progress for a savings goal
 * @param {Object} goal
 * @returns {Promise<{current: number, target: number, progress: number, milestones: Object}>}
 */
export async function getSavingsProgress(goal) {
    const db = await getDB()
    let current = 0

    if (!goal.source) {
        // No source defined, default to net worth
        const accounts = await db.getAll('accounts')
        current = accounts.reduce((sum, acc) => sum + (acc.balance_cached || 0), 0)
    } else if (goal.source.kind === SOURCE_KINDS.ACCOUNT) {
        // Single account balance
        const account = await db.get('accounts', goal.source.ref_id)
        current = account?.balance_cached || 0
    } else if (goal.source.kind === SOURCE_KINDS.NET_WORTH) {
        // Total net worth
        const accounts = await db.getAll('accounts')
        current = accounts.reduce((sum, acc) => sum + (acc.balance_cached || 0), 0)
    } else if (goal.source.kind === SOURCE_KINDS.CASHFLOW) {
        // Monthly savings - sum up all savings allocations
        // For MVP, we'll use net worth as fallback
        const accounts = await db.getAll('accounts')
        current = accounts.reduce((sum, acc) => sum + (acc.balance_cached || 0), 0)
    }

    const target = goal.target_amount || 1
    const progress = Math.min(current / target, 1)

    return {
        current,
        target,
        progress,
        milestones: getMilestones(progress),
    }
}

/**
 * Calculate progress for a habit goal
 * @param {Object} goal
 * @returns {Promise<{current: number, target: number, progress: number, milestones: Object}>}
 */
export async function getHabitProgress(goal) {
    const db = await getDB()
    let current = 0

    if (goal.source?.ref_id) {
        // Get habit streak
        const habit = await db.get('habits', goal.source.ref_id)
        current = habit?.current_streak || 0
    }

    const target = goal.target_amount || 1 // target streak
    const progress = Math.min(current / target, 1)

    return {
        current,
        target,
        progress,
        milestones: getMilestones(progress),
    }
}

/**
 * Get progress for any goal type
 * @param {Object} goal
 */
export async function getGoalProgress(goal) {
    if (goal.type === GOAL_TYPES.SAVINGS) {
        return getSavingsProgress(goal)
    } else if (goal.type === GOAL_TYPES.HABIT) {
        return getHabitProgress(goal)
    }

    return {
        current: 0,
        target: 1,
        progress: 0,
        milestones: getMilestones(0),
    }
}

/**
 * Get milestone status (25%, 50%, 75%, 100%)
 * @param {number} progress - 0-1
 * @returns {Object}
 */
function getMilestones(progress) {
    return {
        quarter: progress >= 0.25,
        half: progress >= 0.5,
        threeQuarter: progress >= 0.75,
        complete: progress >= 1,
    }
}

/**
 * Get all goals with their progress
 * @param {Object[]} goals
 * @returns {Promise<Object[]>}
 */
export async function getGoalsWithProgress(goals) {
    const results = []

    for (const goal of goals) {
        const progress = await getGoalProgress(goal)
        results.push({
            ...goal,
            ...progress,
        })
    }

    return results
}

/**
 * Calculate days remaining until deadline
 * @param {string} deadline - YYYY-MM-DD
 * @returns {number | null}
 */
export function getDaysRemaining(deadline) {
    if (!deadline) return null

    const now = new Date()
    const target = new Date(deadline)
    const diff = target.getTime() - now.getTime()

    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default {
    getSavingsProgress,
    getHabitProgress,
    getGoalProgress,
    getGoalsWithProgress,
    getDaysRemaining,
}
