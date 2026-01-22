/**
 * QuestList - Today's quests section component
 * 
 * Displays all quests for today with summary header.
 * Collapsible for non-intrusive UX.
 * Supports reroll (1x/day) for non-mandatory quests.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { IconChevronDown, IconChevronUp, IconStar, IconTrophy, IconSparkles, IconCalendarWeek, IconAward } from '@tabler/icons-react'
import { useQuests } from '../useQuests'
import { QuestCard } from './QuestCard'
import { WeeklyQuestCard } from './WeeklyQuestCard'
import { canReroll, executeReroll, getDailyAssignment, getInstallId } from '../questStorage'
import { pickRerollReplacement, buildParamsForQuest } from '../questEngine'
import { useToast } from '../../../contexts/ToastContext'
import { Confetti } from '../../../components/ui/Confetti'

// Simple LCG for deterministic RNG
function createRng(seed) {
    let s = seed >>> 0
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

export function QuestList() {
    const {
        quests, stats, completedCount, totalXP, allCompleted,
        weeklyQuests, weeklyCompletedCount, weeklyTotalXP, allWeeklyCompleted,
        lifetimeXP, achievementStats, newAchievements, clearNewAchievements
    } = useQuests()
    const { showToast } = useToast()
    const [collapsed, setCollapsed] = useState(false)
    const [tick, setTick] = useState(0)
    const [showConfetti, setShowConfetti] = useState(false)
    const prevAllCompleted = useRef(false)

    const rerollAvailable = canReroll(stats.todayKey)

    // Show toast when new achievement unlocked
    useEffect(() => {
        if (newAchievements.length > 0) {
            newAchievements.forEach(ach => {
                showToast('success', `🏆 Achievement Unlocked: ${ach.badge} ${ach.title}`)
            })
            clearNewAchievements()
        }
    }, [newAchievements, showToast, clearNewAchievements])

    // Trigger confetti when all daily quests completed
    useEffect(() => {
        if (allCompleted && !prevAllCompleted.current) {
            setShowConfetti(true)
        }
        prevAllCompleted.current = allCompleted
    }, [allCompleted])

    // Mark mandatory quests (journal_write is mandatory)
    const enrichedQuests = useMemo(() => {
        return quests.map(q => ({
            ...q,
            mandatory: q.id === 'journal_write',
        }))
    }, [quests, tick])

    const handleReroll = useCallback((quest) => {
        if (!rerollAvailable) return
        if (quest.mandatory) return
        if (quest.completed) return
        if ((quest.progress?.current ?? 0) !== 0) return

        const assignment = getDailyAssignment(stats.todayKey)
        if (!assignment) return

        const installId = getInstallId()
        const assignedIds = assignment.chosen.map(x => x.id)

        // Deterministic pick for replacement
        const replacementId = pickRerollReplacement({
            todayKey: stats.todayKey,
            installId,
            assignmentSeed: assignment.seed ?? 0,
            assignedQuestIds: assignedIds,
            stats,
        })

        if (!replacementId) {
            showToast('warning', 'Tidak ada quest pengganti yang tersedia')
            return
        }

        // Build params for new quest
        const rng = createRng((assignment.seed ?? 0) + 1337)
        const params = buildParamsForQuest(replacementId, stats, rng)

        const ok = executeReroll(stats.todayKey, quest.id, replacementId, params)
        if (ok) {
            setTick(x => x + 1) // Force re-render
            showToast('success', '🔄 Quest berhasil diganti!')
        } else {
            showToast('error', 'Gagal mengganti quest')
        }
    }, [rerollAvailable, stats, showToast])

    if (quests.length === 0) {
        return null
    }

    return (
        <section className="space-y-3">
            {/* Confetti celebration when all quests completed */}
            <Confetti
                show={showConfetti}
                duration={4000}
                onComplete={() => setShowConfetti(false)}
            />

            {/* Header */}
            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-between py-2 text-left group"
                aria-expanded={!collapsed}
            >
                <div className="flex items-center gap-2">
                    {allCompleted ? (
                        <IconTrophy size={20} className="text-warning" />
                    ) : (
                        <IconStar size={20} className="text-primary" />
                    )}
                    <h2 className="text-h2 text-ink">Misi Harian</h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* Reroll status */}
                    {!rerollAvailable && !collapsed && (
                        <span className="text-tiny text-ink-muted">Reroll terpakai</span>
                    )}

                    {/* Progress summary */}
                    <span className={`
            text-small font-medium px-2 py-0.5 rounded-lg
            ${allCompleted
                            ? 'bg-success/10 text-success'
                            : 'bg-paper-warm text-ink-muted'
                        }
          `}>
                        {completedCount}/{quests.length} • +{totalXP} XP
                    </span>

                    {/* Chevron */}
                    <span className="text-ink-muted group-hover:text-ink transition-colors">
                        {collapsed ? (
                            <IconChevronDown size={20} />
                        ) : (
                            <IconChevronUp size={20} />
                        )}
                    </span>
                </div>
            </button>

            {/* Quest cards */}
            {!collapsed && (
                <div className="space-y-4">
                    {/* Weekly Quests Section */}
                    {weeklyQuests.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <IconCalendarWeek size={16} className="text-primary" />
                                <span className="text-overline">Quest Mingguan</span>
                                {allWeeklyCompleted && (
                                    <span className="text-tiny text-success">✓ Selesai</span>
                                )}
                            </div>
                            {weeklyQuests.map(quest => (
                                <WeeklyQuestCard key={quest.id} quest={quest} />
                            ))}
                        </div>
                    )}

                    {/* Daily Quests Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <IconStar size={16} className="text-primary" />
                            <span className="text-overline">Quest Harian</span>
                        </div>
                        {enrichedQuests.map(quest => (
                            <QuestCard
                                key={quest.id}
                                quest={quest}
                                canReroll={rerollAvailable}
                                onReroll={handleReroll}
                            />
                        ))}
                    </div>

                    {/* All completed celebration with Lifetime XP & Achievements */}
                    {allCompleted && (
                        <div className="text-center py-4 space-y-3">
                            <p className="text-body text-success font-medium">
                                🎉 Semua quest harian selesai! Great job!
                            </p>
                            <p className="text-tiny text-ink-muted">
                                Quest baru akan muncul besok
                            </p>

                            {/* Stats row */}
                            <div className="flex justify-center gap-4 mt-3">
                                {lifetimeXP > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10">
                                        <IconSparkles size={14} className="text-primary" />
                                        <span className="text-small font-medium text-primary">
                                            {lifetimeXP.toLocaleString()} XP
                                        </span>
                                    </div>
                                )}
                                {achievementStats.unlocked > 0 && (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10">
                                        <IconAward size={14} className="text-warning" />
                                        <span className="text-small font-medium text-warning">
                                            {achievementStats.unlocked}/{achievementStats.total} Badge
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export default QuestList
