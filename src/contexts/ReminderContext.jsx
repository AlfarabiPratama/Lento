import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useReminders } from '../hooks/useReminders'
import { scheduleDailyReminder, cancelScheduledReminder, cancelAllScheduled } from '../features/reminders/notificationScheduler'
import { requestNotificationPermission, showLocalNotification, getNotificationPermission } from '../features/reminders/notificationService'

const STORAGE_KEY = 'lento.reminder_prefs.v1'
const DISMISS_KEY = 'lento.reminder_dismiss.v1'
const SNOOZE_KEY = 'lento.reminder_snooze.v1'

const defaultPrefs = {
  inAppEnabled: true,
  localEnabled: false,
  pushEnabled: false,
  morningTime: '08:00',
  eveningTime: '20:00',
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
  } catch (e) {
    return fallback
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // ignore
  }
}

const ReminderContext = createContext(null)

export function ReminderProvider({ children }) {
  const { reminders: computedReminders } = useReminders()
  const [prefs, setPrefs] = useState(() => loadJson(STORAGE_KEY, defaultPrefs))
  const [dismissed, setDismissed] = useState(() => loadJson(DISMISS_KEY, {}))
  const [snoozed, setSnoozed] = useState(() => loadJson(SNOOZE_KEY, {}))
  const permissionRef = useRef('default')

  // Persist prefs/dismiss/snooze
  useEffect(() => saveJson(STORAGE_KEY, prefs), [prefs])
  useEffect(() => saveJson(DISMISS_KEY, dismissed), [dismissed])
  useEffect(() => saveJson(SNOOZE_KEY, snoozed), [snoozed])

  // Track permission
  useEffect(() => {
    permissionRef.current = getNotificationPermission()
  }, [])

  const activeReminders = useMemo(() => {
    const now = Date.now()
    return (computedReminders || []).filter((r) => {
      if (!prefs.inAppEnabled) return false
      if (dismissed[r.id]) return false
      const snoozeUntil = snoozed[r.id]
      if (snoozeUntil && now < snoozeUntil) return false
      return true
    })
  }, [computedReminders, dismissed, snoozed, prefs.inAppEnabled])

  const dismissReminder = (id) => {
    setDismissed((prev) => ({ ...prev, [id]: Date.now() }))
  }

  const snoozeReminder = (id, minutes) => {
    const until = Date.now() + minutes * 60 * 1000
    setSnoozed((prev) => ({ ...prev, [id]: until }))
  }

  const resetReminders = () => {
    setDismissed({})
    setSnoozed({})
  }

  // Local notification helpers
  const ensurePermission = async () => {
    const result = await requestNotificationPermission()
    permissionRef.current = result
    return result
  }

  // Show local notification when new high-priority reminder arrives (opt-in)
  const lastShownRef = useRef(new Set())
  useEffect(() => {
    if (!prefs.localEnabled) return
    if (permissionRef.current !== 'granted') return
    activeReminders.forEach((r) => {
      if (r.priority === 'high' && !lastShownRef.current.has(r.id)) {
        showLocalNotification(r.title, {
          body: r.message,
          data: { route: r.action?.route || '/' },
        })
        lastShownRef.current.add(r.id)
      }
    })
  }, [activeReminders, prefs.localEnabled])

  // Daily schedules (morning/evening) to nudge user
  useEffect(() => {
    if (!prefs.localEnabled) {
      cancelAllScheduled()
      return
    }
    if (permissionRef.current !== 'granted') return

    const schedule = (id, time) => {
      const [h, m] = time.split(':').map(Number)
      scheduleDailyReminder(id, h, m, () => {
        showLocalNotification('Lento', {
          body: id === 'morning' ? 'Selamat pagi! Cek habit & jurnal hari ini' : 'Waktunya review malam ini',
          data: { route: id === 'morning' ? '/today' : '/journal' },
        })
      })
    }

    schedule('morning', prefs.morningTime)
    schedule('evening', prefs.eveningTime)

    return () => {
      cancelScheduledReminder('morning')
      cancelScheduledReminder('evening')
    }
  }, [prefs.localEnabled, prefs.morningTime, prefs.eveningTime])

  const value = {
    prefs,
    setPrefs,
    reminders: activeReminders,
    dismissReminder,
    snoozeReminder,
    resetReminders,
    ensurePermission,
    permission: permissionRef.current,
  }

  return <ReminderContext.Provider value={value}>{children}</ReminderContext.Provider>
}

export function useReminderCenter() {
  const ctx = useContext(ReminderContext)
  if (!ctx) {
    throw new Error('useReminderCenter must be used within ReminderProvider')
  }
  return ctx
}
