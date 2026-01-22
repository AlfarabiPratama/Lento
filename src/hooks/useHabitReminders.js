/**
 * useHabitReminders - Hook for habit scheduled reminders
 * 
 * Checks every 60 seconds if any habit's reminder time matches current time.
 * Uses a 5-minute window after the scheduled time.
 * Dedupes by habitId + time + date to prevent repeat triggers.
 * 
 * Supports reminder_days (Opsi B):
 * - If reminder_days is null/empty -> fallback to target_days
 * - If reminder_days has values -> use those specific days
 * 
 * Phase 2: Uses Notification API for background notifications
 */

import { useEffect, useRef, useCallback } from 'react'
import { showLocalNotification, getNotificationPermission } from '../features/reminders/notificationService'

/**
 * Check if reminder is active today based on reminder_days or target_days
 */
function isReminderActiveToday(habit, now = new Date()) {
    const weekday = now.getDay() // 0=Sunday

    // Use reminder_days if set, otherwise fallback to target_days
    const days = (habit.reminder_days && habit.reminder_days.length > 0)
        ? habit.reminder_days
        : habit.target_days

    // If no days configured, reminder is active every day
    if (!Array.isArray(days) || days.length === 0) {
        return true
    }

    return days.includes(weekday)
}

export function useHabitReminders(habits, onTrigger) {
    // Track triggered reminders (habitId-time-date) to prevent duplicates
    const triggeredRef = useRef(new Set())

    const checkReminders = useCallback(() => {
        if (!habits || habits.length === 0) return

        const now = new Date()
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        const today = now.toDateString()

        habits.forEach((habit) => {
            // Skip if reminder not enabled or not set
            if (!habit.reminder_enabled || !habit.reminder_time) return

            // Skip if today is not a reminder day
            if (!isReminderActiveToday(habit, now)) return

            // Parse reminder time "HH:MM"
            const [h, m] = habit.reminder_time.split(':').map(Number)
            if (isNaN(h) || isNaN(m)) return

            const targetMinutes = h * 60 + m

            // Window: 0-5 minutes after target time
            const diff = nowMinutes - targetMinutes

            // Create unique key for today's reminder
            const key = `${habit.id}-${habit.reminder_time}-${today}`

            // Trigger if within window and not already triggered today
            if (diff >= 0 && diff <= 5 && !triggeredRef.current.has(key)) {
                triggeredRef.current.add(key)

                // Show system notification if permission granted
                if (getNotificationPermission() === 'granted') {
                    showLocalNotification(`⏰ ${habit.name}`, {
                        body: habit.description || 'Waktunya check-in habit ini!',
                        tag: `habit-${habit.id}`, // Prevents duplicate notifications
                        data: { route: '/habits', habitId: habit.id },
                        requireInteraction: false,
                    })
                }

                // Also trigger in-app callback
                onTrigger?.(habit)
            }
        })
    }, [habits, onTrigger])

    useEffect(() => {
        if (!habits || habits.length === 0) return

        // Check immediately on mount
        checkReminders()

        // Then check every 60 seconds
        const interval = setInterval(checkReminders, 60 * 1000)

        return () => clearInterval(interval)
    }, [habits, checkReminders])

    // Clear triggered set at midnight (for new day)
    useEffect(() => {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const msUntilMidnight = tomorrow - now

        const timeout = setTimeout(() => {
            triggeredRef.current.clear()
        }, msUntilMidnight)

        return () => clearTimeout(timeout)
    }, [])
}

export default useHabitReminders

