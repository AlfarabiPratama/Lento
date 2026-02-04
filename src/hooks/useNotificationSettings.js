import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'

/**
 * Hook for managing notification preferences
 * Stores bill reminder settings (3-day, 1-day, quiet hours)
 */
export function useNotificationSettings() {
    const { user } = useAuth()
    const [settings, setSettings] = useState({
        billReminders: {
            threeDayBefore: true,
            oneDayBefore: true,
            enabled: true,
        },
        goalReminders: {
            sevenDayBefore: true,
            threeDayBefore: true,
            oneDayBefore: true,
            enabled: true,
        },
        readingStreakReminders: {
            encouragement: true,
            milestones: true,
            reEngagement: true,
            enabled: true,
        },
        pomodoroNotifications: {
            enabled: true,
            workComplete: true,
            breakComplete: true,
        },
        quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
        },
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false)
            return
        }

        const loadSettings = async () => {
            try {
                const docRef = doc(db, 'notification_settings', user.uid)
                const docSnap = await getDoc(docRef)
                
                if (docSnap.exists()) {
                    setSettings(docSnap.data())
                }
            } catch (error) {
                console.error('Failed to load notification settings:', error)
            } finally {
                setLoading(false)
            }
        }

        loadSettings()
    }, [user?.uid])

    const updateSettings = async (newSettings) => {
        if (!user?.uid) return

        try {
            const docRef = doc(db, 'notification_settings', user.uid)
            await setDoc(docRef, newSettings, { merge: true })
            setSettings(prev => ({ ...prev, ...newSettings }))
        } catch (error) {
            console.error('Failed to update notification settings:', error)
            throw error
        }
    }

    const toggleBillReminder = async (type) => {
        const newSettings = {
            ...settings,
            billReminders: {
                ...settings.billReminders,
                [type]: !settings.billReminders[type],
            },
        }
        await updateSettings(newSettings)
    }

    const toggleBillReminders = async () => {
        const newSettings = {
            ...settings,
            billReminders: {
                ...settings.billReminders,
                enabled: !settings.billReminders.enabled,
            },
        }
        await updateSettings(newSettings)
    }

    const toggleGoalReminder = async (type) => {
        const newSettings = {
            ...settings,
            goalReminders: {
                ...settings.goalReminders,
                [type]: !settings.goalReminders[type],
            },
        }
        await updateSettings(newSettings)
    }

    const toggleGoalReminders = async () => {
        const newSettings = {
            ...settings,
            goalReminders: {
                ...settings.goalReminders,
                enabled: !settings.goalReminders.enabled,
            },
        }
        await updateSettings(newSettings)
    }

    const toggleReadingStreakReminder = async (type) => {
        const newSettings = {
            ...settings,
            readingStreakReminders: {
                ...settings.readingStreakReminders,
                [type]: !settings.readingStreakReminders[type],
            },
        }
        await updateSettings(newSettings)
    }

    const toggleReadingStreakReminders = async () => {
        const newSettings = {
            ...settings,
            readingStreakReminders: {
                ...settings.readingStreakReminders,
                enabled: !settings.readingStreakReminders.enabled,
            },
        }
        await updateSettings(newSettings)
    }

    const toggleQuietHours = async () => {
        const newSettings = {
            ...settings,
            quietHours: {
                ...settings.quietHours,
                enabled: !settings.quietHours.enabled,
            },
        }
        await updateSettings(newSettings)
    }

    const updateQuietHours = async (startTime, endTime) => {
        const newSettings = {
            ...settings,
            quietHours: {
                ...settings.quietHours,
                startTime,
                endTime,
            },
        }
        await updateSettings(newSettings)
    }

    const togglePomodoroNotifications = async () => {
        const newSettings = {
            ...settings,
            pomodoroNotifications: {
                ...settings.pomodoroNotifications,
                enabled: !settings.pomodoroNotifications.enabled,
            },
        }
        await updateSettings(newSettings)
    }

    const togglePomodoroNotification = async (type) => {
        const newSettings = {
            ...settings,
            pomodoroNotifications: {
                ...settings.pomodoroNotifications,
                [type]: !settings.pomodoroNotifications[type],
            },
        }
        await updateSettings(newSettings)
    }

    return {
        settings,
        loading,
        toggleBillReminder,
        toggleBillReminders,
        toggleGoalReminder,
        toggleGoalReminders,
        toggleReadingStreakReminder,
        toggleReadingStreakReminders,
        togglePomodoroNotifications,
        togglePomodoroNotification,
        toggleQuietHours,
        updateQuietHours,
    }
}
