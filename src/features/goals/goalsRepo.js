/**
 * Goals Repository - CRUD operations for goals
 * @ts-check
 */

import { getDB, generateId, now } from '../../lib/db'

/**
 * Goal types
 */
export const GOAL_TYPES = {
    SAVINGS: 'savings',
    HABIT: 'habit',
}

/**
 * Goal status
 */
export const GOAL_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
}

/**
 * Source kinds for savings goals
 */
export const SOURCE_KINDS = {
    ACCOUNT: 'account',      // Single account balance
    NET_WORTH: 'netWorth',   // Total net worth
    CASHFLOW: 'cashflow',    // Monthly savings (income - expense)
}

// ==================== CRUD Operations ====================

/**
 * Get all goals
 * @returns {Promise<Object[]>}
 */
export async function getAllGoals() {
    const db = await getDB()
    return db.getAll('goals')
}

/**
 * Get active goals only
 * @returns {Promise<Object[]>}
 */
export async function getActiveGoals() {
    const db = await getDB()
    return db.getAllFromIndex('goals', 'by_status', GOAL_STATUS.ACTIVE)
}

/**
 * Get goal by ID
 * @param {string} id
 */
export async function getGoal(id) {
    const db = await getDB()
    return db.get('goals', id)
}

/**
 * Create a new goal
 * @param {Object} data
 */
export async function createGoal(data) {
    const db = await getDB()

    const goal = {
        id: generateId(),
        type: data.type,
        title: data.title,
        target_amount: data.target_amount || 0,
        deadline: data.deadline || null, // YYYY-MM-DD
        source: data.source || null, // { kind, ref_id }
        status: GOAL_STATUS.ACTIVE,
        created_at: now(),
        updated_at: now(),
    }

    await db.put('goals', goal)
    return goal
}

/**
 * Update a goal
 * @param {string} id
 * @param {Object} updates
 */
export async function updateGoal(id, updates) {
    const db = await getDB()
    const goal = await db.get('goals', id)

    if (!goal) throw new Error('Goal not found')

    const updated = {
        ...goal,
        ...updates,
        updated_at: now(),
    }

    await db.put('goals', updated)
    return updated
}

/**
 * Delete a goal
 * @param {string} id
 */
export async function deleteGoal(id) {
    const db = await getDB()
    await db.delete('goals', id)
}

/**
 * Mark goal as completed
 * @param {string} id
 */
export async function completeGoal(id) {
    return updateGoal(id, { status: GOAL_STATUS.COMPLETED })
}

/**
 * Archive a goal
 * @param {string} id
 */
export async function archiveGoal(id) {
    return updateGoal(id, { status: GOAL_STATUS.ARCHIVED })
}

export default {
    GOAL_TYPES,
    GOAL_STATUS,
    SOURCE_KINDS,
    getAllGoals,
    getActiveGoals,
    getGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    archiveGoal,
}
