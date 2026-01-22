import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../hooks/useAuth'
import { 
    IconChartBar, 
    IconBell, 
    IconEye, 
    IconClick, 
    IconX,
    IconTrendingUp,
    IconCalendar
} from '@tabler/icons-react'
import { format, subDays, startOfDay } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

/**
 * NotificationMetrics - Analytics dashboard for notification performance
 * 
 * Tracks:
 * - Sent notifications
 * - Opened notifications
 * - Dismissed notifications
 * - Action taken (clicked notification to open app)
 * 
 * Data source: notificationLogs collection
 */
export default function NotificationMetrics() {
    const { user } = useAuth()
    const [metrics, setMetrics] = useState({
        sent: 0,
        opened: 0,
        dismissed: 0,
        actionTaken: 0,
    })
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState(7) // days
    const [recentNotifications, setRecentNotifications] = useState([])

    useEffect(() => {
        if (!user?.uid) {
            setLoading(false)
            return
        }

        loadMetrics()
    }, [user?.uid, timeRange])

    const loadMetrics = async () => {
        setLoading(true)
        try {
            const cutoffDate = startOfDay(subDays(new Date(), timeRange))
            const logsRef = collection(db, 'notificationLogs')
            const q = query(
                logsRef,
                where('userId', '==', user.uid),
                where('sentAt', '>=', Timestamp.fromDate(cutoffDate)),
                orderBy('sentAt', 'desc'),
                limit(50)
            )

            const snapshot = await getDocs(q)
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                sentAt: doc.data().sentAt?.toDate(),
                openedAt: doc.data().openedAt?.toDate(),
                dismissedAt: doc.data().dismissedAt?.toDate(),
            }))

            // Calculate metrics
            const sent = logs.length
            const opened = logs.filter(log => log.openedAt).length
            const dismissed = logs.filter(log => log.dismissedAt && !log.openedAt).length
            const actionTaken = logs.filter(log => log.openedAt).length

            setMetrics({ sent, opened, dismissed, actionTaken })
            setRecentNotifications(logs.slice(0, 10))
        } catch (error) {
            console.error('Failed to load notification metrics:', error)
        } finally {
            setLoading(false)
        }
    }

    const getOpenRate = () => {
        if (metrics.sent === 0) return 0
        return Math.round((metrics.opened / metrics.sent) * 100)
    }

    const getEngagementRate = () => {
        if (metrics.sent === 0) return 0
        return Math.round((metrics.actionTaken / metrics.sent) * 100)
    }

    const getNotificationTypeLabel = (type) => {
        const labels = {
            bill_reminder: 'Tagihan',
            habit_reminder: 'Kebiasaan',
            journal_reminder: 'Jurnal',
            budget_warning: 'Anggaran',
            goal_milestone: 'Target Goal',
            reading_streak: 'Reading Streak',
            weekly_summary: 'Ringkasan',
        }
        return labels[type] || type
    }

    if (!user) {
        return (
            <div className="card">
                <div className="text-center py-8">
                    <IconChartBar size={48} className="mx-auto mb-4 text-ink-muted opacity-50" />
                    <p className="text-body text-ink-muted mb-4">Login untuk melihat metrik notifikasi</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="card">
                <p className="text-center text-ink-muted py-8">Memuat metrik...</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Time Range Selector */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <IconChartBar size={20} />
                        <h3 className="text-h3 text-ink">Metrik Notifikasi</h3>
                    </div>

                    <div className="flex gap-2">
                        {[7, 14, 30].map(days => (
                            <button
                                key={days}
                                onClick={() => setTimeRange(days)}
                                className={`px-3 py-1.5 rounded-lg text-small font-medium transition-colors ${
                                    timeRange === days
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-ink-muted hover:bg-surface'
                                }`}
                            >
                                {days}h
                            </button>
                        ))}
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                            <IconBell size={16} className="text-blue-600" />
                            <p className="text-small text-blue-800">Terkirim</p>
                        </div>
                        <p className="text-h2 text-blue-600">{metrics.sent}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                            <IconEye size={16} className="text-green-600" />
                            <p className="text-small text-green-800">Dibuka</p>
                        </div>
                        <p className="text-h2 text-green-600">{metrics.opened}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                            <IconX size={16} className="text-orange-600" />
                            <p className="text-small text-orange-800">Diabaikan</p>
                        </div>
                        <p className="text-h2 text-orange-600">{metrics.dismissed}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                            <IconClick size={16} className="text-purple-600" />
                            <p className="text-small text-purple-800">Aksi</p>
                        </div>
                        <p className="text-h2 text-purple-600">{metrics.actionTaken}</p>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="p-3 rounded-lg bg-surface border border-line">
                        <div className="flex items-center gap-2 mb-1">
                            <IconTrendingUp size={16} className="text-ink-muted" />
                            <p className="text-small text-ink-muted">Open Rate</p>
                        </div>
                        <p className="text-h2 text-ink">{getOpenRate()}%</p>
                    </div>

                    <div className="p-3 rounded-lg bg-surface border border-line">
                        <div className="flex items-center gap-2 mb-1">
                            <IconTrendingUp size={16} className="text-ink-muted" />
                            <p className="text-small text-ink-muted">Engagement Rate</p>
                        </div>
                        <p className="text-h2 text-ink">{getEngagementRate()}%</p>
                    </div>
                </div>
            </div>

            {/* Recent Notifications */}
            <div className="card">
                <h4 className="text-h3 text-ink mb-4">Notifikasi Terakhir</h4>

                {recentNotifications.length === 0 ? (
                    <div className="text-center py-8">
                        <IconBell size={48} className="mx-auto mb-4 text-ink-muted opacity-50" />
                        <p className="text-body text-ink-muted">Belum ada notifikasi dalam {timeRange} hari terakhir</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentNotifications.map(notif => (
                            <div key={notif.id} className="p-3 rounded-lg bg-surface border border-line">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-small font-medium">
                                                {getNotificationTypeLabel(notif.type)}
                                            </span>
                                            {notif.openedAt && (
                                                <IconEye size={14} className="text-green-600" title="Dibuka" />
                                            )}
                                            {notif.dismissedAt && !notif.openedAt && (
                                                <IconX size={14} className="text-orange-600" title="Diabaikan" />
                                            )}
                                        </div>
                                        <p className="text-body text-ink truncate">{notif.title}</p>
                                        <p className="text-small text-ink-muted flex items-center gap-1 mt-1">
                                            <IconCalendar size={12} />
                                            {format(notif.sentAt, 'd MMM yyyy, HH:mm', { locale: idLocale })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
