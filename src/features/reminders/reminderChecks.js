import { REMINDER_TYPES } from './reminderTypes'
import { REMINDER_CONFIG } from './reminderConfig'

/**
 * Compute active reminders given current app state.
 * This is intentionally simple and synchronous — it will be used by a hook.
 */
export function computeReminders({ habits = [], checkins = [], journals = [], monthSummary = {}, sessionCount = 0, goals = [] } = {}) {
  const reminders = []

  // Habit unchecked: if there are habits and none checked today
  const unchecked = habits.filter(h => !h.checked && !h.deleted_at)
  if (unchecked.length > 0) {
    reminders.push({
      id: `habit_unchecked_${unchecked.length}`,
      type: REMINDER_TYPES.HABIT_UNCHECKED,
      title: `${unchecked.length} habit menunggu check-in`,
      message: unchecked.length > 1 ? `Ada ${unchecked.length} kebiasaan yang belum dicek hari ini.` : `Tandai hari ini untuk ${unchecked[0]?.name}.`,
      action: { label: 'Check-in', route: '/habits' },
      priority: 'medium',
      dismissable: true,
      snoozeable: true,
      snoozeMinutes: REMINDER_CONFIG.defaultSnoozeMinutes,
    })
  }

  // Journal empty
  const todayJournals = journals || []
  if ((todayJournals.length || 0) === 0) {
    reminders.push({
      id: 'journal_empty_1',
      type: REMINDER_TYPES.JOURNAL_EMPTY,
      title: 'Belum menulis jurnal hari ini',
      message: '1 menit cukup untuk menulis apa yang kamu rasakan.',
      action: { label: 'Tulis Jurnal', route: '/journal' },
      priority: 'low',
      dismissable: true,
      snoozeable: true,
      snoozeMinutes: REMINDER_CONFIG.defaultSnoozeMinutes,
    })
  }

  // Pomodoro idle
  if (sessionCount === 0) {
    reminders.push({
      id: 'pomodoro_idle_1',
      type: REMINDER_TYPES.POMODORO_IDLE,
      title: 'Belum ada sesi fokus hari ini',
      message: 'Mulai 25 menit fokus untuk memulai ritme hari ini.',
      action: { label: 'Mulai Fokus', route: '/more/fokus' },
      priority: 'low',
      dismissable: true,
      snoozeable: true,
      snoozeMinutes: REMINDER_CONFIG.defaultSnoozeMinutes,
    })
  }

  // Budget warning (if monthSummary has categories usage)
  try {
    if (monthSummary && monthSummary.budgets) {
      for (const b of monthSummary.budgets) {
        if (b.spent && b.allocated && b.spent / b.allocated >= REMINDER_CONFIG.budgetWarningThreshold) {
          reminders.push({
            id: `budget_warning_${b.id}`,
            type: REMINDER_TYPES.BUDGET_WARNING,
            title: `${b.name} hampir mencapai batas`,
            message: `Penggunaan ${Math.round((b.spent / b.allocated) * 100)}% untuk ${b.name}.`,
            action: { label: 'Lihat Anggaran', route: '/more/finance' },
            priority: 'high',
            dismissable: true,
            snoozeable: true,
            snoozeMinutes: REMINDER_CONFIG.defaultSnoozeMinutes,
          })
        }
      }
    }
  } catch (e) {
    // ignore malformed monthSummary
  }

  // Goal milestone simple check (first goal at >=25%)
  for (const g of goals || []) {
    if (g.progress && g.progress >= 25 && g.progress <= 75) {
      reminders.push({
        id: `goal_${g.id}`,
        type: REMINDER_TYPES.GOAL_MILESTONE,
        title: `Goal ${g.title} ${g.progress}% tercapai`,
        message: `Kamu sudah ${g.progress}% mencapai target. Lihat detail.`,
        action: { label: 'Lihat Goal', route: '/more/goals' },
        priority: 'low',
        dismissable: true,
        snoozeable: true,
        snoozeMinutes: REMINDER_CONFIG.defaultSnoozeMinutes,
      })
    }
  }

  // Return unique reminders (dedupe by id)
  const map = new Map()
  reminders.forEach(r => map.set(r.id, r))
  return Array.from(map.values())
}
