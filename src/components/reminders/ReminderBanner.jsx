/**
 * ReminderBanner - Gentle nudge banner for reminders
 * 
 * Follows Material Design guideline: max 2 actions per banner.
 * Pattern: Primary action + Secondary "Nanti" (hide for today)
 * 
 * Persistence:
 * - Uses localStorage key: lento.ui.reminderHiddenUntil.{type}
 * - "Nanti" hides until tomorrow (not permanent dismiss)
 * 
 * A11y:
 * - role="region" (not alert - too urgent for calm tech)
 * - aria-label for screen reader context
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPencil, IconMoon } from '@tabler/icons-react'
import { useReminderCenter } from '../../contexts/ReminderContext'

// Get today's date as YYYY-MM-DD (local timezone)
function getTodayDateKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Check if reminder should be hidden today
function isHiddenToday(reminderId) {
  const key = `lento.ui.reminderHiddenUntil.${reminderId}`
  const hiddenUntil = localStorage.getItem(key)
  if (!hiddenUntil) return false
  return hiddenUntil >= getTodayDateKey()
}

// Hide reminder until tomorrow
function hideUntilTomorrow(reminderId) {
  const key = `lento.ui.reminderHiddenUntil.${reminderId}`
  localStorage.setItem(key, getTodayDateKey())
}

export default function ReminderBanner() {
  const { reminders, dismissReminder, snoozeReminder } = useReminderCenter()
  const navigate = useNavigate()
  const [hiddenIds, setHiddenIds] = useState(() => new Set())

  // Check hidden state on mount
  useEffect(() => {
    if (!reminders || reminders.length === 0) return

    const hidden = new Set()
    reminders.forEach(r => {
      if (isHiddenToday(r.id)) {
        hidden.add(r.id)
      }
    })
    setHiddenIds(hidden)
  }, [reminders])

  if (!reminders || reminders.length === 0) return null

  // Find first non-hidden reminder
  const reminder = reminders.find(r => !hiddenIds.has(r.id))
  if (!reminder) return null

  // Handle "Nanti" - hide until tomorrow
  const handleLater = () => {
    hideUntilTomorrow(reminder.id)
    setHiddenIds(prev => new Set([...prev, reminder.id]))

    // Also call context snooze/dismiss if available
    if (reminder.snoozeable) {
      snoozeReminder(reminder.id, reminder.snoozeMinutes || 60)
    } else if (reminder.dismissable) {
      dismissReminder(reminder.id)
    }
  }

  // Handle primary action
  const handleAction = () => {
    if (reminder.action?.route) {
      navigate(reminder.action.route)
    }
    // Hide after taking action
    hideUntilTomorrow(reminder.id)
    setHiddenIds(prev => new Set([...prev, reminder.id]))

    if (reminder.dismissable) {
      dismissReminder(reminder.id)
    }
  }

  return (
    <div
      className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-4"
      role="region"
      aria-label="Pengingat jurnal"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="min-w-11 min-h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <IconPencil size={18} stroke={2} className="text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-body text-ink font-medium">
            {reminder.title || 'Sudah jurnal hari ini?'}
          </h3>
          <p className="text-small text-ink-muted mt-0.5">
            {reminder.message || 'Cuma 1 menit, biar hari terasa lebih tenang.'}
          </p>

          {/* 2-button actions (Material Design guideline) */}
          <div className="flex items-center gap-3 mt-3">
            {/* Primary: Action */}
            <button
              onClick={handleAction}
              className="btn-primary btn-sm"
            >
              {reminder.action?.label || 'Tulis Jurnal'}
            </button>

            {/* Secondary: Later (hide until tomorrow) */}
            <button
              onClick={handleLater}
              className="btn-ghost btn-sm text-ink-muted hover:text-ink flex items-center gap-1"
            >
              <IconMoon size={14} />
              <span>Nanti</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
