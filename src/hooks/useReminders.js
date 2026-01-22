import { useMemo } from 'react'
import { computeReminders } from '../features/reminders/reminderChecks'
import { useHabits } from './useHabits'
import { useTodayCheckins } from './useHabits'
import { useTodayJournals } from './useJournals'
import { useTodayPomodoro } from './usePomodoro'
import { useCurrentMonthSummary } from './useFinance'
import { useGoals } from './useGoals'

/**
 * Hook that exposes active reminders computed from various hooks.
 * Keeps logic local and synchronous.
 */
export function useReminders() {
  const { habits } = useHabits()
  const { checkins } = useTodayCheckins()
  const { journals } = useTodayJournals()
  const { sessionCount } = useTodayPomodoro()
  const { summary: monthSummary } = useCurrentMonthSummary()
  const { goals } = useGoals()

  const reminders = useMemo(() => {
    try {
      // normalize habit checked flag: compute from checkins
      const habitList = (habits || []).map(h => ({ ...h, checked: (checkins || []).some(c => c.habit_id === h.id) }))
      return computeReminders({ habits: habitList, checkins, journals, monthSummary, sessionCount, goals })
    } catch (e) {
      console.warn('useReminders compute failed', e)
      return []
    }
  }, [habits, checkins, journals, monthSummary, sessionCount, goals])

  return { reminders }
}
