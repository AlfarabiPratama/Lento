import { IconBell, IconClock, IconMoon, IconTarget, IconBook, IconPlayerPlay } from '@tabler/icons-react'
import { useNotificationSettings } from '../../hooks/useNotificationSettings'
import { useAuth } from '../../hooks/useAuth'

/**
 * NotificationSettings - Complete notification configuration
 * 
 * Features:
 * - Bill reminders (3-day, 1-day)
 * - Goal milestone reminders (7-day, 3-day, 1-day)
 * - Reading streak reminders (encouragement, milestones, re-engagement)
 * - Pomodoro timer notifications (work complete, break complete)
 * - Quiet hours configuration
 */
export function NotificationSettings() {
    const { user } = useAuth()
    const {
        settings,
        loading,
        toggleBillReminders,
        toggleBillReminder,
        toggleGoalReminders,
        toggleGoalReminder,
        toggleReadingStreakReminders,
        toggleReadingStreakReminder,
        togglePomodoroNotifications,
        togglePomodoroNotification,
        toggleQuietHours,
        updateQuietHours
    } = useNotificationSettings()

    if (!user) {
        return (
            <section className="card">
                <div className="flex items-center gap-2 mb-4">
                    <IconBell size={20} />
                    <h2 className="text-h2 text-ink">Pengingat & Notifikasi</h2>
                </div>
                <p className="text-body text-ink-muted">Login untuk mengaktifkan pengingat</p>
            </section>
        )
    }

    if (loading) {
        return (
            <section className="card">
                <div className="flex items-center gap-2 mb-4">
                    <IconBell size={20} />
                    <h2 className="text-h2 text-ink">Pengingat & Notifikasi</h2>
                </div>
                <p className="text-body text-ink-muted">Memuat...</p>
            </section>
        )
    }

    const handleQuietHoursChange = (field, value) => {
        if (field === 'start') {
            updateQuietHours(value, settings.quietHours.endTime)
        } else {
            updateQuietHours(settings.quietHours.startTime, value)
        }
    }

    return (
        <section id="notifications" className="card space-y-4">
            <div className="flex items-center gap-2">
                <IconBell size={20} />
                <h2 className="text-h2 text-ink">Pengingat & Notifikasi</h2>
            </div>

            <div className="space-y-6">
                {/* Bill Reminders */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <IconBell size={18} className="text-ink-muted" />
                        <h3 className="text-h3 text-ink">Tagihan</h3>
                    </div>

                    <div className="pl-6 space-y-3">
                        {/* Master toggle */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-body text-ink">Pengingat Tagihan</p>
                                <p className="text-small text-ink-muted">Notifikasi jatuh tempo tagihan</p>
                            </div>
                            <button
                                onClick={toggleBillReminders}
                                className={`btn-sm flex-shrink-0 ${settings.billReminders.enabled ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {settings.billReminders.enabled ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>

                        {/* Individual toggles */}
                        {settings.billReminders.enabled && (
                            <div className="pl-4 space-y-3 border-l-2 border-line">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">3 Hari Sebelumnya</p>
                                        <p className="text-small text-ink-muted">Pengingat awal</p>
                                    </div>
                                    <button
                                        onClick={() => toggleBillReminder('threeDayBefore')}
                                        className={`btn-sm flex-shrink-0 ${settings.billReminders.threeDayBefore ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.billReminders.threeDayBefore ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">1 Hari Sebelumnya</p>
                                        <p className="text-small text-ink-muted">Pengingat mendesak</p>
                                    </div>
                                    <button
                                        onClick={() => toggleBillReminder('oneDayBefore')}
                                        className={`btn-sm flex-shrink-0 ${settings.billReminders.oneDayBefore ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.billReminders.oneDayBefore ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Goal Reminders */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <IconTarget size={18} className="text-ink-muted" />
                        <h3 className="text-h3 text-ink">Target & Goal</h3>
                    </div>

                    <div className="pl-6 space-y-3">
                        {/* Master toggle */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-body text-ink">Pengingat Goal</p>
                                <p className="text-small text-ink-muted">Notifikasi mendekati deadline</p>
                            </div>
                            <button
                                onClick={toggleGoalReminders}
                                className={`btn-sm flex-shrink-0 ${settings.goalReminders.enabled ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {settings.goalReminders.enabled ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>

                        {/* Individual toggles */}
                        {settings.goalReminders.enabled && (
                            <div className="pl-4 space-y-3 border-l-2 border-line">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">7 Hari Sebelumnya</p>
                                        <p className="text-small text-ink-muted">Pengingat awal</p>
                                    </div>
                                    <button
                                        onClick={() => toggleGoalReminder('sevenDayBefore')}
                                        className={`btn-sm flex-shrink-0 ${settings.goalReminders.sevenDayBefore ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.goalReminders.sevenDayBefore ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">3 Hari Sebelumnya</p>
                                        <p className="text-small text-ink-muted">Pengingat lanjutan</p>
                                    </div>
                                    <button
                                        onClick={() => toggleGoalReminder('threeDayBefore')}
                                        className={`btn-sm flex-shrink-0 ${settings.goalReminders.threeDayBefore ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.goalReminders.threeDayBefore ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">1 Hari Sebelumnya</p>
                                        <p className="text-small text-ink-muted">Pengingat mendesak</p>
                                    </div>
                                    <button
                                        onClick={() => toggleGoalReminder('oneDayBefore')}
                                        className={`btn-sm flex-shrink-0 ${settings.goalReminders.oneDayBefore ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.goalReminders.oneDayBefore ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reading Streak Reminders */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <IconBook size={18} className="text-ink-muted" />
                        <h3 className="text-h3 text-ink">Reading Streak</h3>
                    </div>

                    <div className="pl-6 space-y-3">
                        {/* Master toggle */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-body text-ink">Pengingat Streak</p>
                                <p className="text-small text-ink-muted">Motivasi & pencapaian</p>
                            </div>
                            <button
                                onClick={toggleReadingStreakReminders}
                                className={`btn-sm flex-shrink-0 ${settings.readingStreakReminders.enabled ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {settings.readingStreakReminders.enabled ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>

                        {/* Individual toggles */}
                        {settings.readingStreakReminders.enabled && (
                            <div className="pl-4 space-y-3 border-l-2 border-line">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">Encouragement</p>
                                        <p className="text-small text-ink-muted">Semangat untuk streak aktif</p>
                                    </div>
                                    <button
                                        onClick={() => toggleReadingStreakReminder('encouragement')}
                                        className={`btn-sm flex-shrink-0 ${settings.readingStreakReminders.encouragement ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.readingStreakReminders.encouragement ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">Milestones</p>
                                        <p className="text-small text-ink-muted">Rayakan pencapaian</p>
                                    </div>
                                    <button
                                        onClick={() => toggleReadingStreakReminder('milestones')}
                                        className={`btn-sm flex-shrink-0 ${settings.readingStreakReminders.milestones ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.readingStreakReminders.milestones ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">Re-engagement</p>
                                        <p className="text-small text-ink-muted">Ajakan mulai lagi</p>
                                    </div>
                                    <button
                                        onClick={() => toggleReadingStreakReminder('reEngagement')}
                                        className={`btn-sm flex-shrink-0 ${settings.readingStreakReminders.reEngagement ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.readingStreakReminders.reEngagement ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pomodoro Notifications */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <IconPlayerPlay size={18} className="text-ink-muted" />
                        <h3 className="text-h3 text-ink">Pomodoro Timer</h3>
                    </div>

                    <div className="pl-6 space-y-3">
                        {/* Master toggle */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-body text-ink">Notifikasi Timer</p>
                                <p className="text-small text-ink-muted">Notifikasi saat sesi selesai</p>
                            </div>
                            <button
                                onClick={togglePomodoroNotifications}
                                className={`btn-sm flex-shrink-0 ${settings.pomodoroNotifications?.enabled ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                {settings.pomodoroNotifications?.enabled ? 'Aktif' : 'Nonaktif'}
                            </button>
                        </div>

                        {/* Individual toggles */}
                        {settings.pomodoroNotifications?.enabled && (
                            <div className="pl-4 space-y-3 border-l-2 border-line">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">Sesi Fokus Selesai</p>
                                        <p className="text-small text-ink-muted">Waktunya istirahat</p>
                                    </div>
                                    <button
                                        onClick={() => togglePomodoroNotification('workComplete')}
                                        className={`btn-sm flex-shrink-0 ${settings.pomodoroNotifications?.workComplete ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.pomodoroNotifications?.workComplete ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-body text-ink">Break Selesai</p>
                                        <p className="text-small text-ink-muted">Siap fokus lagi</p>
                                    </div>
                                    <button
                                        onClick={() => togglePomodoroNotification('breakComplete')}
                                        className={`btn-sm flex-shrink-0 ${settings.pomodoroNotifications?.breakComplete ? 'btn-primary' : 'btn-secondary'}`}
                                    >
                                        {settings.pomodoroNotifications?.breakComplete ? 'Aktif' : 'Nonaktif'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-line" />

                {/* Quiet Hours */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                            <IconMoon size={18} className="text-ink-muted" />
                            <div>
                                <p className="text-body text-ink">Quiet Hours</p>
                                <p className="text-small text-ink-muted">Jeda notifikasi</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleQuietHours}
                            className={`btn-sm flex-shrink-0 ${settings.quietHours.enabled ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            {settings.quietHours.enabled ? 'Aktif' : 'Nonaktif'}
                        </button>
                    </div>

                    {settings.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-2 pl-4">
                            <label className="flex flex-col gap-1">
                                <span className="text-small text-ink-muted flex items-center gap-1">
                                    <IconClock size={14} /> Mulai
                                </span>
                                <input
                                    type="time"
                                    value={settings.quietHours.startTime}
                                    onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                                    className="input"
                                />
                            </label>
                            <label className="flex flex-col gap-1">
                                <span className="text-small text-ink-muted flex items-center gap-1">
                                    <IconClock size={14} /> Selesai
                                </span>
                                <input
                                    type="time"
                                    value={settings.quietHours.endTime}
                                    onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                                    className="input"
                                />
                            </label>
                        </div>
                    )}
                </div>

                <div className="bg-surface/50 rounded-lg p-3 space-y-1">
                    <p className="text-small text-ink-muted">
                        💡 <strong>Tips:</strong> Aktifkan notifikasi di pengaturan perangkat untuk menerima pengingat tagihan
                    </p>
                </div>
            </div>
        </section>
    )
}
