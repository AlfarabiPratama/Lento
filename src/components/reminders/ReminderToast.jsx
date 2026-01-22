import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReminderCenter } from '../../contexts/ReminderContext'

export default function ReminderToast() {
  const { reminders, dismissReminder } = useReminderCenter()
  const navigate = useNavigate()
  const [visibleId, setVisibleId] = useState(null)

  useEffect(() => {
    const high = reminders.find((r) => r.priority === 'high')
    if (high) setVisibleId(high.id)
  }, [reminders])

  const reminder = reminders.find((r) => r.id === visibleId)
  if (!reminder) return null

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="card shadow-lg p-3 w-72">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-small text-ink-muted uppercase">Reminder</p>
            <h4 className="text-h4 text-ink mt-1">{reminder.title}</h4>
            <p className="text-small text-ink-muted">{reminder.message}</p>
          </div>
          <button
            className="btn-ghost btn-xs"
            onClick={() => {
              setVisibleId(null)
              dismissReminder(reminder.id)
            }}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            className="btn-primary btn-xs"
            onClick={() => {
              navigate(reminder.action?.route || '/')
              setVisibleId(null)
            }}
          >
            {reminder.action?.label || 'Lihat'}
          </button>
          <button
            className="btn-ghost btn-xs"
            onClick={() => {
              setVisibleId(null)
              dismissReminder(reminder.id)
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
