import { useState, useEffect, useCallback } from 'react'
import {
    getAllGoals,
    getActiveGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    GOAL_STATUS,
} from '../features/goals/goalsRepo'
import { getGoalsWithProgress } from '../features/goals/goalsSelectors'

/**
 * useGoals - Goals state and operations hook
 */
export function useGoals() {
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('active') // 'active' | 'completed' | 'all'

    // Load goals
    const loadGoals = useCallback(async () => {
        setLoading(true)
        try {
            let rawGoals = []

            if (filter === 'active') {
                rawGoals = await getActiveGoals()
            } else if (filter === 'completed') {
                const all = await getAllGoals()
                rawGoals = all.filter(g => g.status === GOAL_STATUS.COMPLETED)
            } else {
                rawGoals = await getAllGoals()
            }

            // Get progress for each goal
            const goalsWithProgress = await getGoalsWithProgress(rawGoals)
            setGoals(goalsWithProgress)
        } catch (err) {
            console.error('Failed to load goals:', err)
        } finally {
            setLoading(false)
        }
    }, [filter])

    // Load on mount and filter change
    useEffect(() => {
        loadGoals()
    }, [loadGoals])

    // Create goal
    const addGoal = useCallback(async (data) => {
        const goal = await createGoal(data)
        await loadGoals()
        return goal
    }, [loadGoals])

    // Update goal
    const editGoal = useCallback(async (id, updates) => {
        await updateGoal(id, updates)
        await loadGoals()
    }, [loadGoals])

    // Remove goal
    const removeGoal = useCallback(async (id) => {
        await deleteGoal(id)
        await loadGoals()
    }, [loadGoals])

    // Mark as complete
    const markComplete = useCallback(async (id) => {
        await completeGoal(id)
        await loadGoals()
    }, [loadGoals])

    // Reactivate a completed goal
    const reactivateGoal = useCallback(async (id) => {
        await updateGoal(id, { status: GOAL_STATUS.ACTIVE })
        await loadGoals()
    }, [loadGoals])

    return {
        goals,
        loading,
        filter,
        setFilter,
        addGoal,
        editGoal,
        removeGoal,
        markComplete,
        reactivateGoal,
        refresh: loadGoals,
    }
}

export default useGoals

