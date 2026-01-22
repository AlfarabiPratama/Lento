import { useEffect } from 'react'
import { useHabits, useTodayCheckins } from '../hooks/useHabits'
import { setBadge } from '../lib/badge'

/**
 * Hook to manage PWA app badge based on pending tasks/quests
 * Updates badge whenever pending counts change
 */
export function useBadgeManager() {
    const { habits } = useHabits()
    const { isChecked } = useTodayCheckins()

    useEffect(() => {
        // Calculate unchecked habits for today
        const uncheckedHabits = habits.filter(h => !isChecked(h.id)).length

        // Update badge with pending count
        setBadge(uncheckedHabits)

        // Clear badge when all done
        return () => {
            // Don't clear on unmount - let it persist
        }
    }, [habits, isChecked])

    return null
}

export default useBadgeManager
