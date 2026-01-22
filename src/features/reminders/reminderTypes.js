export const REMINDER_TYPES = {
  HABIT_UNCHECKED: 'habit_unchecked',
  JOURNAL_EMPTY: 'journal_empty',
  BUDGET_WARNING: 'budget_warning',
  POMODORO_IDLE: 'pomodoro_idle',
  GOAL_MILESTONE: 'goal_milestone',
}

// Minimal reminder shape documented in docs
// {
//   id, type, title, message, action: { label, route }, priority, dismissable, snoozeable, snoozeMinutes
// }
