import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconFocus2, IconClock, IconBell, IconVolume } from '@tabler/icons-react'
import { usePomodoroSettings, useTodayPomodoro } from '../hooks/usePomodoro'
import PomodoroTimer from '../components/PomodoroTimer'

/**
 * Fokus page - Pomodoro settings and full-page timer in More
 */
function Fokus() {
    const navigate = useNavigate()
    const { settings, updateSettings } = usePomodoroSettings()
    const { sessionCount, focusMinutes } = useTodayPomodoro()

    const [showTimer, setShowTimer] = useState(false)

    const handleDurationChange = (key, value) => {
        updateSettings({ [key]: parseInt(value) })
    }

    return (
        <div className="space-y-6 animate-in">
            {/* Header */}
            <header className="flex items-center gap-3">
                <button onClick={() => navigate('/more')} className="btn-icon" aria-label="Kembali">
                    <IconArrowLeft size={20} stroke={2} />
                </button>
                <div className="flex-1">
                    <h1 className="text-h1 text-ink">Fokus</h1>
                    <p className="text-small text-ink-muted">Pengaturan Pomodoro</p>
                </div>
            </header>

            {/* Today's stats */}
            <div className="card bg-primary-50/50 border-primary-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <IconFocus2 size={24} stroke={1.5} className="text-primary" />
                        <div>
                            <p className="text-h3 text-ink">Hari ini</p>
                            <p className="text-small text-ink-muted">
                                {sessionCount} sesi • {focusMinutes} menit fokus
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowTimer(true)} className="btn-primary">
                        Mulai Fokus
                    </button>
                </div>
            </div>

            {/* Timer full page */}
            {showTimer && (
                <PomodoroTimer onClose={() => setShowTimer(false)} />
            )}

            {/* Duration settings */}
            <section className="card space-y-4">
                <div className="flex items-center gap-2">
                    <IconClock size={20} stroke={1.5} className="text-ink-muted" />
                    <h2 className="text-h2 text-ink">Durasi</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-h3 text-ink">Sesi fokus</p>
                            <p className="text-small text-ink-muted">Durasi fokus sebelum istirahat</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={settings.work_duration}
                                onChange={(e) => handleDurationChange('work_duration', e.target.value)}
                                min="1"
                                max="60"
                                className="input w-20 text-center"
                            />
                            <span className="text-small text-ink-muted">menit</span>
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-h3 text-ink">Istirahat pendek</p>
                            <p className="text-small text-ink-muted">Setelah setiap sesi fokus</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={settings.short_break}
                                onChange={(e) => handleDurationChange('short_break', e.target.value)}
                                min="1"
                                max="30"
                                className="input w-20 text-center"
                            />
                            <span className="text-small text-ink-muted">menit</span>
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-h3 text-ink">Istirahat panjang</p>
                            <p className="text-small text-ink-muted">Setelah {settings.sessions_until_long_break} sesi fokus</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={settings.long_break}
                                onChange={(e) => handleDurationChange('long_break', e.target.value)}
                                min="1"
                                max="60"
                                className="input w-20 text-center"
                            />
                            <span className="text-small text-ink-muted">menit</span>
                        </div>
                    </div>

                    <div className="divider" />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-h3 text-ink">Sesi hingga istirahat panjang</p>
                            <p className="text-small text-ink-muted">Jumlah sesi fokus sebelum long break</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={settings.sessions_until_long_break}
                                onChange={(e) => handleDurationChange('sessions_until_long_break', e.target.value)}
                                min="2"
                                max="8"
                                className="input w-20 text-center"
                            />
                            <span className="text-small text-ink-muted">sesi</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications info */}
            <section className="card">
                <div className="flex items-start gap-3">
                    <IconBell size={20} stroke={1.5} className="text-ink-muted mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-h3 text-ink">Notifikasi Timer</h3>
                        <p className="text-small text-ink-muted mt-1">
                            Lento akan mengirim notifikasi saat sesi fokus atau break selesai.
                        </p>
                        <button
                            onClick={() => {
                                const params = new URLSearchParams({ tab: 'tampilan' })
                                window.location.href = `/settings?${params.toString()}`
                            }}
                            className="btn-secondary btn-sm mt-3"
                        >
                            Atur di Settings →
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Fokus
