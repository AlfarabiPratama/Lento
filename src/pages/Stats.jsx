/**
 * Stats - Dashboard statistik dengan visualisasi XP dan aktivitas
 */

import { IconChartBar } from '@tabler/icons-react'
import { useStats } from '../hooks/useStats'
import XPCard from '../components/stats/XPCard'
import ActivityHeatmap from '../components/stats/ActivityHeatmap'
import WeeklyChart from '../components/stats/WeeklyChart'
import AchievementGrid from '../components/stats/AchievementGrid'

export default function Stats() {
    const {
        lifetimeXP,
        currentLevel,
        levelProgress,
        weeklyActivity,
        yearlyActivity,
        achievements,
        loading,
    } = useStats()

    if (loading) {
        return (
            <div className="space-y-6 animate-in">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-32 bg-paper-warm rounded animate-pulse" />
                </div>
                <div className="widget-primary h-40 bg-paper-warm animate-pulse" />
                <div className="card h-32 bg-paper-warm animate-pulse" />
                <div className="card h-40 bg-paper-warm animate-pulse" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in w-full min-w-0 overflow-x-hidden">
            {/* Header */}
            <header className="flex items-center gap-3">
                <IconChartBar size={28} className="text-primary" />
                <div>
                    <h1 className="text-h1 text-ink">Statistik</h1>
                    <p className="text-small text-ink-muted">Pantau progress perjalananmu</p>
                </div>
            </header>

            {/* XP Card */}
            <section>
                <XPCard
                    lifetimeXP={lifetimeXP}
                    currentLevel={currentLevel}
                    levelProgress={levelProgress}
                />
            </section>

            {/* Activity Heatmap */}
            <section>
                <h2 className="text-overline mb-2">Aktivitas 52 Minggu</h2>
                <ActivityHeatmap yearlyActivity={yearlyActivity} />
            </section>

            {/* Weekly Chart */}
            <section>
                <h2 className="text-overline mb-2">Minggu Ini</h2>
                <WeeklyChart weeklyActivity={weeklyActivity} />
            </section>

            {/* Achievements */}
            <section>
                <AchievementGrid achievements={achievements} />
            </section>
        </div>
    )
}
