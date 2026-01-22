/**
 * AchievementGrid - Badge collection with unlocked/locked state
 */

import { IconTrophy } from '@tabler/icons-react'

export default function AchievementGrid({ achievements = [], onSelect }) {
    const unlockedCount = achievements.filter(a => a.unlocked).length

    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <IconTrophy size={20} className="text-warning" />
                    <span className="text-body font-medium text-ink">Achievements</span>
                </div>
                <span className="text-small text-ink-muted">
                    {unlockedCount}/{achievements.length}
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {achievements.map(ach => {
                    const progressPercent = Math.min(100, Math.round((ach.progress / ach.target) * 100))

                    return (
                        <button
                            key={ach.id}
                            type="button"
                            className={`
                                achievement-item p-3 rounded-xl text-center transition-all
                                ${ach.unlocked
                                    ? 'bg-warning/10 border-2 border-warning/30'
                                    : 'bg-paper-warm border border-line opacity-60'
                                }
                            `}
                            onClick={() => onSelect?.(ach)}
                        >
                            <div className="text-2xl mb-1">
                                {ach.unlocked ? '🌟' : '⭕'}
                            </div>
                            <div className="text-tiny font-medium text-ink line-clamp-1">
                                {ach.name}
                            </div>
                            {!ach.unlocked && (
                                <div className="mt-1">
                                    <div className="h-1 bg-paper-warm rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary/50 rounded-full"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="text-tiny text-ink-muted mt-0.5">
                                        {progressPercent}%
                                    </div>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
