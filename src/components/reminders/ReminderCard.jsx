import React from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBell } from '@tabler/icons-react'
import { useReminderCenter } from '../../contexts/ReminderContext'

export function ReminderCardList() {
  const { reminders, dismissReminder, snoozeReminder } = useReminderCenter()
  const navigate = useNavigate()
  if (!reminders?.length) return null
  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <div key={reminder.id} className="card p-3 flex gap-3 items-start">
          <div className="min-w-11 min-h-11 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconBell size={18} stroke={2} className="text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-h3 text-ink font-medium">{reminder.title}</h3>
                <p className="text-small text-ink-muted">{reminder.message}</p>
              </div>
              <button
                className="btn-primary btn-xs"
                onClick={() => navigate(reminder.action?.route || '/')}
              >
                {reminder.action?.label || 'Lihat'}
              </button>
            </div>
            <div className="flex gap-2">
              {reminder.snoozeable && (
                <button
                  className="btn-ghost btn-xs"
                  onClick={() => snoozeReminder(reminder.id, reminder.snoozeMinutes || 60)}
                >
                  Snooze
                </button>
              )}
              {reminder.dismissable && (
                <button
                  className="btn-ghost btn-xs"
                  onClick={() => dismissReminder(reminder.id)}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
