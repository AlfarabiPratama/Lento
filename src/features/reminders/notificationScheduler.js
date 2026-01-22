const scheduled = new Map()

const getDelayToTime = (hour, minute = 0) => {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target <= now) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime() - now.getTime()
}

export const scheduleDailyReminder = (id, hour, minute = 0, callback) => {
  cancelScheduledReminder(id)
  const delay = getDelayToTime(hour, minute)
  const timer = setTimeout(() => {
    try {
      callback?.()
    } finally {
      // reschedule for next day
      scheduleDailyReminder(id, hour, minute, callback)
    }
  }, delay)
  scheduled.set(id, timer)
}

export const cancelScheduledReminder = (id) => {
  const timer = scheduled.get(id)
  if (timer) {
    clearTimeout(timer)
    scheduled.delete(id)
  }
}

export const cancelAllScheduled = () => {
  Array.from(scheduled.keys()).forEach(cancelScheduledReminder)
}
